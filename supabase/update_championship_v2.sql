-- ==========================================
-- MISE À JOUR CHAMPIONNAT : TAPIS VERT & CLASSEMENT DÉTAILLÉ
-- ==========================================

-- 1. Ajout des colonnes pour le tapis vert dans la table matches
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS is_walkover boolean DEFAULT false;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS walkover_winner_id uuid REFERENCES public.teams(id);

-- 2. Recréation de la vue v_standings avec tous les détails (J, G, N, P, BP, BC, Diff, Pts)
DROP VIEW IF EXISTS public.v_standings;

CREATE OR REPLACE VIEW public.v_standings AS
WITH match_stats AS (
  -- Stats pour l'équipe à domicile
  SELECT 
    competition_id,
    home_team_id AS team_id,
    COUNT(*) AS mp,
    SUM(CASE WHEN home_score > away_score THEN 1 ELSE 0 END) AS won,
    SUM(CASE WHEN home_score = away_score THEN 1 ELSE 0 END) AS drawn,
    SUM(CASE WHEN home_score < away_score THEN 1 ELSE 0 END) AS lost,
    SUM(home_score) AS gf,
    SUM(away_score) AS ga,
    SUM(CASE 
          WHEN home_score > away_score THEN 3 
          WHEN home_score = away_score THEN 1 
          ELSE 0 
        END) AS pts
  FROM public.matches
  WHERE status = 'finished'
  GROUP BY competition_id, home_team_id

  UNION ALL

  -- Stats pour l'équipe à l'extérieur
  SELECT 
    competition_id,
    away_team_id AS team_id,
    COUNT(*) AS mp,
    SUM(CASE WHEN away_score > home_score THEN 1 ELSE 0 END) AS won,
    SUM(CASE WHEN away_score = home_score THEN 1 ELSE 0 END) AS drawn,
    SUM(CASE WHEN away_score < home_score THEN 1 ELSE 0 END) AS lost,
    SUM(away_score) AS gf,
    SUM(home_score) AS ga,
    SUM(CASE 
          WHEN away_score > home_score THEN 3 
          WHEN away_score = home_score THEN 1 
          ELSE 0 
        END) AS pts
  FROM public.matches
  WHERE status = 'finished'
  GROUP BY competition_id, away_team_id
)
SELECT 
  competition_id,
  team_id,
  SUM(mp) AS mp,
  SUM(won) AS w,
  SUM(drawn) AS d,
  SUM(lost) AS l,
  SUM(gf) AS gf,
  SUM(ga) AS ga,
  SUM(gf) - SUM(ga) AS gd,
  SUM(pts) AS pts
FROM match_stats
GROUP BY competition_id, team_id;

-- 3. Sécurité
ALTER VIEW public.v_standings OWNER TO postgres;
GRANT SELECT ON public.v_standings TO anon, authenticated;
