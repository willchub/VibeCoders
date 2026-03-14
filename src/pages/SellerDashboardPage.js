import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LocationPicker from '../components/map/LocationPicker';
import { getListings, saveStoreLocation } from '../services/api';

const SellerDashboardPage = () => {
  const [listings, setListings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [location, setLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getListings().then(setListings);
  }, []);

  const selectedListing = listings.find((l) => l.id === selectedId);

  useEffect(() => {
    if (selectedListing?.location) {
      setLocation({ ...selectedListing.location });
    } else {
      setLocation(null);
    }
  }, [selectedId, selectedListing]);

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

  return (
    <div>
      <Header />
      <main className="container">
        <h1>Seller dashboard</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Choose your store and set or update its location. Users can then find you on the map and search for stores near them.
        </p>

        <div className="seller-dashboard-form" style={{ maxWidth: 720 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
            Select store
          </label>
          <select
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
            style={{
              width: '100%',
              padding: '10px 12px',
              marginBottom: 16,
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            <option value="">— Select a store —</option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.seller} – {l.title}
              </option>
            ))}
          </select>

          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
            Store location
          </label>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            Search for an address or click on the map to set your store location.
          </p>
          <LocationPicker
            value={location}
            onChange={setLocation}
            height="400px"
            placeholder="Search address or click map..."
          />

          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={handleSaveLocation}
              disabled={saving || !location?.lat}
              className="confirm-btn"
              style={{ padding: '10px 24px' }}
            >
              {saving ? 'Saving...' : 'Save location'}
            </button>
            {message && (
              <span style={{ color: message.type === 'error' ? '#c0392b' : '#27ae60', fontSize: 14 }}>
                {message.text}
              </span>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboardPage;
