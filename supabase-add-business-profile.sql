-- Business profile: logo, Instagram, photos. Run in Supabase SQL Editor.

alter table public.profiles
  add column if not exists business_logo_url text,
  add column if not exists business_instagram_url text,
  add column if not exists business_photos jsonb default '[]'::jsonb;

comment on column public.profiles.business_logo_url is 'URL of business/store logo image';
comment on column public.profiles.business_instagram_url is 'Optional Instagram profile URL';
comment on column public.profiles.business_photos is 'Array of image URLs for business photos';
