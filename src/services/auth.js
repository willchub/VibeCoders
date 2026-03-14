import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const MOCK_SESSION_KEY = 'lastminute_mock_session';

/**
 * Sign up with email and password. Uses Supabase when configured.
 * When Supabase has "Confirm email" disabled, returns session so user is logged in immediately.
 * @returns {{ user, session, error }}
 */
export const signUp = async ({ email, password, name }) => {
  if (!isSupabaseConfigured()) {
    const mockUser = { email, user_metadata: { full_name: name } };
    const session = { user: mockUser };
    try {
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user: mockUser }));
    } catch (_) {}
    return { user: mockUser, session, error: null };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  return { user: data?.user, session: data?.session, error };
};

/**
 * Sign in with email and password. Uses Supabase when configured.
 * @returns {{ user, session, error }}
 */
export const signIn = async ({ email, password }) => {
  if (!isSupabaseConfigured()) {
    const mockUser = { email };
    const session = { user: mockUser };
    try {
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user: mockUser }));
    } catch (_) {}
    return { user: mockUser, session, error: null };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data?.user, session: data?.session, error };
};

/**
 * Sign out. Clears Supabase session and, in mock mode, clears persisted mock session.
 */
export const signOut = async () => {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  } else {
    try {
      localStorage.removeItem(MOCK_SESSION_KEY);
    } catch (_) {}
  }
};

/**
 * Get current session. With Supabase: from client (persisted in localStorage by Supabase).
 * Without Supabase: from our own localStorage key so user stays logged in across reloads.
 */
export const getSession = async () => {
  if (isSupabaseConfigured()) {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
  try {
    const raw = localStorage.getItem(MOCK_SESSION_KEY);
    if (!raw) return null;
    const { user } = JSON.parse(raw);
    return user ? { user } : null;
  } catch (_) {
    return null;
  }
};

/**
 * Subscribe to auth state changes (e.g. sign in/out). Only works when Supabase is configured.
 */
export const onAuthStateChange = (callback) => {
  if (!isSupabaseConfigured()) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
};
