import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image, Instagram } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import { updateAccountProfile } from '../services/auth';
import { getBusinessProfile, updateBusinessProfile } from '../services/api';

const BusinessSettingsPage = () => {
  const { user, isAuthenticated, isBusiness, setUser } = useAuth();
  const [accountForm, setAccountForm] = useState({ storeName: '', email: '' });
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMessage, setAccountMessage] = useState(null);
  const [profileForm, setProfileForm] = useState({ logoUrl: '', instagramUrl: '', photoUrlsText: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  useEffect(() => {
    if (!user) return;
    setAccountForm({
      storeName: user.user_metadata?.full_name || '',
      email: user.email || '',
    });
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    getBusinessProfile(user.id).then((p) => {
      setProfileForm({
        logoUrl: p.logoUrl || '',
        instagramUrl: p.instagramUrl || '',
        photoUrlsText: (p.photoUrls || []).join('\n'),
      });
    });
  }, [user?.id]);

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setAccountSaving(true);
    setAccountMessage(null);
    try {
      const updated = await updateAccountProfile({
        name: accountForm.storeName,
        email: accountForm.email,
      });
      if (setUser && updated) setUser(updated);
      setAccountMessage({ type: 'success', text: 'Store name and email updated.' });
    } catch (err) {
      setAccountMessage({ type: 'error', text: err.message || 'Failed to update account.' });
    } finally {
      setAccountSaving(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const photoUrls = profileForm.photoUrlsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      await updateBusinessProfile(user.id, {
        logoUrl: profileForm.logoUrl.trim() || undefined,
        instagramUrl: profileForm.instagramUrl.trim() || undefined,
        photoUrls,
      });
      setProfileMessage({ type: 'success', text: 'Store profile saved. Your logo and photos will appear on your business home.' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to save profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="max-w-md mx-auto px-4 py-16 flex-grow flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-semibold text-brand-secondary mb-2">Sign in required</h2>
            <p className="text-brand-muted text-sm mb-6">Only business accounts can edit store profile. Sign in or register as a business.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/login" className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90">Sign in</Link>
              <Link to="/register" className="px-5 py-2.5 rounded-xl border border-gray-200 text-brand-secondary font-medium hover:bg-gray-50">Register</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isBusiness) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="max-w-md mx-auto px-4 py-16 flex-grow flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-semibold text-brand-secondary mb-2">Business account required</h2>
            <p className="text-brand-muted text-sm mb-6">Only business or admin accounts can edit store profile. Register as a business to get started.</p>
            <Link to="/marketplace" className="inline-block px-5 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90">Back to marketplace</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12 flex-grow w-full">
        <h1 className="font-sans text-3xl font-semibold text-brand-secondary tracking-tight mb-8">My profile</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="font-sans text-lg font-semibold text-brand-secondary mb-1">Account</h2>
          <p className="font-sans text-brand-muted text-sm mb-6">
            Update your store name and email. These are used across the site.
          </p>
          <form onSubmit={handleSaveAccount} className="space-y-5">
            {accountMessage && (
              <p className={`text-sm px-3 py-2 rounded-lg ${accountMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`} role="alert">
                {accountMessage.text}
              </p>
            )}
            <div>
              <label htmlFor="account-store-name" className="block text-sm font-medium text-brand-secondary mb-1">
                Store name
              </label>
              <input
                id="account-store-name"
                type="text"
                value={accountForm.storeName}
                onChange={(e) => setAccountForm((a) => ({ ...a, storeName: e.target.value }))}
                placeholder="Your business or store name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="account-email" className="block text-sm font-medium text-brand-secondary mb-1">
                Email
              </label>
              <input
                id="account-email"
                type="email"
                value={accountForm.email}
                onChange={(e) => setAccountForm((a) => ({ ...a, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={accountSaving}
              className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90 disabled:opacity-50"
            >
              {accountSaving ? 'Saving…' : 'Save account'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="font-sans text-lg font-semibold text-brand-secondary mb-1 flex items-center gap-2">
            <Image className="h-5 w-5 text-brand-primary" />
            Store profile
          </h2>
          <p className="font-sans text-brand-muted text-sm mb-6">
            Add your logo, optional Instagram link, and business photos. These appear on your business home page.
          </p>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {profileMessage && (
              <p className={`text-sm px-3 py-2 rounded-lg ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`} role="alert">
                {profileMessage.text}
              </p>
            )}
            <div>
              <label htmlFor="profile-logo" className="block text-sm font-medium text-brand-secondary mb-1">
                Logo URL
              </label>
              <input
                id="profile-logo"
                type="url"
                value={profileForm.logoUrl}
                onChange={(e) => setProfileForm((p) => ({ ...p, logoUrl: e.target.value }))}
                placeholder="https://... (image URL for your business logo)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
              {profileForm.logoUrl && (
                <div className="mt-2">
                  <img
                    src={profileForm.logoUrl}
                    alt="Logo preview"
                    className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      // hide if invalid URL
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label htmlFor="profile-instagram" className="block text-sm font-medium text-brand-secondary mb-1 flex items-center gap-1">
                <Instagram className="h-4 w-4" /> Instagram (optional)
              </label>
              <input
                id="profile-instagram"
                type="text"
                value={profileForm.instagramUrl}
                onChange={(e) => setProfileForm((p) => ({ ...p, instagramUrl: e.target.value }))}
                placeholder="https://instagram.com/yourhandle or @yourhandle"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="profile-photos" className="block text-sm font-medium text-brand-secondary mb-1">
                Business photos (one image URL per line)
              </label>
              <textarea
                id="profile-photos"
                rows={4}
                value={profileForm.photoUrlsText}
                onChange={(e) => setProfileForm((p) => ({ ...p, photoUrlsText: e.target.value }))}
                placeholder={"https://...\nhttps://...\n(optional)"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y"
              />
            </div>
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90 disabled:opacity-50"
            >
              {profileSaving ? 'Saving…' : 'Save store profile'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessSettingsPage;
