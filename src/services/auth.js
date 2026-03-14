import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const MOCK_SESSION_KEY = 'lastminute_mock_session';
const MOCK_ROLES_KEY = 'lastminute_mock_roles';

/**
 * Sign up with email and password. Uses Supabase when configured.
 * role: 'customer' | 'business' (customer = general user, business = can add listings).
 * @returns {{ user, session, error }}
 */
export const signUp = async ({ email, password, name, role = 'customer' }) => {
  const safeRole = role === 'business' ? 'business' : 'customer';
  if (!isSupabaseConfigured()) {
    const mockUser = { id: `mock-${Date.now()}`, email, user_metadata: { full_name: name, role: safeRole } };
    const session = { user: mockUser };
    try {
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user: mockUser }));
      const roles = JSON.parse(localStorage.getItem(MOCK_ROLES_KEY) || '{}');
      roles[email] = safeRole;
      localStorage.setItem(MOCK_ROLES_KEY, JSON.stringify(roles));
    } catch (_) {}
    return { user: mockUser, session, error: null };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, role: safeRole } },
  });
  if (data?.user && safeRole === 'business') {
    try {
      await supabase.from('profiles').update({ role: safeRole }).eq('id', data.user.id);
    } catch (_) {}
  }
  return { user: data?.user, session: data?.session, error };
};

/**
 * Sign in with email and password. Uses Supabase when configured.
 * @returns {{ user, session, error }}
 */
export const signIn = async ({ email, password }) => {
  if (!isSupabaseConfigured()) {
    try {
      const roles = JSON.parse(localStorage.getItem(MOCK_ROLES_KEY) || '{}');
      const role = roles[email] || 'customer';
      const mockUser = { id: `mock-${Date.now()}`, email, user_metadata: { role } };
      const session = { user: mockUser };
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user: mockUser }));
      return { user: mockUser, session, error: null };
    } catch (_) {
      const mockUser = { id: `mock-${Date.now()}`, email, user_metadata: { role: 'customer' } };
      return { user: mockUser, session: { user: mockUser }, error: null };
    }
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

/**
 * Update account profile (name and/or email). For business this is the store name.
 * Supabase: auth.updateUser; mock: update stored session and roles.
 * @param {{ name?: string, email?: string }}
 */
export const updateAccountProfile = async ({ name, email }) => {
  if (isSupabaseConfigured()) {
    const updates = {};
    if (email != null && email.trim() !== '') updates.email = email.trim();
    if (name != null) updates.data = { full_name: name.trim() };
    if (Object.keys(updates).length === 0) return;
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data?.user;
  }
  try {
    const raw = localStorage.getItem(MOCK_SESSION_KEY);
    if (!raw) throw new Error('Not signed in');
    const { user } = JSON.parse(raw);
    const updatedUser = {
      ...user,
      email: email != null && email.trim() !== '' ? email.trim() : user.email,
      user_metadata: {
        ...user.user_metadata,
        ...(name != null ? { full_name: name.trim() } : {}),
      },
    };
    if (email != null && email.trim() !== '' && email.trim() !== user.email) {
      const roles = JSON.parse(localStorage.getItem(MOCK_ROLES_KEY) || '{}');
      roles[updatedUser.email] = roles[user.email] ?? 'customer';
      delete roles[user.email];
      localStorage.setItem(MOCK_ROLES_KEY, JSON.stringify(roles));
    }
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user: updatedUser }));
    return updatedUser;
  } catch (e) {
    throw e?.message ? e : new Error('Failed to update profile');
  }
};
