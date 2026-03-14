-- Add status column to listings table so we can mark deals as sold.
-- Run this in Supabase SQL Editor if your listings table already exists.

alter table public.listings
  add column if not exists status text not null default 'available'
  check (status in ('available', 'sold', 'cancelled'));

