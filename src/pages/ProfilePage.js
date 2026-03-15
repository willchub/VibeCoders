import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassPageLayout, { GlassCard } from '../components/ui/GlassPageLayout';
import { useAuth } from '../contexts/AuthContext';
import { updateAccountProfile } from '../services/auth';
import { getMyTransactions } from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isBusiness, setUser } = useAuth();
  const [accountForm, setAccountForm] = useState({ name: '', email: '' });
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMessage, setAccountMessage] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setAccountForm({
      name: user.user_metadata?.full_name || '',
      email: user.email || '',
    });
  }, [user]);

  useEffect(() => {
    if (!user?.id || !isAuthenticated) return;
    setTransactionsLoading(true);
    getMyTransactions(user.id)
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setTransactionsLoading(false));
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setAccountSaving(true);
    setAccountMessage(null);
    try {
      const updated = await updateAccountProfile({
        name: accountForm.name,
        email: accountForm.email,
      });
      if (setUser && updated) setUser(updated);
      setAccountMessage({ type: 'success', text: 'Name and email updated.' });
    } catch (err) {
      setAccountMessage({ type: 'error', text: err.message || 'Failed to update account.' });
    } finally {
      setAccountSaving(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!isAuthenticated) return null;

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none';

  return (
    <GlassPageLayout title="My profile" maxWidth="max-w-2xl">
      <GlassCard className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-1">Account</h2>
        <p className="text-zinc-600 text-sm mb-6">Update your {isBusiness ? 'store ' : ''}name and email.</p>
        <form onSubmit={handleSaveAccount} className="space-y-5">
          {accountMessage && (
            <p className={`text-sm px-3 py-2 rounded-lg ${accountMessage.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`} role="alert">
              {accountMessage.text}
            </p>
          )}
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-zinc-700 mb-1">{isBusiness ? 'Store name' : 'Name'}</label>
            <input id="profile-name" type="text" value={accountForm.name} onChange={(e) => setAccountForm((a) => ({ ...a, name: e.target.value }))} placeholder={isBusiness ? 'Your business or store name' : 'Your name'} className={inputClass} />
          </div>
          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input id="profile-email" type="email" value={accountForm.email} onChange={(e) => setAccountForm((a) => ({ ...a, email: e.target.value }))} placeholder="you@example.com" className={inputClass} />
          </div>
          <button type="submit" disabled={accountSaving} className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-medium hover:bg-zinc-100 disabled:opacity-50">
            {accountSaving ? 'Saving…' : 'Save account'}
          </button>
        </form>
      </GlassCard>

      {isBusiness && (
        <GlassCard className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Store profile</h2>
          <p className="text-zinc-600 text-sm mb-4">Manage your logo, Instagram link, and business photos.</p>
          <Link to="/business-settings" className="inline-block px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-medium hover:bg-zinc-100">
            Store settings
          </Link>
        </GlassCard>
      )}

      {!isBusiness && (
        <GlassCard>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Previous bookings</h2>
          <p className="text-zinc-600 text-sm mb-6">Your completed bookings from the marketplace.</p>
          {transactionsLoading ? (
            <p className="text-zinc-600 text-sm">Loading…</p>
          ) : transactions.length === 0 ? (
            <p className="text-zinc-600 text-sm">You have no previous bookings yet.</p>
          ) : (
            <ul className="space-y-4">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-white/10 last:border-0">
                  <div>
                    <p className="font-medium text-zinc-900">{tx.listingTitle}</p>
                    <p className="text-sm text-zinc-600">{tx.seller} · {formatDate(tx.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-primary">${tx.amount} {tx.currency}</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'bg-green-500/20 text-green-700' : tx.status === 'cancelled' ? 'bg-zinc-500/20 text-zinc-700' : 'bg-amber-500/20 text-amber-800'}`}>
                      {tx.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      )}
    </GlassPageLayout>
  );
};

export default ProfilePage;
