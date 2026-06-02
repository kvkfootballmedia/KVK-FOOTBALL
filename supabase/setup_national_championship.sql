-- ==========================================
-- SYSTEME DE GESTION DU CHAMPIONNAT NATIONAL
-- ==========================================

-- 1. Table des Équipes
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  city text,
  stadium_name text,
  created_at timestamptz default now()
);

-- 2. Table des Compétitions (National 1, National 2, Coupe du Gabon)
CREATE TABLE IF NOT EXISTS public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- 'National Foot 1', 'National Foot 2', 'Coupe du Gabon'
  slug text unique not null,
  season text not null default '2025-2026',
  is_active boolean default true
);

-- 3. Table des Matchs
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references public.competitions(id) on delete cascade,
  home_team_id uuid references public.teams(id) on delete cascade,
  away_team_id uuid references public.teams(id) on delete cascade,
  home_score integer default 0,
  away_score integer default 0,
  match_date timestamptz not null,
  stadium text,
  status text check (status in ('scheduled', 'live', 'finished')) default 'scheduled',
  round_name text, -- 'J1', 'Quarts', etc.
  created_at timestamptz default now()
);

-- 4. Table des Buteurs par Match
CREATE TABLE IF NOT EXISTS public.match_scorers (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  player_name text not null,
  minute integer,
  is_penalty boolean default false
);

-- 5. Vue pour le Classement (Calculé automatiquement)
-- Cette vue calcule les points : G=3, N=1, P=0
CREATE OR REPLACE VIEW public.v_standings AS
WITH team_stats AS (
    -- Matchs à domicile
    SELECT 
        competition_id,
        home_team_id as team_id,
        1 as played,
        CASE WHEN home_score > away_score THEN 1 ELSE 0 END as win,
        CASE WHEN home_score = away_score THEN 1 ELSE 0 END as draw,
        CASE WHEN home_score < away_score THEN 1 ELSE 0 END as loss,
        home_score as gf,
        away_score as ga
    FROM public.matches WHERE status = 'finished'
    UNION ALL
    -- Matchs à l'extérieur
    SELECT 
        competition_id,
        away_team_id as team_id,
        1 as played,
        CASE WHEN away_score > home_score THEN 1 ELSE 0 END as win,
        CASE WHEN away_score = home_score THEN 1 ELSE 0 END as draw,
        CASE WHEN away_score < home_score THEN 1 ELSE 0 END as loss,
        away_score as gf,
        home_score as ga
    FROM public.matches WHERE status = 'finished'
)
SELECT 
    competition_id,
    team_id,
    SUM(played) as mp,
    SUM(win) as w,
    SUM(draw) as d,
    SUM(loss) as l,
    SUM(gf) as gf,
    SUM(ga) as ga,
    SUM(gf) - SUM(ga) as gd,
    (SUM(win) * 3 + SUM(draw) * 1) as pts
FROM team_stats
GROUP BY competition_id, team_id;

-- 6. RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_scorers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public Read Comp" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Public Read Matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public Read Scorers" ON public.match_scorers FOR SELECT USING (true);

-- Admin Management
CREATE POLICY "Admin All Teams" ON public.teams FOR ALL TO authenticated USING (public.can_manage_content());
CREATE POLICY "Admin All Comp" ON public.competitions FOR ALL TO authenticated USING (public.can_manage_content());
CREATE POLICY "Admin All Matches" ON public.matches FOR ALL TO authenticated USING (public.can_manage_content());
CREATE POLICY "Admin All Scorers" ON public.match_scorers FOR ALL TO authenticated USING (public.can_manage_content());
