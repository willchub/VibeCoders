import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import GlassPageLayout, { GlassCard } from '../components/ui/GlassPageLayout';
import { useAuth } from '../contexts/AuthContext';
import { signIn } from '../services/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSessionFromAuth } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/marketplace';
  const confirmMessage = searchParams.get('message') === 'confirm';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { user, session: newSession, error: authError } = await signIn({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(authError.message || 'Sign in failed.');
        return;
      }
      if (user) {
        setSessionFromAuth(newSession || { user });
        navigate(redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`, { replace: true });
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none';

  return (
    <GlassPageLayout title="Sign in" subtitle="Welcome back. Sign in to book deals and manage your account." maxWidth="max-w-md">
      <GlassCard>
        {confirmMessage && (
          <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2" role="status">
            Account created. Check your email and click the confirmation link, then sign in below.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
            {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-100 transition-colors disabled:opacity-70"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-primary hover:underline">Register</Link>
        </p>
      </GlassCard>
    </GlassPageLayout>
  );
};

export default LoginPage;
