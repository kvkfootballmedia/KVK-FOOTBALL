-- ============================================================
-- KVK FOOTBALL — CATEGORIES D'ELITE INTERNATIONAL
-- À exécuter dans Supabase pour réorganiser les rubriques
-- ============================================================

-- Vider les catégories et tags existants pour reconstruire proprement
TRUNCATE TABLE public.categories CASCADE;
TRUNCATE TABLE public.tags CASCADE;

-- ============================================================
-- CATEGORIES PRINCIPALES (RUBRIQUES ELITE INTERNATIONAL)
-- ============================================================

INSERT INTO public.categories (name, slug, description, color_hex, sort_order) VALUES

-- Rubriques Majeures Éditoriales
('Actualités', 'actualites', 'L''actualité du football mondial en temps réel', '#DC2626', 1),
('Analyses Tactiques', 'analyses-tactiques', 'Analyses de systèmes de jeu, statistiques avancées et palettes graphiques', '#6366F1', 2),
('Grands Formats', 'grands-formats', 'Longs formats, reportages de fond et grandes enquêtes exclusives', '#B45309', 3),
('Mercato & Business', 'mercato-business', 'Transferts, finances des clubs, stratégies de recrutement et économie du sport', '#E15A17', 4),
('Sélections Nationales', 'selections-nationales', 'Actualités des équipes nationales, Coupe du Monde, Euro, CAN et Copa América', '#047857', 5),

-- Sub-categories pour les compétitions internationales phares
('Ligue des Champions', 'ligue-champions', 'Ligue des Champions de l''UEFA', '#0F172A', 10),
('Premier League', 'premier-league', 'Championnat d''Angleterre', '#1E3A8A', 11),
('Ligue 1', 'ligue-1', 'Championnat de France', '#0284C7', 12),
('La Liga', 'la-liga', 'Championnat d''Espagne', '#F59E0B', 13),
('Serie A', 'serie-a', 'Championnat d''Italie', '#0369A1', 14),
('Bundesliga', 'bundesliga', 'Championnat d''Allemagne', '#111827', 15),
('Copa Libertadores', 'copa-libertadores', 'Compétition majeure d''Amérique du Sud', '#D97706', 16),
('Ligue Europa', 'ligue-europa', 'Ligue Europa de l''UEFA', '#15803D', 17);

-- ============================================================
-- TAGS INTERNATIONAUX POUR FLÈCHAGE PRECISE
-- ============================================================

INSERT INTO public.tags (name, slug) VALUES

-- Compétitions
('Ligue des Champions', 'ligue-champions'),
('Premier League', 'premier-league'),
('Ligue 1', 'ligue-1'),
('La Liga', 'la-liga'),
('Serie A', 'serie-a'),
('Bundesliga', 'bundesliga'),
('Copa Libertadores', 'copa-libertadores'),

-- Clubs d'Élite Mondiale
('Real Madrid', 'real-madrid'),
('FC Barcelone', 'fc-barcelone'),
('Manchester City', 'manchester-city'),
('Liverpool', 'liverpool'),
('Arsenal', 'arsenal'),
('Bayern Munich', 'bayern-munich'),
('Paris Saint-Germain', 'psg'),
('Inter Milan', 'inter-milan'),
('Juventus', 'juventus'),

-- Nations Majeures
('France', 'france'),
('Brésil', 'bresil'),
('Argentine', 'argentine'),
('Angleterre', 'angleterre'),
('Espagne', 'espagne'),
('Allemagne', 'allemagne'),
('Italie', 'italie'),
('Maroc', 'maroc'),
('Sénégal', 'senegal'),

-- Mots clefs thématiques
('Data', 'data'),
('Portrait', 'portrait'),
('Enquête', 'enquete'),
('Finances', 'finances'),
('Tactique', 'tactique'),
('Breaking News', 'breaking-news');
