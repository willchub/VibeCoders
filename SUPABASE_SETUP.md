# Supabase setup

## How data is stored now

- **Users:** Not stored. Login and Register only validate the form and redirect; there is no database or session. With Supabase configured, users are stored in **Supabase Auth** (built-in `auth.users`).
- **Listings:** Stored in memory in `src/services/api.js` (a `mockListings` array). Data is lost on refresh. With Supabase configured, listings are read/written from a **`listings`** table in your Supabase project.

The app works without Supabase (mock data and mock auth). When you set the env vars below, it switches to Supabase for both.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → choose org, name, database password, region.
3. Wait for the project to be ready.

---

## 2. Get your API keys

In the Supabase dashboard: **Project Settings** → **API**.

- **Project URL** → use as `REACT_APP_SUPABASE_URL`
- **anon public** key → use as `REACT_APP_SUPABASE_ANON_KEY`

---

## 3. Create the `listings` table

In the dashboard: **SQL Editor** → **New query**. Run:

```sql
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

-- Allow anonymous read (so the marketplace can load listings)
-- Restrict insert/update/delete to authenticated users if you add RLS later
alter table public.listings enable row level security;

create policy "Allow public read"
  on public.listings for select
  using (true);

create policy "Allow insert for authenticated"
  on public.listings for insert
  with check (true);

create policy "Allow update for authenticated"
  on public.listings for update
  using (true);
```

(You can tighten RLS later by restricting insert/update to `auth.uid()` and a `user_id` column.)

---

## 3b. (Optional) Listing image uploads

Sellers can upload listing images via a dropzone instead of pasting URLs. To enable this:

1. In the dashboard go to **Storage** → **New bucket**.
2. Create a bucket named **`listing-images`**.
3. Make it **Public** so listing images can be displayed without signed URLs.
4. Add a policy so authenticated users can upload: **Policies** → **New policy** → “For full customization” and allow `INSERT` (and optionally `UPDATE`, `DELETE`) for `auth.role() = 'authenticated'` on the `listing-images` bucket.

If the bucket doesn’t exist, the app will show an error when a seller tries to upload an image; they can leave the image empty to use the default placeholder.

---

## 4. Configure the app

In the project root, copy the example env and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

**Important:** Restart the dev server after adding or changing `.env` (`npm start`). Create React App only reads `REACT_APP_*` vars when the server starts, so the database will not be used until you restart.

---

## If the database still isn’t updating

1. **Restart the dev server** after any `.env` change so `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are loaded.
2. **Create the tables** by running the full `supabase-schema.sql` in the SQL Editor (or run `supabase-fix-listings-insert.sql` if the `listings` table already exists but inserts fail).
3. **Check the UI** – creating a listing now shows the real Supabase error message if something fails; the marketplace shows an error if loading listings fails.

**Users** are stored in **Authentication → Users** in the dashboard (Supabase Auth), not in a custom “users” table. **Listings** are in **Table Editor → `listings`**.

---

## Troubleshooting: "listings_seller_id_fkey" when creating a listing

This means `listings.seller_id` points to a row that doesn’t exist in the referenced table.

- **If `seller_id` references `auth.users (id)`:** The app sends the logged-in user’s id. Sign out and sign in again so the session matches the database. In the dashboard, check **Authentication → Users** and confirm your user exists.
- **If `seller_id` references `public.profiles (id)`:** Each auth user must have a profile row. The schema uses a trigger `on_auth_user_created` to create a profile on signup. If the trigger was added after you created your user, your profile may be missing. Run in SQL Editor:

  ```sql
  insert into public.profiles (id, full_name)
  values (auth.uid(), coalesce(auth.jwt()->>'user_metadata'->>'full_name', ''))
  on conflict (id) do update set full_name = excluded.full_name;
  ```

  (Run while logged in so `auth.uid()` is your user id.) The app also calls `ensureProfileExists()` before creating a listing to reduce this issue.

## Login not working after register

If you can register but **cannot sign in** with the same email/password:

1. **Email confirmation:** In Supabase go to **Authentication → Providers → Email**. If **Confirm email** is enabled, new users must click the link in the confirmation email before they can sign in. Either turn off **Confirm email** for development (sign-in works immediately), or leave it on and use the link in the email—after register the app sends you to the login page with a message to check your email.
2. **Profiles table:** Run `supabase-add-username-email.sql` in the SQL Editor so `profiles` has `username` and `email` columns. New signups will then save correctly and you can sign in with email or username.

---

## Files involved

| File | Role |
|------|------|
| `src/lib/supabaseClient.js` | Creates the Supabase client from env vars; exports `supabase` and `isSupabaseConfigured()` |
| `src/services/auth.js` | `signUp`, `signIn`, `signOut`, `getSession`, `onAuthStateChange` (use Supabase when configured) |
| `src/services/api.js` | `getListings()` and `createListing()`; use Supabase when configured, else mock data |
| `src/pages/LoginPage.js` | Calls `signIn()` from auth service |
| `src/pages/RegisterPage.js` | Calls `signUp()` from auth service |
