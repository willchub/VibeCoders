-- Add username and email to profiles for sign-in by username.
-- Run in Supabase Dashboard → SQL Editor (after supabase-schema.sql and supabase-add-role-and-seller.sql).
-- email: so we can look up auth email from username on the client.
-- username: unique so one account per username; optional (null allowed).

alter table public.profiles
  add column if not exists username text unique,
  add column if not exists email text;

comment on column public.profiles.username is 'Optional; used for sign-in by username (must be unique)';
comment on column public.profiles.email is 'Copy of auth email; used to resolve username -> email for signIn';

-- Allow unique constraint to allow multiple nulls (optional username)
-- In PostgreSQL, unique columns allow multiple NULLs by default, so the above is fine.
