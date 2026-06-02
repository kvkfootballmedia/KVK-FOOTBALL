-- ============================================================
-- KVK FOOTBALL — CATEGORIES (Inspiré d'Eurosport)
-- À exécuter dans Supabase après le schema principal
-- ============================================================

-- Vider les catégories existantes (optionnel)
-- DELETE FROM public.categories;

-- ============================================================
-- CATEGORIES PRINCIPALES
-- ============================================================

INSERT INTO public.categories (name, slug, description, color_hex, sort_order) VALUES

-- Main sections
('Actualités', 'actualites', 'Les dernières infos du football mondial', '#FF0000', 1),
('Compétitions', 'competitions', 'Ligue 1, Premier League, Champions League et plus', '#003399', 2),
('Équipes', 'equipes', 'Profils et actualités des équipes internationales', '#1a1a1a', 3),
('Joueurs', 'joueurs', 'Profils, stats et actualités des joueurs', '#008000', 4),
('Mercato', 'mercato', 'Transferts, rumeurs et opérations mercato', '#FF6600', 5),
('Tactiques & Analyses', 'tactiques-analyses', 'Analyses tactiques approfondies des matchs', '#9933FF', 6),
('Vidéos', 'videos', 'Résumés, buts et moments clés', '#000000', 7),
('Reportages', 'reportages', 'Enquêtes et portraits en profondeur', '#333333', 8),

-- Sub-categories pour les compétitions majeures
('Ligue 1', 'ligue-1', 'Championnat de France', '#001aa3', 10),
('Premier League', 'premier-league', 'Championnat d\'Angleterre', '#003399', 11),
('La Liga', 'la-liga', 'Championnat d\'Espagne', '#ffcc00', 12),
('Serie A', 'serie-a', 'Championnat d\'Italie', '#0066ff', 13),
('Bundesliga', 'bundesliga', 'Championnat d\'Allemagne', '#000000', 14),
('Ligue des Champions', 'ligue-champions', 'Compétition européenne', '#003366', 15),
('Ligue Europa', 'ligue-europa', 'Coupe d\'Europe 2', '#003300', 16),
('Coupes Nationales', 'coupes-nationales', 'Coupe de France, FA Cup, etc.', '#660000', 17),

-- Équipes nationales
('Équipes Nationales', 'equipes-nationales', 'Actualités des sélections nationales', '#0066cc', 20),
('Mondial 2026', 'mondial-2026', 'Qualifications et préparations pour le Mondial', '#ff0000', 21),
('Euros & Confédérations', 'euros-confederations', 'Championnats continentaux', '#ffaa00', 22),

-- Spécialisé
('Technique & Tactique', 'technique-tactique', 'Décortication des systèmes de jeu', '#663333', 30),
('Débats & Opinions', 'debats-opinions', 'Colonnes et points de vue', '#663300', 31),
('Historique & Patrimoine', 'historique-patrimoine', 'Archives, histoire du football', '#666666', 32),
('Jeunes Talents', 'jeunes-talents', 'Découvrez les promesses du football', '#00cc66', 33),
('Coulisses du Foot', 'coulisses-foot', 'Interviews, backstage et stories', '#ff3366', 34);

-- ============================================================
-- TAGS MAJEURS (optionnel)
-- ============================================================

INSERT INTO public.tags (name, slug) VALUES

-- Championnats
('Ligue 1', 'ligue-1'),
('Premier League', 'premier-league'),
('La Liga', 'la-liga'),
('Serie A', 'serie-a'),
('Bundesliga', 'bundesliga'),
('Ligue des Champions', 'ligue-champions'),
('Ligue Europa', 'ligue-europa'),

-- Équipes majeures
('PSG', 'psg'),
('Manchester City', 'manchester-city'),
('Real Madrid', 'real-madrid'),
('Barcelona', 'barcelona'),
('Liverpool', 'liverpool'),
('Bayern Munich', 'bayern-munich'),
('Inter Milan', 'inter-milan'),
('Juventus', 'juventus'),

-- Thèmes
('Mercato', 'mercato'),
('Transferts', 'transferts'),
('Blessures', 'blessures'),
('Tactique', 'tactique'),
('Analyse', 'analyse'),
('Vidéo', 'video'),
('Résumé', 'resume'),
('Mondial', 'mondial'),
('Euro', 'euro'),
('Jeunes talents', 'jeunes-talents'),
('Coulisses', 'coulisses'),
('Débat', 'debat');

-- ============================================================
-- VÉRIFICATION
-- ============================================================

SELECT COUNT(*) as total_categories FROM public.categories;
SELECT COUNT(*) as total_tags FROM public.tags;
