import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter email and password.');
      return;
    }
    // Mock sign in – in a real app you would call an auth API
    console.log('Sign in', { email, password });
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-md mx-auto px-4 py-16 flex-grow w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-brand-secondary mb-2">Sign in</h1>
          <p className="text-brand-muted text-sm mb-6">
            Welcome back. Sign in to book deals and manage your account.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg" role="alert">
                {error}
              </p>
            )}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-brand-secondary mb-1">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
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
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-secondary text-white font-semibold hover:bg-brand-secondary/90 transition-colors"
            >
              Sign in
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-brand-muted">
            Don’t have an account?{' '}
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
