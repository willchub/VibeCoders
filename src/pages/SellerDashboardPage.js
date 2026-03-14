import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { createListing } from '../services/api';

const LISTING_TYPES = ['Barbershop', 'Gym Class', 'Salon', 'Physio'];

const SellerDashboardPage = () => {
  const navigate = useNavigate();
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
  });

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
    try {
      await createListing({
        ...form,
        originalPrice: original,
        discountedPrice: discounted,
      });
      setSuccess('Listing created. It will appear on the marketplace.');
      setForm({
        title: '',
        seller: '',
        type: 'Salon',
        originalPrice: '',
        discountedPrice: '',
        imageUrl: '',
        appointmentTime: '',
      });
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12 flex-grow w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-brand-secondary">Seller dashboard</h1>
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="text-sm font-medium text-brand-primary hover:underline"
          >
            View marketplace
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-brand-secondary mb-1 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-brand-primary" />
            Create a listing
          </h2>
          <p className="text-brand-muted text-sm mb-6">
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
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-colors"
            >
              Create listing
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboardPage;
