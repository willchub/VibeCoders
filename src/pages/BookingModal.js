import React from 'react';

const BookingModal = ({ listing, isOpen, onClose, onConfirm }) => {
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

  return (
    <div
      className="fixed inset-0 z-[1000] flex justify-center items-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 mx-4">
        <h2 id="booking-modal-title" className="text-xl font-bold text-brand-secondary">
          Confirm Booking
        </h2>
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
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-brand-secondary font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-colors"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
