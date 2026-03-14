import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isValidExpiry,
  isValidCVC,
  parseExpiry,
  getCardType,
} from '../utils/cardValidation';
import { validateCardWithBIN } from '../services/binLookupApi';
import { createTransaction, markListingSold } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CARD_TYPE_LABELS = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', discover: 'Discover' };

const BookingModal = ({ listing, isOpen, onClose, onConfirm }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);
  const [cardType, setCardType] = useState(null);
  const [binChecking, setBinChecking] = useState(false);
  const [form, setForm] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const digits = form.cardNumber.replace(/\D/g, '');
    if (digits.length >= 6) {
      setBinChecking(true);
      validateCardWithBIN(form.cardNumber).then(({ cardType: type, binInfo }) => {
        setCardType(type || binInfo?.scheme || getCardType(digits));
        setBinChecking(false);
      }).catch(() => setBinChecking(false));
    } else if (digits.length < 4) {
      setCardType(null);
    }
  }, [form.cardNumber]);

  if (!isOpen || !listing) return null;

  const formatAppointmentTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  };

  const handleInputChange = (field, value) => {
    if (field === 'cardNumber') value = formatCardNumber(value);
    if (field === 'expiry') value = formatExpiry(value);
    if (field === 'cvc') value = value.replace(/\D/g, '').slice(0, 4);
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    if (field === 'cardNumber') {
      const digits = value.replace(/\D/g, '');
      setCardType(digits.length >= 4 ? getCardType(digits) : null);
    }
  };

  const handleProceedToPayment = () => {
    setError(null);
    setStep(2);
  };

  const handleBack = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmitCard = async (e) => {
    e.preventDefault();
    setError(null);

    const cardDigits = form.cardNumber.replace(/\D/g, '');
    const { mm, yy } = parseExpiry(form.expiry);
    const cvc = form.cvc.replace(/\D/g, '');

    if (!form.name.trim()) {
      setError('Please enter the name on card.');
      return;
    }
    const { valid } = await validateCardWithBIN(cardDigits);
    if (!valid) {
      setError('Please enter a valid card number.');
      return;
    }
    if (!isValidExpiry(mm, yy)) {
      setError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (!isValidCVC(cvc)) {
      setError('Please enter a valid CVC (3 or 4 digits).');
      return;
    }

    setPaying(true);
    try {
      await createTransaction({
        listingId: listing.id,
        listingTitle: listing.title,
        seller: listing.seller,
        amount: listing.discountedPrice,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'card',
        buyerEmail: user?.email ?? null,
        userId: user?.id ?? null,
      });
      // After recording the transaction, mark this listing as sold so it no longer appears.
      await markListingSold(listing.id);
    } catch (err) {
      console.error('Failed to complete booking:', err);
    }
    onConfirm?.();
    setTimeout(() => navigate('/checkout-success'), 400);
  };

  const handleClose = () => {
    setStep(1);
    setForm({ cardNumber: '', expiry: '', cvc: '', name: '' });
    setError(null);
    setCardType(null);
    setPaying(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex justify-center items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 id="booking-modal-title" className="text-xl font-bold text-brand-secondary">
            {step === 1 ? 'Checkout' : 'Payment method'}
          </h2>

          {step === 1 && (
            <>
              <div className="mt-4 space-y-2 text-sm text-brand-muted">
                <p>
                  <strong className="text-brand-secondary">Service:</strong> {listing.title}
                </p>
                <p>
                  <strong className="text-brand-secondary">Seller:</strong> {listing.seller}
                </p>
                <p>
                  <strong className="text-brand-secondary">Time:</strong>{' '}
                  {formatAppointmentTime(listing.appointmentTime)}
                </p>
                <p>
                  <strong className="text-brand-secondary">Price:</strong>{' '}
                  <span className="text-xl font-bold text-brand-primary">
                    ${listing.discountedPrice}
                  </span>
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-brand-secondary font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="px-5 py-2.5 rounded-lg bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-colors"
                >
                  Proceed to payment
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-brand-muted mt-2 mb-3">
                Total: <strong className="text-brand-secondary">${listing.discountedPrice}</strong>
              </p>

              <form onSubmit={handleSubmitCard} className="space-y-4">
                  <div>
                    <label htmlFor="card-name" className="block text-sm font-medium text-brand-secondary mb-1">
                      Full name
                    </label>
                    <input
                      id="card-name"
                      type="text"
                      placeholder="Name on card"
                      value={form.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                      autoComplete="cc-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="card-number" className="block text-sm font-medium text-brand-secondary mb-1">
                      Card number
                      {cardType && (
                        <span className="ml-2 text-xs font-normal text-brand-muted">
                          {CARD_TYPE_LABELS[cardType] || cardType}
                          {binChecking && ' …'}
                        </span>
                      )}
                    </label>
                    <input
                      id="card-number"
                      type="text"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={form.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none font-mono tracking-wider"
                      autoComplete="cc-number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="card-expiry" className="block text-sm font-medium text-brand-secondary mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        id="card-expiry"
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/YY"
                        value={form.expiry}
                        onChange={(e) => handleInputChange('expiry', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none font-mono"
                        autoComplete="cc-exp"
                      />
                    </div>
                    <div>
                      <label htmlFor="card-cvc" className="block text-sm font-medium text-brand-secondary mb-1">
                        CVC
                      </label>
                      <input
                        id="card-cvc"
                        type="text"
                        inputMode="numeric"
                        placeholder="123"
                        value={form.cvc}
                        onChange={(e) => handleInputChange('cvc', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none font-mono"
                        autoComplete="cc-csc"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={paying}
                      className="px-5 py-2.5 rounded-lg border border-gray-200 text-brand-secondary font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={paying}
                      className="px-5 py-2.5 rounded-lg bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {paying ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing…
                        </>
                      ) : (
                        'Pay now'
                      )}
                    </button>
                  </div>
                </form>

              {error && (
                <p className="text-sm text-red-600 mt-3" role="alert">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
