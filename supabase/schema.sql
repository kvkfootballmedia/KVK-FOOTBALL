-- ============================================================
-- KVK FOOTBALL — SUPABASE (Postgres) — SCHEMA FINAL
-- Tables + triggers + indexes + RLS (admin/editor/author)
-- ============================================================

begin;

-- 0) Extensions utiles (uuid + gen_random_uuid)
create extension if not exists pgcrypto;

-- ============================================================
-- 1) Helpers (roles & timestamps)
-- ============================================================

-- updated_at auto
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Récupère le rôle depuis profiles (SECURITY DEFINER pour éviter le casse-tête RLS)
create or replace function public.current_role()
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

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$ select public.current_role() = 'admin'; $$;

create or replace function public.is_editor()
returns boolean
language sql
stable
as $$ select public.current_role() = 'editor'; $$;

create or replace function public.is_author()
returns boolean
language sql
stable
as $$ select public.current_role() = 'author'; $$;

create or replace function public.can_manage_content()
returns boolean
language sql
stable
as $$ select public.is_admin() or public.is_editor(); $$;

-- ============================================================
-- 2) Tables
-- ============================================================

-- 2.1 Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'author' check (role in ('admin','editor','author')),
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- auto-create profile à la création d’un user
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

-- 2.2 Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- 2.3 Tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- 2.4 Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  featured_image_url text,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  author_id uuid not null references public.profiles(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- 2.5 Post <-> Tags (N-N)
create table if not exists public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

-- 2.6 Post Blocks (éditeur multi-blocs)
-- type: text | image | embed | quote etc.
-- data: JSONB (ex: { "html": "..."} ou { "url": "...", "alt": "..."} )
create table if not exists public.post_blocks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  type text not null check (type in ('text','image','embed','quote','gallery')),
  data jsonb not null default '{}'::jsonb,
  caption text,
  sort_order int not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3) Indexes (perf)
-- ============================================================

create index if not exists idx_posts_status_published_at on public.posts (status, published_at desc);
create index if not exists idx_posts_author_id on public.posts (author_id);
create index if not exists idx_posts_category_id on public.posts (category_id);

create index if not exists idx_post_tags_tag_id on public.post_tags (tag_id);
create index if not exists idx_post_blocks_post_sort on public.post_blocks (post_id, sort_order);

-- Slugs: already unique => implicit index via UNIQUE

-- ============================================================
-- 4) RLS
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.tags        enable row level security;
alter table public.posts       enable row level security;
alter table public.post_tags   enable row level security;
alter table public.post_blocks enable row level security;

-- -------------------------
-- PROFILES
-- -------------------------

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

-- (optionnel) bloquer insert/delete depuis client
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

-- -------------------------
-- CATEGORIES
-- -------------------------

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

-- -------------------------
-- TAGS
-- -------------------------

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

-- -------------------------
-- POSTS (lecture publique publiée + édition par rôle)
-- -------------------------

drop policy if exists "posts_select_published_public" on public.posts;
create policy "posts_select_published_public"
on public.posts
for select
using (status = 'published');

-- lecture des brouillons pour ceux qui peuvent éditer (editor/admin) + l'auteur sur ses posts
drop policy if exists "posts_select_private_for_editors_and_owner" on public.posts;
create policy "posts_select_private_for_editors_and_owner"
on public.posts
for select
to authenticated
using (
  public.can_manage_content()
  or author_id = auth.uid()
);

-- INSERT: admin/editor n'importe quel author_id ; author seulement sur lui-même
drop policy if exists "posts_insert_by_role" on public.posts;
create policy "posts_insert_by_role"
on public.posts
for insert
to authenticated
with check (
  public.can_manage_content()
  or (public.is_author() and author_id = auth.uid())
);

-- UPDATE: admin/editor tout ; author seulement ses posts
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

-- DELETE: admin/editor tout ; author seulement ses posts
drop policy if exists "posts_delete_by_role" on public.posts;
create policy "posts_delete_by_role"
on public.posts
for delete
to authenticated
using (
  public.can_manage_content()
  or (public.is_author() and author_id = auth.uid())
);

-- -------------------------
-- POST_TAGS (hérite des droits du post)
-- -------------------------

-- lecture publique: tags d’un post publié
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

-- lecture privée: editor/admin ou auteur du post
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

-- write: editor/admin ou auteur du post
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

-- -------------------------
-- POST_BLOCKS (lecture publique si post publié, write si droit sur post)
-- -------------------------

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

commit;

-- ============================================================
-- OPTIONAL: Storage bucket (images)
-- A exécuter seulement si tu veux tout gérer en SQL.
-- Sinon tu le fais dans l’UI Supabase (Storage -> New bucket).
-- ============================================================
-- -- create bucket
-- insert into storage.buckets (id, name, public)
-- values ('post-images', 'post-images', true)
-- on conflict (id) do nothing;
--
-- -- politiques lecture publique
-- drop policy if exists "public read post-images" on storage.objects;
-- create policy "public read post-images"
-- on storage.objects for select
-- using (bucket_id = 'post-images');
--
-- -- upload réservé aux authenticated (et idéalement editor/admin via edge)
-- drop policy if exists "auth upload post-images" on storage.objects;
-- create policy "auth upload post-images"
-- on storage.objects for insert
-- to authenticated
-- with check (bucket_id = 'post-images');
