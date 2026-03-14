import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    // Mock register – in a real app you would call an auth API
    console.log('Register', { name, email, password });
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-md mx-auto px-4 py-16 flex-grow w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-brand-secondary mb-2">Create an account</h1>
          <p className="text-brand-muted text-sm mb-6">
            Register to book last-minute deals and list your own services.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg" role="alert">
                {error}
              </p>
            )}
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-brand-secondary mb-1">
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-brand-secondary mb-1">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-brand-secondary mb-1">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="register-confirm" className="block text-sm font-medium text-brand-secondary mb-1">
                Confirm password
              </label>
              <input
                id="register-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-secondary text-white font-semibold hover:bg-brand-secondary/90 transition-colors"
            >
              Register
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-brand-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
