import React, { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import { signIn } from '../services/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSessionFromAuth } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/marketplace';
  const confirmMessage = searchParams.get('message') === 'confirm';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const signInIntentRef = useRef('customer');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter your email or username and password.');
      return;
    }
    setLoading(true);
    try {
      const { user, session: newSession, error: authError } = await signIn({
        identifier: identifier.trim(),
        password,
      });
      if (authError) {
        setError(authError.message || 'Sign in failed.');
        return;
      }
      if (user) {
        setSessionFromAuth(newSession || { user });
        const destination = signInIntentRef.current === 'business' ? '/seller-dashboard' : (redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`);
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-md mx-auto px-4 py-16 flex-grow w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="font-sans text-2xl font-semibold text-brand-secondary mb-2 tracking-tight">Sign in</h1>
          <p className="font-sans text-brand-muted text-sm mb-6">
            Welcome back. Sign in to book deals and manage your account.
          </p>
          {confirmMessage && (
            <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2" role="status">
              Account created. Check your email to confirm your account, then sign in below.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-identifier" className="block text-sm font-medium text-brand-secondary mb-1">
                Email or username
              </label>
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or username"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
              {error && (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {error}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-brand-secondary mb-1">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                onClick={() => { signInIntentRef.current = 'customer'; }}
                className="flex-1 py-3 rounded-xl bg-brand-secondary text-white font-semibold hover:bg-brand-secondary/90 transition-colors disabled:opacity-70"
              >
                {loading ? 'Signing in…' : 'Sign in as user'}
              </button>
              <button
                type="submit"
                disabled={loading}
                onClick={() => { signInIntentRef.current = 'business'; }}
                className="flex-1 py-3 rounded-xl border-2 border-brand-secondary text-brand-secondary font-semibold hover:bg-brand-secondary/10 transition-colors disabled:opacity-70"
              >
                {loading ? 'Signing in…' : 'Sign in as business'}
              </button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-brand-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
