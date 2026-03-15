import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Store } from 'lucide-react';
import GlassPageLayout, { GlassCard } from '../components/ui/GlassPageLayout';
import { useAuth } from '../contexts/AuthContext';
import { signUp } from '../services/auth';

const ROLE_CUSTOMER = 'customer';
const ROLE_BUSINESS = 'business';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setSessionFromAuth } = useAuth();
  const [role, setRole] = useState(ROLE_CUSTOMER);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorName, setErrorName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorEmail('');
    setErrorName('');
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
    setLoading(true);
    try {
      const { user, session: newSession, error: authError, needsEmailConfirmation } = await signUp({
        email: email.trim(),
        password,
        name: name.trim(),
        role,
        username: username.trim() || undefined,
      });
      if (authError) {
        const msg = authError.message || 'Registration failed.';
        if (msg.includes('email') && msg.toLowerCase().includes('already')) {
          setErrorEmail('This email is already registered.');
        } else if (msg.includes('name') && msg.toLowerCase().includes('already')) {
          setErrorName('This name is already registered.');
        } else {
          setError(msg);
        }
        return;
      }
      if (user) {
        if (needsEmailConfirmation) {
          navigate('/login?message=confirm', { replace: true });
          return;
        }
        setSessionFromAuth(newSession || { user });
        if (role === ROLE_BUSINESS) navigate('/seller-dashboard');
        else navigate('/marketplace');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none';

  return (
    <GlassPageLayout title="Create an account" subtitle="Choose how you want to use the marketplace." maxWidth="max-w-md">
      <GlassCard>
        <div className="flex rounded-xl border border-gray-200 p-1 mb-6 bg-gray-100">
          <button
            type="button"
            onClick={() => setRole(ROLE_CUSTOMER)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
              role === ROLE_CUSTOMER ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <User className="h-4 w-4" />
            I'm a customer
          </button>
          <button
            type="button"
            onClick={() => setRole(ROLE_BUSINESS)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
              role === ROLE_BUSINESS ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Store className="h-4 w-4" />
            I'm a business
          </button>
        </div>
        <p className="text-xs text-zinc-600 mb-6">
          {role === ROLE_BUSINESS
            ? 'Business accounts can add listings and manage their own appointments. Customers can only book and view their bookings.'
            : 'Customers can browse deals and book appointments. Sign in to complete purchases and see your bookings.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200" role="alert">{error}</p>
          )}
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-zinc-700 mb-1">
              {role === ROLE_BUSINESS ? 'Business or your name' : 'Full name'}
            </label>
            <input id="register-name" type="text" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setErrorName(''); }} placeholder={role === ROLE_BUSINESS ? 'e.g. The Dapper Barber' : 'Jane Doe'} className={inputClass} />
            {errorName && <p className="mt-1 text-xs text-red-600" role="alert">{errorName}</p>}
          </div>
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input id="register-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrorEmail(''); }} placeholder="you@example.com" className={inputClass} />
            {errorEmail && <p className="mt-1 text-xs text-red-600" role="alert">{errorEmail}</p>}
          </div>
          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input id="register-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
          </div>
          <div>
            <label htmlFor="register-confirm" className="block text-sm font-medium text-zinc-700 mb-1">Confirm password</label>
            <input id="register-confirm" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-100 transition-colors disabled:opacity-70">
            {loading ? 'Creating account…' : role === ROLE_BUSINESS ? 'Register as business' : 'Register as customer'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-600">
          Already have an account? <Link to="/login" className="font-medium text-brand-primary hover:underline">Sign in</Link>
        </p>
      </GlassCard>
    </GlassPageLayout>
  );
};

export default RegisterPage;
