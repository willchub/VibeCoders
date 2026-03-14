import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSession, onAuthStateChange, signOut as authSignOut } from '../services/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const s = await getSession();
      if (mounted && s?.user) {
        setSession(s);
        setUser(s.user);
      }
      if (mounted) setLoading(false);
    };

    init();

    const unsubscribe = onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await authSignOut();
    setUser(null);
    setSession(null);
  };

  /** Call this after signUp/signIn so the header updates immediately without waiting for onAuthStateChange. */
  const setSessionFromAuth = (newSession) => {
    if (newSession?.user) {
      setSession(newSession);
      setUser(newSession.user);
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signOut,
    setSessionFromAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
