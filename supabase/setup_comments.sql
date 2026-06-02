-- ==========================================
-- SYSTEME DE COMMENTAIRES / AVIS SUR LES ARTICLES
-- ==========================================

-- 1. Ajout du rôle "reader" pour les utilisateurs normaux (s'inscrire pour commenter)
-- On supprime l'ancienne contrainte qui limitait aux admins/editors/authors
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- On ajoute la nouvelle avec "reader" et on change la valeur par défaut
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role in ('admin', 'editor', 'author', 'reader'));
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'reader';

-- 2. Création de la table des commentaires
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER trg_post_comments_updated_at
BEFORE UPDATE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Sécurité (RLS)
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Lecture : Tout le monde peut voir les commentaires d'un article publié
CREATE POLICY "lecture public_comments"
ON public.post_comments FOR SELECT
USING (
  exists (
    select 1 from public.posts p
    where p.id = post_comments.post_id and p.status = 'published'
  )
);

-- Insertion : Les utilisateurs connectés peuvent commenter
CREATE POLICY "insert_comments_auth"
ON public.post_comments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Mise à jour : L'auteur du commentaire ou un admin
CREATE POLICY "update_comments_owner_admin"
ON public.post_comments FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.can_manage_content())
WITH CHECK (user_id = auth.uid() OR public.can_manage_content());

-- Suppression : L'auteur du commentaire ou un admin
CREATE POLICY "delete_comments_owner_admin"
ON public.post_comments FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.can_manage_content());

-- 4. Index de performance pour charger rapidement les avis d'un article
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
