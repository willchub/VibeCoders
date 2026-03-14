-- =============================================================================
-- Add location columns to listings. Run in Supabase SQL Editor.
-- Use this if your listings table already exists without location fields.
-- =============================================================================

-- Add nullable location columns (existing rows get NULL; new/updated get values)
alter table public.listings
  add column if not exists lat numeric,
  add column if not exists lng numeric,
  add column if not exists address text;

-- Optional: add a check so if one of lat/lng is set, both should be set
-- alter table public.listings add constraint listings_lat_lng_pair
--   check (
--     (lat is null and lng is null) or
--     (lat is not null and lng is not null)
--   );
