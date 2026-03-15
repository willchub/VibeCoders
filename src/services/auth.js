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
 * Sign up with email and password. Optional username for sign-in by username later.
 * Enforces one account per email.
 * @returns {{ user, session, error }}
 */
export const signUp = async ({ email, password, name, role = 'customer', username = '' }) => {
  const safeRole = role === 'business' ? 'business' : 'customer';
  const safeEmail = (email || '').trim().toLowerCase();
  const safeName = (name || '').trim();
  const safeUsername = (username || '').trim();

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
      user_metadata: { full_name: name, role: safeRole, username: safeUsername || undefined },
    };
    const session = { user: mockUser };
    setMockUsers([
      ...users,
      { id: mockUser.id, email: safeEmail, username: safeUsername || null, password, full_name: name, role: safeRole },
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
    options: {
      data: { full_name: safeName || name, role: safeRole },
      emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + '/login' : undefined,
    },
  });
  if (error) {
    const msg = (error.message || '').toLowerCase();
    const code = (error.code || '').toLowerCase();
    const isDuplicateEmail =
      code === 'user_already_exists' ||
      msg.includes('already registered') ||
      msg.includes('already exists') ||
      msg.includes('already in use') ||
      msg.includes('duplicate') ||
      msg.includes('email taken');
    if (isDuplicateEmail) {
      return { user: null, session: null, error: { message: 'This email is already registered.' } };
    }
    return { user: data?.user, session: data?.session, error };
  }
  if (data?.user) {
    try {
      await supabase.from('profiles').update({ role: safeRole }).eq('id', data.user.id);
    } catch (_) {}
    try {
      await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          email: safeEmail,
          ...(safeUsername ? { username: safeUsername } : {}),
        },
        { onConflict: 'id' }
      );
    } catch (_) {}
  }
  const session = data?.session ?? null;
  const needsEmailConfirmation = !!(data?.user && !session);
  return { user: data?.user, session, error: null, needsEmailConfirmation };
};

/**
 * Sign in with email or username and password.
 * @param {{ email?: string, identifier?: string, password: string }} - use identifier (email or username) or email
 */
export const signIn = async ({ email, identifier, password }) => {
  const id = (identifier ?? email ?? '').trim();
  if (!id || !password) {
    return { user: null, session: null, error: { message: 'Please enter your email/username and password.' } };
  }

  if (!isSupabaseConfigured()) {
    const users = getMockUsers();
    const byEmail = id.includes('@')
      ? users.find((u) => (u.email || '').toLowerCase() === id.toLowerCase())
      : null;
    const byUsername = byEmail ? null : users.find((u) => (u.username || '').toLowerCase() === id.toLowerCase());
    const userRow = byEmail || byUsername;
    if (!userRow || userRow.password !== password) {
      return { user: null, session: null, error: { message: 'Invalid email/username or password.' } };
    }
    const roles = JSON.parse(localStorage.getItem(MOCK_ROLES_KEY) || '{}');
    const role = roles[userRow.email] || userRow.role || 'customer';
    const mockUser = {
      id: userRow.id,
      email: userRow.email,
      user_metadata: { full_name: userRow.full_name, role, username: userRow.username },
    };
    const session = { user: mockUser };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user: mockUser }));
    return { user: mockUser, session, error: null };
  }

  let loginEmail = id.includes('@') ? id.trim().toLowerCase() : null;
  if (!loginEmail) {
    const { data: profile } = await supabase.from('profiles').select('email').eq('username', id).maybeSingle();
    if (profile?.email) loginEmail = (profile.email || '').trim().toLowerCase();
  }
  if (!loginEmail && !id.includes('@')) {
    return { user: null, session: null, error: { message: 'No account found with that username. Try signing in with your email.' } };
  }
  if (!loginEmail) loginEmail = id.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
  if (error) {
    const msg = error.message || 'Invalid email or password.';
    const hint = (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials'))
      ? ' If you just signed up, check your email and click the confirmation link first.'
      : '';
    return { user: null, session: null, error: { message: msg + hint } };
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
