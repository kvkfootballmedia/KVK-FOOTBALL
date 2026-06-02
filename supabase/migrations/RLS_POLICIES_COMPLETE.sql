-- =====================================================
-- KVK FOOTBALL - RLS POLICIES POUR STORAGE
-- =====================================================
-- À coller directement dans Supabase SQL Editor
-- Après avoir créé les 3 buckets:
-- - articles-media
-- - user-media
-- - static-assets
-- =====================================================

-- =====================================================
-- 1. BUCKET: articles-media
-- =====================================================
-- Images vedette, blocs, thumbnails
-- Accès: Public (lecture) + Admin/Editor (écriture)

-- SELECT - Tout le monde peut lire
CREATE POLICY "articles-media: Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'articles-media');

-- INSERT - Seulement les admins/editors peuvent uploader
CREATE POLICY "articles-media: Admin upload only"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'articles-media'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'editor')
  )
);

-- UPDATE - Seulement les admins/editors peuvent modifier
CREATE POLICY "articles-media: Admin update only"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'articles-media'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'editor')
  )
);

-- DELETE - Seulement les admins/editors peuvent supprimer
CREATE POLICY "articles-media: Admin delete only"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'articles-media'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'editor')
  )
);

-- =====================================================
-- 2. BUCKET: user-media
-- =====================================================
-- Avatars, bannières, uploads utilisateurs
-- Accès: Public (lecture) + Users authentifiés (écriture)

-- SELECT - Tout le monde peut lire
CREATE POLICY "user-media: Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-media');

-- INSERT - Les utilisateurs authentifiés peuvent uploader
CREATE POLICY "user-media: Users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-media'
  AND auth.uid() IS NOT NULL
);

-- UPDATE - Les utilisateurs authentifiés peuvent modifier
CREATE POLICY "user-media: Users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-media'
  AND auth.uid() IS NOT NULL
);

-- DELETE - Les utilisateurs authentifiés peuvent supprimer
CREATE POLICY "user-media: Users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-media'
  AND auth.uid() IS NOT NULL
);

-- =====================================================
-- 3. BUCKET: static-assets
-- =====================================================
-- Logos, badges, icons
-- Accès: Public (lecture) + Admin uniquement (écriture)

-- SELECT - Tout le monde peut lire
CREATE POLICY "static-assets: Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'static-assets');

-- INSERT - Seulement les admins peuvent uploader
CREATE POLICY "static-assets: Admin upload only"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'static-assets'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- UPDATE - Seulement les admins peuvent modifier
CREATE POLICY "static-assets: Admin update only"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'static-assets'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- DELETE - Seulement les admins peuvent supprimer
CREATE POLICY "static-assets: Admin delete only"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'static-assets'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- =====================================================
-- VÉRIFICATION: Lister toutes les policies créées
-- =====================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;

-- =====================================================
-- RÉSULTAT ATTENDU: 12 policies (4 par bucket)
-- =====================================================
-- articles-media: 4 policies
-- user-media: 4 policies
-- static-assets: 4 policies
-- =====================================================
