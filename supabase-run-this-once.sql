-- =============================================================================
-- Run this ONCE in Supabase Dashboard → SQL Editor → New query → Run
-- Fixes 400 errors and makes "My business" + business profile work.
-- =============================================================================

-- 1. Add role + seller_id (My business listings)
alter table public.profiles
  add column if not exists role text default 'customer' check (role in ('customer', 'business'));

comment on column public.profiles.role is 'customer = can book only; business = can add listings and see own dashboard';

alter table public.listings
  add column if not exists seller_id uuid references auth.users (id) on delete set null;

-- Status: available = live, sold = booked, expired = appointment time passed
alter table public.listings
  add column if not exists status text default 'available' check (status in ('available', 'sold', 'expired'));

comment on column public.listings.status is 'available = active listing; sold = booked; expired = appointment time passed';

-- If status column already existed with a different constraint, allow 'expired' too:
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings add constraint listings_status_check
  check (status in ('available', 'sold', 'expired'));

drop policy if exists "Allow update for authenticated" on public.listings;
create policy "Allow update own listings"
  on public.listings for update
  using (auth.uid() = seller_id);

create policy "Allow select own listings"
  on public.listings for select
  using (true);

create policy "Allow delete own listings"
  on public.listings for delete
  using (auth.uid() = seller_id);

-- 2. Add business profile columns (logo, Instagram, photos)
alter table public.profiles
  add column if not exists business_logo_url text,
  add column if not exists business_instagram_url text,
  add column if not exists business_photos jsonb default '[]'::jsonb;

comment on column public.profiles.business_logo_url is 'URL of business/store logo image';
comment on column public.profiles.business_instagram_url is 'Optional Instagram profile URL';
comment on column public.profiles.business_photos is 'Array of image URLs for business photos';

-- Allow anyone to read business profile fields (logo, Instagram, photos) so listing detail pages can show them
create policy "Allow read business profile for listing display"
  on public.profiles for select
  using (true);
