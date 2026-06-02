-- ==========================================
-- STATS DES ARTICLES
-- ==========================================

-- 1. Ajout du compteur global sur les posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- 2. Table pour l'historique de vues quotidien
CREATE TABLE IF NOT EXISTS public.post_views_daily (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  day_date date not null default current_date,
  view_count integer not null default 0,
  unique(post_id, day_date)
);

-- 3. Fonction pour incrémenter les vues (à appeler depuis le client quand on lit un article)
CREATE OR REPLACE FUNCTION public.increment_post_view(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Incrémente le global
  UPDATE public.posts SET view_count = view_count + 1 WHERE id = p_post_id;
  
  -- Incrémente / Insère le journalier
  INSERT INTO public.post_views_daily (post_id, day_date, view_count)
  VALUES (p_post_id, current_date, 1)
  ON CONFLICT (post_id, day_date) 
  DO UPDATE SET view_count = post_views_daily.view_count + 1;
END;
$$;

-- 4. Fonction pour récupérer les 30 derniers jours de stats globales
CREATE OR REPLACE FUNCTION public.get_global_daily_metrics(days_param int default 30)
RETURNS TABLE (day_date text, views bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(d.d, 'YYYY-MM-DD') as day_date,
    coalesce(sum(v.view_count), 0)::bigint as views
  FROM generate_series(
    current_date - (days_param - 1) * interval '1 day',
    current_date,
    interval '1 day'
  ) d(d)
  LEFT JOIN public.post_views_daily v ON v.day_date = d.d::date
  GROUP BY d.d
  ORDER BY d.d ASC;
END;
$$;

-- RLS sur post_views_daily
ALTER TABLE public.post_views_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lecture public_views_daily_admin" ON public.post_views_daily FOR SELECT TO authenticated USING (public.can_manage_content());


-- ==========================================
-- SYSTEME DE STORY BUBBLES ("ACTU RAPIDE")
-- Inspiré d'Eurosport / Instagram
-- ==========================================

-- A. Groupes de stories (Les "Bulles" Instagram / Eurosport, ex: "Le Mercato du jour", "Ligue 1")
CREATE TABLE IF NOT EXISTS public.story_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,               -- Le petit nom sous la bulle
  cover_image_url text not null,     -- L'image de la bulle
  is_active boolean default true,    -- Si la bulle est affichée en ce moment
  sort_order int default 0,          -- Ordre d'affichage
  created_at timestamptz not null default now(),
  expires_at timestamptz             -- Optionnel: une bulle peut expirer au bout de 24h
);

-- B. Les slides/stories à l'intérieur d'un groupe (quand on clique la bulle)
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.story_groups(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  media_url text not null,
  title text,                        -- Le grand titre (ex: "Mbappé au Real")
  body_text text,                    -- Le sous-texte ou petit paragraphe rapide
  link_url text,                     -- Lien "Read more" / Swipe up
  sort_order int not null default 0, -- L'ordre de la slide
  created_at timestamptz not null default now()
);

-- RLS Stories...
ALTER TABLE public.story_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lecture_story_groups_public" ON public.story_groups FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "write_story_groups_admin" ON public.story_groups FOR ALL TO authenticated USING (public.can_manage_content()) WITH CHECK (public.can_manage_content());

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lecture_stories_public" ON public.stories FOR SELECT USING (true); -- on peut joindre avec group_id pour valider c'est actif
CREATE POLICY "write_stories_admin" ON public.stories FOR ALL TO authenticated USING (public.can_manage_content()) WITH CHECK (public.can_manage_content());

