-- =============================================================================
-- Run this in Supabase Dashboard → SQL Editor → New query
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PROFILES (extends Supabase Auth users with display info)
-- Supabase Auth already has auth.users for email/password; this table stores
-- extra fields like full_name. One row per user, id = auth.uid().
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can read and update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile when a new user signs up (auth.users insert)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. LISTINGS (marketplace items)
-- -----------------------------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text not null,
  seller text not null,
  type text not null default 'Salon',
  original_price numeric not null check (original_price >= 0),
  discounted_price numeric not null check (discounted_price >= 0),
  image_url text,
  appointment_time timestamptz not null default now(),
  rating numeric default 4.5,
  reviews integer default 0
);

alter table public.listings enable row level security;

-- Anyone can read listings (public marketplace)
create policy "Allow public read"
  on public.listings for select
  using (true);

-- Allow anyone to insert (so listing creation works with or without login)
-- Tighten later to "auth.role() = 'authenticated'" if you require login to create
create policy "Allow insert listings"
  on public.listings for insert
  with check (true);

-- Allow update (optional; tighten later with user_id)
create policy "Allow update for authenticated"
  on public.listings for update
  using (true);
