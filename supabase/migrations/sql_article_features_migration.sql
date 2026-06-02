-- =====================================================
-- KVK FOOTBALL - Article Features Migration
-- =====================================================
-- Ajoute les colonnes et indexes pour les fonctionnalités avancées d'articles
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter les colonnes META SEO
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT NULL;

-- 2. Ajouter les colonnes FOCAL POINT
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS featured_image_focal_x FLOAT DEFAULT 50,
ADD COLUMN IF NOT EXISTS featured_image_focal_y FLOAT DEFAULT 50;

-- 3. Créer l'index UNIQUE pour slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- 4. Créer l'index pour les requêtes catégories
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);

-- 5. Créer l'index pour les requêtes statut
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- 6. Créer l'index pour les commentaires approuvés
CREATE INDEX IF NOT EXISTS idx_comments_status_post ON comments(status, post_id);

-- 7. Ajouter les colonnes manquantes à comments si nécessaire
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS parent_comment_id UUID DEFAULT NULL REFERENCES comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;

-- 8. Créer l'index pour les commentaires imbriquées
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);

-- 9. Vérifier la structure de post_blocks
-- La table post_blocks doit avoir: id, post_id, type, data (JSONB), sort_order

-- 10. Créer l'index pour post_blocks
CREATE INDEX IF NOT EXISTS idx_post_blocks_post_id ON post_blocks(post_id);
CREATE INDEX IF NOT EXISTS idx_post_blocks_sort ON post_blocks(post_id, sort_order);

-- =====================================================
-- VÉRIFICATION DES COLONNES
-- =====================================================
-- Vérifier que toutes les colonnes existent:
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'posts' AND column_name IN (
  'meta_title', 'meta_description',
  'featured_image_focal_x', 'featured_image_focal_y'
);

-- Vérifier que les tables existent:
-- SELECT * FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name IN ('posts', 'post_blocks', 'comments', 'categories');

-- =====================================================
-- NOTES
-- =====================================================
-- meta_title: 50-60 caractères recommandés pour SEO
-- meta_description: 150-160 caractères recommandés pour SEO
-- featured_image_focal_x/y: Pourcentage (0-100) où afficher le point focal de l'image
--
-- Exemple d'URL avec focal point encodé:
-- https://storage.com/image.jpg#focal=50_50
--
-- Format stockage en base (colonnes séparées):
-- featured_image_url: "https://storage.com/image.jpg"
-- featured_image_focal_x: 50
-- featured_image_focal_y: 50
