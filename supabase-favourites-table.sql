-- =============================================================================
-- Favourites (wishlist) for customer users. Run in Supabase SQL Editor.
-- Expired listings are removed from favourites when the list is loaded (see API).
-- =============================================================================

create table if not exists public.user_favourites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index if not exists idx_user_favourites_user_id on public.user_favourites (user_id);
create index if not exists idx_user_favourites_listing_id on public.user_favourites (listing_id);

comment on table public.user_favourites is 'Customer favourites; expired listings are removed when fetching.';

alter table public.user_favourites enable row level security;

create policy "Users can manage own favourites"
  on public.user_favourites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
