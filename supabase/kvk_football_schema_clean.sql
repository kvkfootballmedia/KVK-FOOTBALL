-- ============================================================
-- KVK FOOTBALL — SCHEMA PROPRE (foot international / media)
-- Ordre : extensions → set_updated_at → profiles → fonctions rôles → tables → triggers → index → RLS
-- Tables supprimées vs ancien schéma :
--   countries, competitions, teams, players, matches,
--   player_match_stats, standings, comments (remplacée par post_comments)
-- ============================================================

BEGIN;

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 2. FONCTION TRIGGER UNIQUEMENT (pas de dépendance sur tables)
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. TABLES (ordre de dépendance)
-- ============================================================

-- ── 3.1 profiles (étend auth.users) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text        UNIQUE,
  full_name  text,
  role       text        NOT NULL DEFAULT 'author'
                         CHECK (role IN ('admin','editor','author')),
  avatar_url text,
  bio        text,
  twitter_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-création du profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonctions de rôle (après profiles — LANGUAGE sql valide les refs au CREATE)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'anonymous'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE
AS $$ SELECT public.current_user_role() = 'admin'; $$;

CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS boolean LANGUAGE sql STABLE
AS $$ SELECT public.current_user_role() = 'editor'; $$;

CREATE OR REPLACE FUNCTION public.is_author()
RETURNS boolean LANGUAGE sql STABLE
AS $$ SELECT public.current_user_role() = 'author'; $$;

CREATE OR REPLACE FUNCTION public.can_manage_content()
RETURNS boolean LANGUAGE sql STABLE
AS $$ SELECT public.is_admin() OR public.is_editor(); $$;

-- ── 3.2 categories ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL UNIQUE,
  slug        text        NOT NULL UNIQUE,
  description text,
  icon_url    text,
  color_hex   text        DEFAULT '#000000',
  sort_order  int         DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 3.3 tags ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tags (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL UNIQUE,
  slug       text        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 3.4 leagues (championnats internationaux) ────────────────
-- Données locales légères : le vrai contenu vient de l'API football.
-- api_id : identifiant côté API externe (ex: "2" pour Champions League)
CREATE TABLE IF NOT EXISTS public.leagues (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL UNIQUE,
  slug       text        NOT NULL UNIQUE,
  api_id     text        NOT NULL,          -- id dans l'API football externe
  category   text,                          -- ex: 'UEFA', 'CONMEBOL', 'Afrique'
  logo_url   text,
  is_active  boolean     DEFAULT true,
  sort_order int         DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_leagues_updated_at ON public.leagues;
CREATE TRIGGER trg_leagues_updated_at
  BEFORE UPDATE ON public.leagues
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3.5 story_groups (bulles Instagram style) ───────────────
CREATE TABLE IF NOT EXISTS public.story_groups (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL,
  cover_image_url text        NOT NULL,
  is_active       boolean     DEFAULT true,
  sort_order      int         DEFAULT 0,
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── 3.6 stories (slides d'un groupe) ────────────────────────
CREATE TABLE IF NOT EXISTS public.stories (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   uuid        NOT NULL REFERENCES public.story_groups(id) ON DELETE CASCADE,
  media_type text        NOT NULL CHECK (media_type IN ('image','video')),
  media_url  text        NOT NULL,
  title      text,
  body_text  text,
  link_url   text,
  sort_order int         NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 3.7 posts (articles) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id                    uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text             NOT NULL,
  slug                  text             NOT NULL UNIQUE,
  excerpt               text,
  featured_image        text,
  status                text             NOT NULL DEFAULT 'draft'
                                         CHECK (status IN ('draft','review','published','archived')),
  author_id             uuid             NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  category_id           uuid             REFERENCES public.categories(id) ON DELETE SET NULL,
  published_at          timestamptz,
  is_featured           boolean          DEFAULT false,
  has_video             boolean          NOT NULL DEFAULT false,
  view_count            int              NOT NULL DEFAULT 0,
  reading_time          int,
  meta_title            text,
  meta_description      text,
  featured_image_focal_x double precision DEFAULT 50,
  featured_image_focal_y double precision DEFAULT 50,
  created_at            timestamptz      NOT NULL DEFAULT now(),
  updated_at            timestamptz      NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.posts;
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3.8 post_tags (N-N posts ↔ tags) ────────────────────────
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id    uuid        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id     uuid        NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, tag_id)
);

-- ── 3.9 post_blocks (éditeur de blocs) ──────────────────────
CREATE TABLE IF NOT EXISTS public.post_blocks (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid    NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  block_type text    NOT NULL
             CHECK (block_type IN ('paragraph','heading','image','quote','list','embed','html','short_video')),
  content    jsonb   NOT NULL DEFAULT '{}'::jsonb,
  caption    text,
  position   int     NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger : synchronise posts.has_video selon les blocs short_video
CREATE OR REPLACE FUNCTION public.sync_post_has_video()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.posts
  SET has_video = EXISTS (
    SELECT 1 FROM public.post_blocks
    WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
      AND block_type = 'short_video'
  )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_blocks_sync_has_video ON public.post_blocks;
CREATE TRIGGER trg_post_blocks_sync_has_video
  AFTER INSERT OR DELETE ON public.post_blocks
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_has_video();

-- ── 3.10 post_comments (commentaires) ───────────────────────
CREATE TABLE IF NOT EXISTS public.post_comments (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 3.11 post_views_daily (stats quotidiennes) ──────────────
CREATE TABLE IF NOT EXISTS public.post_views_daily (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid    NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  day_date   date    NOT NULL DEFAULT CURRENT_DATE,
  view_count int     NOT NULL DEFAULT 0,
  UNIQUE (post_id, day_date)
);

-- ============================================================
-- 4. FONCTIONS ANALYTIQUES (après les tables)
-- ============================================================

-- Incrémente les vues d'un article (global + journalier)
CREATE OR REPLACE FUNCTION public.increment_post_view(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts SET view_count = view_count + 1 WHERE id = p_post_id;

  INSERT INTO public.post_views_daily (post_id, day_date, view_count)
  VALUES (p_post_id, CURRENT_DATE, 1)
  ON CONFLICT (post_id, day_date)
  DO UPDATE SET view_count = post_views_daily.view_count + 1;
END;
$$;

-- Retourne les métriques globales des N derniers jours
CREATE OR REPLACE FUNCTION public.get_global_daily_metrics(days_param int DEFAULT 30)
RETURNS TABLE (day_date text, views bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(d.d, 'YYYY-MM-DD'),
    COALESCE(SUM(v.view_count), 0)::bigint
  FROM generate_series(
    CURRENT_DATE - (days_param - 1) * INTERVAL '1 day',
    CURRENT_DATE,
    INTERVAL '1 day'
  ) d(d)
  LEFT JOIN public.post_views_daily v ON v.day_date = d.d::date
  GROUP BY d.d
  ORDER BY d.d ASC;
END;
$$;

-- ============================================================
-- 5. INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_posts_status_published_at  ON public.posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id            ON public.posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id          ON public.posts (category_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured          ON public.posts (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id           ON public.post_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_post_blocks_post_position  ON public.post_blocks (post_id, position);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id      ON public.post_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_daily_post_date ON public.post_views_daily (post_id, day_date DESC);
CREATE INDEX IF NOT EXISTS idx_stories_group_sort         ON public.stories (group_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_leagues_slug               ON public.leagues (slug);
CREATE INDEX IF NOT EXISTS idx_leagues_active             ON public.leagues (is_active) WHERE is_active = true;

-- ============================================================
-- 6. RLS — ACTIVATION
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_groups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_blocks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views_daily  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. RLS — POLITIQUES
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_public"  ON public.profiles;
CREATE POLICY "profiles_select_public"  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_no_insert" ON public.profiles;
CREATE POLICY "profiles_no_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (false); -- géré uniquement par handle_new_user()

DROP POLICY IF EXISTS "profiles_no_delete" ON public.profiles;
CREATE POLICY "profiles_no_delete" ON public.profiles FOR DELETE TO authenticated
  USING (false);

-- ── categories ───────────────────────────────────────────────
DROP POLICY IF EXISTS "categories_select_public" ON public.categories;
CREATE POLICY "categories_select_public" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "categories_write_admin_editor" ON public.categories;
CREATE POLICY "categories_write_admin_editor" ON public.categories FOR ALL TO authenticated
  USING (public.can_manage_content()) WITH CHECK (public.can_manage_content());

-- ── tags ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "tags_select_public" ON public.tags;
CREATE POLICY "tags_select_public" ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "tags_write_admin_editor" ON public.tags;
CREATE POLICY "tags_write_admin_editor" ON public.tags FOR ALL TO authenticated
  USING (public.can_manage_content()) WITH CHECK (public.can_manage_content());

-- ── leagues ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "leagues_select_public" ON public.leagues;
CREATE POLICY "leagues_select_public" ON public.leagues FOR SELECT USING (true);

DROP POLICY IF EXISTS "leagues_write_admin_editor" ON public.leagues;
CREATE POLICY "leagues_write_admin_editor" ON public.leagues FOR ALL TO authenticated
  USING (public.can_manage_content()) WITH CHECK (public.can_manage_content());

-- ── story_groups ─────────────────────────────────────────────
DROP POLICY IF EXISTS "story_groups_select_public" ON public.story_groups;
CREATE POLICY "story_groups_select_public" ON public.story_groups FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

DROP POLICY IF EXISTS "story_groups_write_admin_editor" ON public.story_groups;
CREATE POLICY "story_groups_write_admin_editor" ON public.story_groups FOR ALL TO authenticated
  USING (public.can_manage_content()) WITH CHECK (public.can_manage_content());

-- Admin peut aussi lire les groupes inactifs
DROP POLICY IF EXISTS "story_groups_select_admin" ON public.story_groups;
CREATE POLICY "story_groups_select_admin" ON public.story_groups FOR SELECT TO authenticated
  USING (public.can_manage_content());

-- ── stories ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "stories_select_public" ON public.stories;
CREATE POLICY "stories_select_public" ON public.stories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.story_groups g
      WHERE g.id = stories.group_id
        AND g.is_active = true
        AND (g.expires_at IS NULL OR g.expires_at > now())
    )
  );

DROP POLICY IF EXISTS "stories_write_admin_editor" ON public.stories;
CREATE POLICY "stories_write_admin_editor" ON public.stories FOR ALL TO authenticated
  USING (public.can_manage_content()) WITH CHECK (public.can_manage_content());

-- ── posts ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "posts_select_published_public" ON public.posts;
CREATE POLICY "posts_select_published_public" ON public.posts FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "posts_select_own_or_editor" ON public.posts;
CREATE POLICY "posts_select_own_or_editor" ON public.posts FOR SELECT TO authenticated
  USING (public.can_manage_content() OR author_id = auth.uid());

DROP POLICY IF EXISTS "posts_insert_by_role" ON public.posts;
CREATE POLICY "posts_insert_by_role" ON public.posts FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_content() OR (public.is_author() AND author_id = auth.uid()));

DROP POLICY IF EXISTS "posts_update_by_role" ON public.posts;
CREATE POLICY "posts_update_by_role" ON public.posts FOR UPDATE TO authenticated
  USING (public.can_manage_content() OR (public.is_author() AND author_id = auth.uid()))
  WITH CHECK (public.can_manage_content() OR (public.is_author() AND author_id = auth.uid()));

DROP POLICY IF EXISTS "posts_delete_by_role" ON public.posts;
CREATE POLICY "posts_delete_by_role" ON public.posts FOR DELETE TO authenticated
  USING (public.can_manage_content() OR (public.is_author() AND author_id = auth.uid()));

-- ── post_tags ────────────────────────────────────────────────
DROP POLICY IF EXISTS "post_tags_select_public" ON public.post_tags;
CREATE POLICY "post_tags_select_public" ON public.post_tags FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_tags.post_id AND p.status = 'published'));

DROP POLICY IF EXISTS "post_tags_select_auth" ON public.post_tags;
CREATE POLICY "post_tags_select_auth" ON public.post_tags FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_tags.post_id AND (public.can_manage_content() OR p.author_id = auth.uid())));

DROP POLICY IF EXISTS "post_tags_write_by_role" ON public.post_tags;
CREATE POLICY "post_tags_write_by_role" ON public.post_tags FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_tags.post_id AND (public.can_manage_content() OR p.author_id = auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_tags.post_id AND (public.can_manage_content() OR p.author_id = auth.uid())));

-- ── post_blocks ──────────────────────────────────────────────
DROP POLICY IF EXISTS "post_blocks_select_public" ON public.post_blocks;
CREATE POLICY "post_blocks_select_public" ON public.post_blocks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_blocks.post_id AND p.status = 'published'));

DROP POLICY IF EXISTS "post_blocks_select_auth" ON public.post_blocks;
CREATE POLICY "post_blocks_select_auth" ON public.post_blocks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_blocks.post_id AND (public.can_manage_content() OR p.author_id = auth.uid())));

DROP POLICY IF EXISTS "post_blocks_write_by_role" ON public.post_blocks;
CREATE POLICY "post_blocks_write_by_role" ON public.post_blocks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_blocks.post_id AND (public.can_manage_content() OR p.author_id = auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_blocks.post_id AND (public.can_manage_content() OR p.author_id = auth.uid())));

-- ── post_comments ────────────────────────────────────────────
DROP POLICY IF EXISTS "post_comments_select_public" ON public.post_comments;
CREATE POLICY "post_comments_select_public" ON public.post_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_comments.post_id AND p.status = 'published'));

DROP POLICY IF EXISTS "post_comments_insert_auth" ON public.post_comments;
CREATE POLICY "post_comments_insert_auth" ON public.post_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "post_comments_delete_own_or_admin" ON public.post_comments;
CREATE POLICY "post_comments_delete_own_or_admin" ON public.post_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.can_manage_content());

-- ── post_views_daily ─────────────────────────────────────────
DROP POLICY IF EXISTS "post_views_daily_select_admin" ON public.post_views_daily;
CREATE POLICY "post_views_daily_select_admin" ON public.post_views_daily FOR SELECT TO authenticated
  USING (public.can_manage_content());

-- increment_post_view() tourne en SECURITY DEFINER → pas de policy INSERT/UPDATE nécessaire

-- ============================================================
-- 8. SEED — CATÉGORIES (rubriques)
-- Sources vérifiées :
--   Navbar   → actualites, analyses-tactiques, grands-formats,
--              mercato-business, selections-nationales
--   Homepage → enquetes (RubriqueStrip)
--   Footer   → actualites, analyses-tactiques, grands-formats,
--              mercato-business
-- Requis : ArticleForm charge ces catégories dynamiquement depuis
--          la BDD — table vide = select vide à la publication.
-- ============================================================

INSERT INTO public.categories (name, slug, description, color_hex, sort_order)
VALUES
  ('Actualités',          'actualites',          'Toute l''actualité du football international en temps réel.',              '#E11D48', 1),
  ('Analyses Tactiques',  'analyses-tactiques',  'Décryptage tactique, schémas de jeu et études de matchs.',                '#0F172A', 2),
  ('Grands Formats',      'grands-formats',      'Reportages longs, portraits et dossiers de fond.',                        '#7C3AED', 3),
  ('Mercato & Business',  'mercato-business',    'Transferts, contrats, économie du football et coulisses des clubs.',      '#059669', 4),
  ('Sélections Nationales','selections-nationales','Équipes nationales, compétitions internationales et Coupes du Monde.',  '#2563EB', 5),
  ('Enquêtes & Dossiers', 'enquetes',            'Investigations, révélations et dossiers exclusifs.',                      '#D97706', 6)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
