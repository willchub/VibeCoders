-- =============================================================================
-- Transactions table: one row per completed (or cancelled) booking/payment.
-- Run in Supabase SQL Editor.
-- =============================================================================

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  -- What was booked
  listing_id text not null,
  listing_title text,
  seller text,

  -- Amount and currency
  amount numeric not null check (amount >= 0),
  currency text not null default 'USD',

  -- Status: completed, cancelled, refunded
  status text not null default 'completed' check (status in ('completed', 'cancelled', 'refunded')),

  -- How they paid (card, paypal, etc.)
  payment_method text default 'card',

  -- Who paid (optional – guest checkout has no user)
  user_id uuid references auth.users (id) on delete set null,
  buyer_email text
);

-- Index for listing and user lookups
create index if not exists idx_transactions_listing_id on public.transactions (listing_id);
create index if not exists idx_transactions_user_id on public.transactions (user_id);
create index if not exists idx_transactions_created_at on public.transactions (created_at desc);

alter table public.transactions enable row level security;

-- Anyone can read (e.g. for “My bookings” – tighten later to own rows only)
create policy "Allow public read transactions"
  on public.transactions for select
  using (true);

-- Allow insert so the app can record a transaction when a booking is completed
create policy "Allow insert transactions"
  on public.transactions for insert
  with check (true);

-- Optional: allow update for status changes (e.g. refund)
create policy "Allow update transactions"
  on public.transactions for update
  using (true);
