-- Add role to profiles (customer | business). Run after supabase-schema.sql
-- Add seller_id to listings so businesses only see their own.

alter table public.profiles
  add column if not exists role text default 'customer' check (role in ('customer', 'business'));

comment on column public.profiles.role is 'customer = can book only; business = can add listings and see own dashboard';

-- Optional: update trigger to set role from signup metadata (if you use options.data.role in signUp)
-- create or replace function public.handle_new_user()
-- returns trigger as $$
-- begin
--   insert into public.profiles (id, full_name, role)
--   values (
--     new.id,
--     coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
--     coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'customer')
--   );
--   return new;
-- end;
-- $$ language plpgsql security definer;

alter table public.listings
  add column if not exists seller_id uuid references auth.users (id) on delete set null;

-- RLS: businesses can only update/delete their own listings
drop policy if exists "Allow update for authenticated" on public.listings;
create policy "Allow update own listings"
  on public.listings for update
  using (auth.uid() = seller_id);

-- Optional: restrict insert to authenticated users with role business (enforce in app or add policy)
-- create policy "Allow insert listings as business"
--   on public.listings for insert
--   with check (
--     auth.uid() is not null
--     and exists (select 1 from public.profiles where id = auth.uid() and role = 'business')
--   );

-- Allow select own listings for dashboard (all can read for marketplace already)
create policy "Allow select own listings"
  on public.listings for select
  using (true);
