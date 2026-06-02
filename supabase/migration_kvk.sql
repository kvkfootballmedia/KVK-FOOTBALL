-- ============================================================
-- KVK FOOTBALL — MIGRATION DU SCHÉMA EXISTANT
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================================

BEGIN;

-- 1) Nettoyage des triggers existants pour éviter les conflits d'exécution
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.posts;

-- 2) Création ou remplacement de la fonction de mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = now();
  return new;
END;
$$;

-- 3) Recréation des triggers de mise à jour des timestamps
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- 4) MIGRATION DE LA TABLE : posts
-- A. Renommer 'featured_image_url' en 'featured_image' s'il existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='featured_image_url') THEN
    ALTER TABLE public.posts RENAME COLUMN featured_image_url TO featured_image;
  END IF;
END $$;

-- B. Ajouter les colonnes manquantes utilisées par le front-end
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reading_time integer;


-- 5) MIGRATION DE LA TABLE : post_blocks
-- A. Renommer 'type' en 'block_type' s'il existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='post_blocks' AND column_name='type') THEN
    ALTER TABLE public.post_blocks RENAME COLUMN type TO block_type;
  END IF;
END $$;

-- B. Renommer 'data' en 'content' s'il existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='post_blocks' AND column_name='data') THEN
    ALTER TABLE public.post_blocks RENAME COLUMN data TO content;
  END IF;
END $$;

-- C. Renommer 'sort_order' en 'position' s'il existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='post_blocks' AND column_name='sort_order') THEN
    ALTER TABLE public.post_blocks RENAME COLUMN sort_order TO position;
  END IF;
END $$;

-- D. Suppression de l'ancienne contrainte CHECK sur le type de bloc
-- (Postgres nomme généralement cette contrainte 'post_blocks_type_check' ou 'post_blocks_block_type_check')
ALTER TABLE public.post_blocks DROP CONSTRAINT IF EXISTS post_blocks_type_check;
ALTER TABLE public.post_blocks DROP CONSTRAINT IF EXISTS post_blocks_block_type_check;

-- E. Ajout de la nouvelle contrainte CHECK pour les types de bloc acceptés par l'éditeur
ALTER TABLE public.post_blocks ADD CONSTRAINT post_blocks_block_type_check 
  CHECK (block_type IN ('paragraph', 'heading', 'image', 'quote', 'list', 'embed', 'html'));


-- 6) RLS & POLICIES (Sécurité des tables)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_blocks ENABLE ROW LEVEL SECURITY;

-- Lecture publique des posts publiés
DROP POLICY IF EXISTS "posts_select_published_public" ON public.posts;
CREATE POLICY "posts_select_published_public"
  ON public.posts FOR SELECT
  USING (status = 'published');

-- Lecture privée pour les éditeurs/admin et l'auteur sur ses propres posts
DROP POLICY IF EXISTS "posts_select_private_for_editors_and_owner" ON public.posts;
CREATE POLICY "posts_select_private_for_editors_and_owner"
  ON public.posts FOR SELECT
  TO authenticated
  USING (
    public.can_manage_content()
    OR author_id = auth.uid()
  );

-- Insertion selon les rôles
DROP POLICY IF EXISTS "posts_insert_by_role" ON public.posts;
CREATE POLICY "posts_insert_by_role"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_manage_content()
    OR (public.is_author() AND author_id = auth.uid())
  );

-- Modification selon les rôles
DROP POLICY IF EXISTS "posts_update_by_role" ON public.posts;
CREATE POLICY "posts_update_by_role"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (
    public.can_manage_content()
    OR (public.is_author() AND author_id = auth.uid())
  )
  WITH CHECK (
    public.can_manage_content()
    OR (public.is_author() AND author_id = auth.uid())
  );

-- Suppression selon les rôles
DROP POLICY IF EXISTS "posts_delete_by_role" ON public.posts;
CREATE POLICY "posts_delete_by_role"
  ON public.posts FOR DELETE
  TO authenticated
  USING (
    public.can_manage_content()
    OR (public.is_author() AND author_id = auth.uid())
  );

-- Lecture publique des blocs de posts publiés
DROP POLICY IF EXISTS "post_blocks_select_public_if_post_published" ON public.post_blocks;
CREATE POLICY "post_blocks_select_public_if_post_published"
  ON public.post_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_blocks.post_id
        AND p.status = 'published'
    )
  );

-- Lecture privée des blocs
DROP POLICY IF EXISTS "post_blocks_select_private_for_editors_and_owner" ON public.post_blocks;
CREATE POLICY "post_blocks_select_private_for_editors_and_owner"
  ON public.post_blocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_blocks.post_id
        AND (public.can_manage_content() OR p.author_id = auth.uid())
    )
  );

-- Écriture des blocs par les personnes autorisées
DROP POLICY IF EXISTS "post_blocks_write_for_editors_and_owner" ON public.post_blocks;
CREATE POLICY "post_blocks_write_for_editors_and_owner"
  ON public.post_blocks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_blocks.post_id
        AND (public.can_manage_content() OR p.author_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_blocks.post_id
        AND (public.can_manage_content() OR p.author_id = auth.uid())
    )
  );

COMMIT;
