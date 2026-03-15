import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

function toError(err) {
  if (err instanceof Error) return err;
  return new Error(err?.message || err?.error_description || String(err?.code || 'Auth request failed'));
}

const MOCK_SESSION_KEY = 'lastminute_mock_session';
const MOCK_ROLES_KEY = 'lastminute_mock_roles';
const MOCK_USERS_KEY = 'lastminute_mock_users';

function getMockUsers() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function setMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

/**
 * Sign up with email and password. Enforces one account per email.
 * role: 'customer' | 'business'.
 * @returns {{ user, session, error }}
 */
export const signUp = async ({ email, password, name, role = 'customer' }) => {
  const safeRole = role === 'business' ? 'business' : 'customer';
  const safeEmail = (email || '').trim().toLowerCase();
  const safeName = (name || '').trim();

  if (!isSupabaseConfigured()) {
    const users = getMockUsers();
    if (users.some((u) => (u.email || '').toLowerCase() === safeEmail)) {
      return { user: null, session: null, error: { message: 'This email is already registered.' } };
    }
    if (safeName && users.some((u) => (u.full_name || '').trim().toLowerCase() === safeName.toLowerCase())) {
      return { user: null, session: null, error: { message: 'This name is already registered.' } };
    }
    const mockUser = {
      id: `mock-${Date.now()}`,
      email: safeEmail,
      user_metadata: { full_name: name, role: safeRole },
    };
    const session = { user: mockUser };
    setMockUsers([
      ...users,
      { id: mockUser.id, email: safeEmail, password, full_name: name, role: safeRole },
    ]);
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user: mockUser }));
    const roles = JSON.parse(localStorage.getItem(MOCK_ROLES_KEY) || '{}');
    roles[safeEmail] = safeRole;
    localStorage.setItem(MOCK_ROLES_KEY, JSON.stringify(roles));
    return { user: mockUser, session, error: null };
  }

  if (supabase && safeName) {
    const { data: existingProfiles, error: profileError } = await supabase.from('profiles').select('full_name');
    if (!profileError && Array.isArray(existingProfiles)) {
      const nameTaken = existingProfiles.some(
        (p) => (p.full_name || '').trim().toLowerCase() === safeName.toLowerCase()
      );
      if (nameTaken) {
        return { user: null, session: null, error: { message: 'This name is already registered.' } };
      }
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email: safeEmail,
    password,
    options: { data: { full_name: safeName || name, role: safeRole } },
  });
  if (error) {
    const msg = error.message || '';
    if (msg.toLowerCase().includes('already registered') || error.code === 'user_already_exists') {
      return { user: null, session: null, error: { message: 'This email is already registered.' } };
    }
    return { user: data?.user, session: data?.session, error };
  }
  if (data?.user && safeRole === 'business') {
    try {
      await supabase.from('profiles').update({ role: safeRole }).eq('id', data.user.id);
    } catch (_) {}
  }
  return { user: data?.user, session: data?.session, error: null };
};

/**
 * Sign in with email and password.
 * @returns {{ user, session, error }}
 */
export const signIn = async ({ email, password }) => {
  const safeEmail = (email || '').trim().toLowerCase();
  if (!safeEmail || !password) {
    return { user: null, session: null, error: { message: 'Please enter email and password.' } };
  }

  if (!isSupabaseConfigured()) {
    const users = getMockUsers();
    const userRow = users.find((u) => (u.email || '').toLowerCase() === safeEmail);
    if (!userRow || userRow.password !== password) {
      return { user: null, session: null, error: { message: 'Invalid email or password.' } };
    }
    const roles = JSON.parse(localStorage.getItem(MOCK_ROLES_KEY) || '{}');
    const role = roles[userRow.email] || userRow.role || 'customer';
    const mockUser = {
      id: userRow.id,
      email: userRow.email,
      user_metadata: { full_name: userRow.full_name, role },
    };
    const session = { user: mockUser };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user: mockUser }));
    return { user: mockUser, session, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: safeEmail, password });
  if (error) {
    return { user: null, session: null, error: { message: error.message || 'Invalid email or password.' } };
  }
  return { user: data?.user, session: data?.session, error: null };
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
    if (error) throw toError(error);
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
