-- ==========================================
-- SYSTEME DE GESTION DES JOUEURS (DATA FOOT) - VERSION CORRIGÉE
-- ==========================================

-- 1. Table des Joueurs
CREATE TABLE IF NOT EXISTS public.players (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text not null,
  full_name text generated always as (
    CASE 
      WHEN first_name IS NOT NULL AND first_name <> '' THEN first_name || ' ' || last_name 
      ELSE last_name 
    END
  ) stored,
  photo_url text,
  current_team_id uuid references public.teams(id) on delete set null,
  position text check (position in ('G', 'D', 'M', 'A')), -- Gardien, Défenseur, Milieu, Attaquant
  number integer,
  birth_date date,
  nationality text default 'Gabonaise',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Mise à jour de la table match_scorers (si elle existe déjà via national_championship.sql)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'match_scorers') THEN
        ALTER TABLE public.match_scorers ADD COLUMN IF NOT EXISTS player_id uuid references public.players(id) on delete set null;
        ALTER TABLE public.match_scorers ADD COLUMN IF NOT EXISTS is_own_goal boolean default false;
    END IF;
END $$;

-- 3. Sécurité (RLS)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Players" ON public.players;
CREATE POLICY "Public Read Players" ON public.players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Players" ON public.players;
CREATE POLICY "Admin All Players" ON public.players FOR ALL TO authenticated USING (public.can_manage_content());

-- Index pour la recherche
CREATE INDEX IF NOT EXISTS idx_players_team_id ON public.players(current_team_id);
CREATE INDEX IF NOT EXISTS idx_players_full_name ON public.players(full_name);