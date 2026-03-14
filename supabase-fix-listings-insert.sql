-- Run this in Supabase SQL Editor if listings table already exists but inserts fail.
-- This replaces the "authenticated only" insert policy with one that allows any insert.

drop policy if exists "Allow insert for authenticated" on public.listings;

create policy "Allow insert listings"
  on public.listings for insert
  with check (true);
