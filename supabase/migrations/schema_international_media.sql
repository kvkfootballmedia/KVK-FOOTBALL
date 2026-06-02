-- ============================================================
-- KVK FOOTBALL — SCHEMA COMPLET (International Football Media)
-- Supabase (Postgres) — Tables + triggers + indexes + RLS
-- ============================================================
-- À copier dans votre base Supabase
-- ============================================================

begin;

-- 0) Extensions utiles (uuid + gen_random_uuid)
create extension if not exists pgcrypto;

-- ============================================================
-- 1) HELPER FUNCTIONS
-- ============================================================

-- Auto-update timestamp
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Get user role from profiles
create or replace function public.get_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'anonymous'
  );
$$;

-- Role check functions
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$ select public.get_user_role() = 'admin'; $$;

create or replace function public.is_editor()
returns boolean
language sql
stable
as $$ select public.get_user_role() = 'editor'; $$;

create or replace function public.is_author()
returns boolean
language sql
stable
as $$ select public.get_user_role() = 'author'; $$;

create or replace function public.can_manage_content()
returns boolean
language sql
stable
as $$ select public.get_user_role() in ('admin', 'editor'); $$;

-- ============================================================
-- 2) MAIN TABLES
-- ============================================================

-- 2.1 Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'author' check (role in ('admin','editor','author')),
  avatar_url text,
  bio text,
  twitter_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile on user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 2.2 Categories (Rubriques/Sections)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon_url text,
  color_hex text default '#000000',
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- 2.3 Tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- 2.4 Countries
create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique check (length(code) = 2),
  flag_url text,
  created_at timestamptz not null default now()
);

-- 2.5 Teams (International clubs & national teams)
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  country_id uuid references public.countries(id) on delete set null,
  is_national boolean default false,
  logo_url text,
  founded_year int,
  league text,
  website_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

-- 2.6 Players
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country_id uuid references public.countries(id) on delete set null,
  position text check (position in ('GK','DEF','MID','FWD','MULTI')),
  birth_date date,
  photo_url text,
  preferred_foot text check (preferred_foot in ('left', 'right', 'both')),
  height_cm int,
  weight_kg int,
  jersey_number int,
  current_team_id uuid references public.teams(id) on delete set null,
  market_value_millions decimal(10,2),
  international_caps int default 0,
  international_goals int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_players_updated_at
before update on public.players
for each row execute function public.set_updated_at();

-- 2.7 Competitions (Leagues, Cups, International tournaments)
create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  competition_type text not null check (competition_type in ('league', 'cup', 'international', 'tournament')),
  country_id uuid references public.countries(id) on delete set null,
  season int,
  logo_url text,
  description text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_competitions_updated_at
before update on public.competitions
for each row execute function public.set_updated_at();

-- 2.8 Matches
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  home_team_id uuid not null references public.teams(id) on delete restrict,
  away_team_id uuid not null references public.teams(id) on delete restrict,
  match_date timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'finished', 'postponed', 'cancelled')),
  home_goals int,
  away_goals int,
  location text,
  attendance int,
  referee_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_matches_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

-- 2.9 Standings
create table if not exists public.standings (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  position int,
  matches_played int default 0,
  wins int default 0,
  draws int default 0,
  losses int default 0,
  goals_for int default 0,
  goals_against int default 0,
  goal_difference int generated always as (goals_for - goals_against) stored,
  points int default 0,
  updated_at timestamptz not null default now(),
  unique (competition_id, team_id)
);

create trigger trg_standings_updated_at
before update on public.standings
for each row execute function public.set_updated_at();

-- 2.10 Posts/Articles
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  featured_image_url text,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  author_id uuid not null references public.profiles(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  related_team_id uuid references public.teams(id) on delete set null,
  related_player_id uuid references public.players(id) on delete set null,
  related_match_id uuid references public.matches(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  view_count integer not null default 0,
  like_count integer not null default 0
);

create trigger trg_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- 2.11 Post <-> Tags (N-N)
create table if not exists public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

-- 2.12 Post Blocks (Multi-block editor)
create table if not exists public.post_blocks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  type text not null check (type in ('text','image','embed','quote','gallery','match_card','player_card','team_card','video')),
  data jsonb not null default '{}'::jsonb,
  caption text,
  sort_order int not null,
  created_at timestamptz not null default now()
);

-- 2.13 Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  like_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_comments_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

-- 2.14 Player Stats (Match-by-match)
create table if not exists public.player_match_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  position text check (position in ('GK','DEF','MID','FWD','BENCH')),
  goals int default 0,
  assists int default 0,
  shots_on_target int default 0,
  passes_completed int default 0,
  pass_accuracy decimal(5,2),
  tackles int default 0,
  interceptions int default 0,
  yellow_cards int default 0,
  red_cards int default 0,
  minutes_played int default 0,
  rating decimal(3,1),
  created_at timestamptz not null default now(),
  unique (player_id, match_id)
);

-- 2.15 Stories & Story Groups (Ephemeral content)
create table if not exists public.story_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cover_image_url text not null,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.story_groups(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  media_url text not null,
  title text,
  body_text text,
  link_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3) INDEXES (Performance)
-- ============================================================

-- Posts
create index if not exists idx_posts_status_published_at on public.posts (status, published_at desc);
create index if not exists idx_posts_author_id on public.posts (author_id);
create index if not exists idx_posts_category_id on public.posts (category_id);
create index if not exists idx_posts_related_team on public.posts (related_team_id);
create index if not exists idx_posts_related_player on public.posts (related_player_id);
create index if not exists idx_posts_related_match on public.posts (related_match_id);
create index if not exists idx_posts_slug on public.posts (slug);

-- Post relations
create index if not exists idx_post_tags_tag_id on public.post_tags (tag_id);
create index if not exists idx_post_blocks_post_sort on public.post_blocks (post_id, sort_order);

-- Teams & Players
create index if not exists idx_teams_slug on public.teams (slug);
create index if not exists idx_teams_country on public.teams (country_id);
create index if not exists idx_players_slug on public.players (slug);
create index if not exists idx_players_country on public.players (country_id);
create index if not exists idx_players_current_team on public.players (current_team_id);

-- Competitions & Matches
create index if not exists idx_competitions_slug on public.competitions (slug);
create index if not exists idx_matches_competition on public.matches (competition_id);
create index if not exists idx_matches_date on public.matches (match_date desc);
create index if not exists idx_matches_home_team on public.matches (home_team_id);
create index if not exists idx_matches_away_team on public.matches (away_team_id);
create index if not exists idx_matches_status on public.matches (status);

-- Standings
create index if not exists idx_standings_competition on public.standings (competition_id);
create index if not exists idx_standings_team on public.standings (team_id);

-- Comments
create index if not exists idx_comments_post on public.comments (post_id);
create index if not exists idx_comments_author on public.comments (author_id);
create index if not exists idx_comments_parent on public.comments (parent_comment_id);

-- Player stats
create index if not exists idx_player_stats_match on public.player_match_stats (match_id);
create index if not exists idx_player_stats_player on public.player_match_stats (player_id);
create index if not exists idx_player_stats_team on public.player_match_stats (team_id);

-- Stories
create index if not exists idx_stories_group on public.stories (group_id);

-- ============================================================
-- 4) ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles           enable row level security;
alter table public.categories         enable row level security;
alter table public.tags               enable row level security;
alter table public.countries          enable row level security;
alter table public.teams              enable row level security;
alter table public.players            enable row level security;
alter table public.competitions       enable row level security;
alter table public.matches            enable row level security;
alter table public.standings          enable row level security;
alter table public.posts              enable row level security;
alter table public.post_tags          enable row level security;
alter table public.post_blocks        enable row level security;
alter table public.comments           enable row level security;
alter table public.player_match_stats enable row level security;
alter table public.story_groups       enable row level security;
alter table public.stories            enable row level security;

-- ========================================
-- PROFILES - Read public, update own
-- ========================================

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles
for select
using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_insert_none" on public.profiles;
create policy "profiles_insert_none"
on public.profiles
for insert
to authenticated
with check (false);

drop policy if exists "profiles_delete_none" on public.profiles;
create policy "profiles_delete_none"
on public.profiles
for delete
to authenticated
using (false);

-- ========================================
-- CATEGORIES - Read public, write by editor/admin
-- ========================================

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
on public.categories
for select
using (true);

drop policy if exists "categories_write_editor_admin" on public.categories;
create policy "categories_write_editor_admin"
on public.categories
for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

-- ========================================
-- TAGS - Read public, write by editor/admin
-- ========================================

drop policy if exists "tags_select_public" on public.tags;
create policy "tags_select_public"
on public.tags
for select
using (true);

drop policy if exists "tags_write_editor_admin" on public.tags;
create policy "tags_write_editor_admin"
on public.tags
for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

-- ========================================
-- COUNTRIES - Public read, write by editor/admin
-- ========================================

drop policy if exists "countries_select_public" on public.countries;
create policy "countries_select_public"
on public.countries
for select
using (true);

drop policy if exists "countries_write_editor_admin" on public.countries;
create policy "countries_write_editor_admin"
on public.countries
for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

-- ========================================
-- TEAMS - Public read, write by editor/admin
-- ========================================

drop policy if exists "teams_select_public" on public.teams;
create policy "teams_select_public"
on public.teams
for select
using (true);

drop policy if exists "teams_write_editor_admin" on public.teams;
create policy "teams_write_editor_admin"
on public.teams
for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

-- ========================================
-- PLAYERS - Public read, write by editor/admin
-- ========================================

drop policy if exists "players_select_public" on public.players;
create policy "players_select_public"
on public.players
for select
using (true);

drop policy if exists "players_write_editor_admin" on public.players;
create policy "players_write_editor_admin"
on public.players
for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

-- ========================================
-- COMPETITIONS - Public read, write by editor/admin
-- ========================================

drop policy if exists "competitions_select_public" on public.competitions;
create policy "competitions_select_public"
on public.competitions
for select
using (true);

drop policy if exists "competitions_write_editor_admin" on public.competitions;
create policy "competitions_write_editor_admin"
on public.competitions
for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

-- ========================================
-- MATCHES - Public read, write by editor/admin
-- ========================================

drop policy if exists "matches_select_public" on public.matches;
create policy "matches_select_public"
on public.matches
for select
using (true);

drop policy if exists "matches_write_editor_admin" on public.matches;
create policy "matches_write_editor_admin"
on public.matches
for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

-- ========================================
-- STANDINGS - Public read, write by editor/admin
-- ========================================

drop policy if exists "standings_select_public" on public.standings;
create policy "standings_select_public"
on public.standings
for select
using (true);

drop policy if exists "standings_write_editor_admin" on public.standings;
create policy "standings_write_editor_admin"
on public.standings
for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

-- ========================================
-- POSTS - Published public, drafts by role
-- ========================================

drop policy if exists "posts_select_published_public" on public.posts;
create policy "posts_select_published_public"
on public.posts
for select
using (status = 'published');

drop policy if exists "posts_select_private_for_editors_and_owner" on public.posts;
create policy "posts_select_private_for_editors_and_owner"
on public.posts
for select
to authenticated
using (
  public.can_manage_content()
  or author_id = auth.uid()
);

drop policy if exists "posts_insert_by_role" on public.posts;
create policy "posts_insert_by_role"
on public.posts
for insert
to authenticated
with check (
  public.can_manage_content()
  or (public.is_author() and author_id = auth.uid())
);

drop policy if exists "posts_update_by_role" on public.posts;
create policy "posts_update_by_role"
on public.posts
for update
to authenticated
using (
  public.can_manage_content()
  or (public.is_author() and author_id = auth.uid())
)
with check (
  public.can_manage_content()
  or (public.is_author() and author_id = auth.uid())
);

drop policy if exists "posts_delete_by_role" on public.posts;
create policy "posts_delete_by_role"
on public.posts
for delete
to authenticated
using (
  public.can_manage_content()
  or (public.is_author() and author_id = auth.uid())
);

-- ========================================
-- POST_TAGS - Inherit from post permissions
-- ========================================

drop policy if exists "post_tags_select_public_if_post_published" on public.post_tags;
create policy "post_tags_select_public_if_post_published"
on public.post_tags
for select
using (
  exists (
    select 1 from public.posts p
    where p.id = post_tags.post_id
      and p.status = 'published'
  )
);

drop policy if exists "post_tags_select_private_for_editors_and_owner" on public.post_tags;
create policy "post_tags_select_private_for_editors_and_owner"
on public.post_tags
for select
to authenticated
using (
  exists (
    select 1 from public.posts p
    where p.id = post_tags.post_id
      and (public.can_manage_content() or p.author_id = auth.uid())
  )
);

drop policy if exists "post_tags_write_for_editors_and_owner" on public.post_tags;
create policy "post_tags_write_for_editors_and_owner"
on public.post_tags
for all
to authenticated
using (
  exists (
    select 1 from public.posts p
    where p.id = post_tags.post_id
      and (public.can_manage_content() or p.author_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.posts p
    where p.id = post_tags.post_id
      and (public.can_manage_content() or p.author_id = auth.uid())
  )
);

-- ========================================
-- POST_BLOCKS - Inherit from post permissions
-- ========================================

drop policy if exists "post_blocks_select_public_if_post_published" on public.post_blocks;
create policy "post_blocks_select_public_if_post_published"
on public.post_blocks
for select
using (
  exists (
    select 1 from public.posts p
    where p.id = post_blocks.post_id
      and p.status = 'published'
  )
);

drop policy if exists "post_blocks_select_private_for_editors_and_owner" on public.post_blocks;
create policy "post_blocks_select_private_for_editors_and_owner"
on public.post_blocks
for select
to authenticated
using (
  exists (
    select 1 from public.posts p
    where p.id = post_blocks.post_id
      and (public.can_manage_content() or p.author_id = auth.uid())
  )
);

drop policy if exists "post_blocks_write_for_editors_and_owner" on public.post_blocks;
create policy "post_blocks_write_for_editors_and_owner"
on public.post_blocks
for all
to authenticated
using (
  exists (
    select 1 from public.posts p
    where p.id = post_blocks.post_id
      and (public.can_manage_content() or p.author_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.posts p
    where p.id = post_blocks.post_id
      and (public.can_manage_content() or p.author_id = auth.uid())
  )
);

-- ========================================
-- COMMENTS - Published comments public, moderation by role
-- ========================================

drop policy if exists "comments_select_published_public" on public.comments;
create policy "comments_select_published_public"
on public.comments
for select
using (status = 'approved');

drop policy if exists "comments_select_private_for_editors_and_owner" on public.comments;
create policy "comments_select_private_for_editors_and_owner"
on public.comments
for select
to authenticated
using (
  public.can_manage_content()
  or author_id = auth.uid()
);

drop policy if exists "comments_insert_authenticated" on public.comments;
create policy "comments_insert_authenticated"
on public.comments
for insert
to authenticated
with check (author_id = auth.uid());

drop policy if exists "comments_update_own_or_manage" on public.comments;
create policy "comments_update_own_or_manage"
on public.comments
for update
to authenticated
using (
  public.can_manage_content()
  or author_id = auth.uid()
)
with check (
  public.can_manage_content()
  or author_id = auth.uid()
);

drop policy if exists "comments_delete_own_or_manage" on public.comments;
create policy "comments_delete_own_or_manage"
on public.comments
for delete
to authenticated
using (
  public.can_manage_content()
  or author_id = auth.uid()
);

-- ========================================
-- PLAYER_MATCH_STATS - Public read, write by editor/admin
-- ========================================

drop policy if exists "player_match_stats_select_public" on public.player_match_stats;
create policy "player_match_stats_select_public"
on public.player_match_stats
for select
using (true);

drop policy if exists "player_match_stats_write_editor_admin" on public.player_match_stats;
create policy "player_match_stats_write_editor_admin"
on public.player_match_stats
for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

-- ========================================
-- STORIES & STORY_GROUPS - Ephemeral content
-- ========================================

drop policy if exists "lecture_story_groups_public" on public.story_groups;
create policy "lecture_story_groups_public" on public.story_groups
for select using (is_active = true AND (expires_at IS NULL OR expires_at > now()));

drop policy if exists "write_story_groups_admin" on public.story_groups;
create policy "write_story_groups_admin" on public.story_groups
for all to authenticated using (public.can_manage_content()) with check (public.can_manage_content());

drop policy if exists "lecture_stories_public" on public.stories;
create policy "lecture_stories_public" on public.stories
for select using (true);

drop policy if exists "write_stories_admin" on public.stories;
create policy "write_stories_admin" on public.stories
for all to authenticated using (public.can_manage_content()) with check (public.can_manage_content());

commit;
