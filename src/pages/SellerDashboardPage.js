import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, MapPin, Image, Instagram } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LocationPicker from '../components/map/LocationPicker';
import { useAuth } from '../contexts/AuthContext';
import { getMyListings, saveStoreLocation, createListing, getBusinessProfile, updateBusinessProfile } from '../services/api';

const LISTING_TYPES = ['Barbershop', 'Gym Class', 'Salon', 'Physio'];

// Preset locations for the dropdown when creating a listing
const PRESET_LOCATIONS = [
  { id: 'melbourne-cbd', label: 'Melbourne CBD', lat: -37.8136, lng: 144.9631, address: 'Melbourne CBD, VIC' },
  { id: 'sydney-cbd', label: 'Sydney CBD', lat: -33.8688, lng: 151.2093, address: 'Sydney CBD, NSW' },
  { id: 'brisbane-cbd', label: 'Brisbane CBD', lat: -27.4698, lng: 153.0251, address: 'Brisbane CBD, QLD' },
  { id: 'perth-cbd', label: 'Perth CBD', lat: -31.9505, lng: 115.8605, address: 'Perth CBD, WA' },
  { id: 'adelaide-cbd', label: 'Adelaide CBD', lat: -34.9285, lng: 138.6007, address: 'Adelaide CBD, SA' },
  { id: 'custom', label: 'Custom (pick on map below)', lat: null, lng: null, address: null },
];

const SellerDashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isBusiness } = useAuth();
  const [listings, setListings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [location, setLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    seller: '',
    type: 'Salon',
    originalPrice: '',
    discountedPrice: '',
    imageUrl: '',
    appointmentTime: '',
    location: null,
  });
  const [profileForm, setProfileForm] = useState({ logoUrl: '', instagramUrl: '', photoUrlsText: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  useEffect(() => {
    if (user?.id) getMyListings(user.id).then(setListings);
    else setListings([]);
  }, [user?.id]);

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

  const selectedListing = listings.find((l) => l.id === selectedId);

  useEffect(() => {
    if (selectedListing?.location) {
      setLocation({ ...selectedListing.location });
    } else {
      setLocation(null);
    }
  }, [selectedId, selectedListing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.title.trim()) {
      setError('Please enter a service title.');
      return;
    }
    if (!form.seller.trim()) {
      setError('Please enter your business or name.');
      return;
    }
    const original = Number(form.originalPrice);
    const discounted = Number(form.discountedPrice);
    if (Number.isNaN(original) || original < 0 || Number.isNaN(discounted) || discounted < 0) {
      setError('Please enter valid prices.');
      return;
    }
    if (discounted >= original) {
      setError('Discounted price should be lower than original price.');
      return;
    }
    if (!user?.id) {
      setError('You must be signed in as a business to add listings.');
      return;
    }
    try {
      await createListing(
        {
          ...form,
          originalPrice: original,
          discountedPrice: discounted,
          location: form.location,
        },
        user.id
      );
      setSuccess('Listing created. It will appear on the marketplace and map.');
      setForm({
        title: '',
        seller: '',
        type: 'Salon',
        originalPrice: '',
        discountedPrice: '',
        imageUrl: '',
        appointmentTime: '',
        location: null,
      });
      getMyListings(user.id).then(setListings);
    } catch (err) {
      const message = err?.message || err?.error_description || 'Something went wrong. Please try again.';
      setError(message);
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

  const handleSaveLocation = async () => {
    if (!selectedId || !location?.lat) {
      setMessage({ type: 'error', text: 'Select a store and pick a location on the map.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await saveStoreLocation(selectedId, location);
      setMessage({ type: 'success', text: 'Store location saved.' });
      setListings((prev) =>
        prev.map((l) => (l.id === selectedId ? { ...l, location: { ...location } } : l))
      );
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="max-w-md mx-auto px-4 py-16 flex-grow flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-semibold text-brand-secondary mb-2">Sign in required</h2>
            <p className="text-brand-muted text-sm mb-6">Only business accounts can add and manage listings. Sign in or register as a business.</p>
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
            <p className="text-brand-muted text-sm mb-6">Only business or admin accounts can add listings and see this dashboard. Register as a business to get started.</p>
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

        {/* Create listing */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="font-sans text-lg font-semibold text-brand-secondary mb-1 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-brand-primary" />
            Create a listing
          </h2>
          <p className="font-sans text-brand-muted text-sm mb-6">
            Fill in the details below to post a last-minute deal. It will appear on the marketplace.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg" role="status">
                {success}
              </p>
            )}
            <div>
              <label htmlFor="listing-title" className="block text-sm font-medium text-brand-secondary mb-1">
                Service title
              </label>
              <input
                id="listing-title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Last-Minute Men's Haircut"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="listing-seller" className="block text-sm font-medium text-brand-secondary mb-1">
                Business / your name
              </label>
              <input
                id="listing-seller"
                name="seller"
                type="text"
                value={form.seller}
                onChange={handleChange}
                placeholder="e.g. The Dapper Barber"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="listing-type" className="block text-sm font-medium text-brand-secondary mb-1">
                Category
              </label>
              <select
                id="listing-type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none bg-white"
              >
                {LISTING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="listing-original" className="block text-sm font-medium text-brand-secondary mb-1">
                  Original price ($)
                </label>
                <input
                  id="listing-original"
                  name="originalPrice"
                  type="number"
                  min="0"
                  step="1"
                  value={form.originalPrice}
                  onChange={handleChange}
                  placeholder="40"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>
              <div>
                <label htmlFor="listing-discounted" className="block text-sm font-medium text-brand-secondary mb-1">
                  Discounted price ($)
                </label>
                <input
                  id="listing-discounted"
                  name="discountedPrice"
                  type="number"
                  min="0"
                  step="1"
                  value={form.discountedPrice}
                  onChange={handleChange}
                  placeholder="25"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="listing-image" className="block text-sm font-medium text-brand-secondary mb-1">
                Image URL
              </label>
              <input
                id="listing-image"
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
              <p className="mt-1 text-xs text-brand-muted">Optional. Leave blank for a default image.</p>
            </div>
            <div>
              <label htmlFor="listing-time" className="block text-sm font-medium text-brand-secondary mb-1">
                Appointment date & time
              </label>
              <input
                id="listing-time"
                name="appointmentTime"
                type="datetime-local"
                value={form.appointmentTime}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="listing-location-preset" className="block text-sm font-medium text-brand-secondary mb-1">
                Location
              </label>
              <select
                id="listing-location-preset"
                value={PRESET_LOCATIONS.find((p) => p.lat === form.location?.lat && p.lng === form.location?.lng)?.id || (form.location ? 'custom' : '')}
                onChange={(e) => {
                  const preset = PRESET_LOCATIONS.find((p) => p.id === e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    location: preset && preset.lat != null ? { lat: preset.lat, lng: preset.lng, address: preset.address } : prev.location,
                  }));
                  setError('');
                  setSuccess('');
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none bg-white"
              >
                <option value="">— Select a location —</option>
                {PRESET_LOCATIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-brand-muted">Optional. Choose a preset or pick on the map below.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-secondary mb-1">Pick exact spot on map</label>
              <LocationPicker
                value={form.location}
                onChange={(loc) => {
                  setForm((prev) => ({ ...prev, location: loc }));
                  setError('');
                  setSuccess('');
                }}
                height="320px"
                placeholder="Search address or click map..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-colors"
            >
              Create listing
            </button>
          </form>
        </div>

        {/* Set store location */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="font-sans text-lg font-semibold text-brand-secondary mb-1 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand-primary" />
            Set store location
          </h2>
          <p className="font-sans text-brand-muted text-sm mb-6">
            Choose an existing listing and set its location so users can find you on the map.
          </p>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-brand-secondary">
              Select store
            </label>
            <select
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(e.target.value || null)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none bg-white"
            >
              <option value="">— Select a store —</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.seller} – {l.title}
                </option>
              ))}
            </select>
            <LocationPicker
              value={location}
              onChange={setLocation}
              height="400px"
              placeholder="Search address or click map..."
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveLocation}
                disabled={saving || !location?.lat}
                className="py-3 px-6 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save location'}
              </button>
              {message && (
                <span className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-700'}`}>
                  {message.text}
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboardPage;
