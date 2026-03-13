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
        hour12: true
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Booking</h2>
        <div className="modal-body">
            <p><strong>Service:</strong> {listing.title}</p>
            <p><strong>Seller:</strong> {listing.seller}</p>
            <p><strong>Time:</strong> {formatAppointmentTime(listing.appointmentTime)}</p>
            <p><strong>Price:</strong> <span className="modal-price">${listing.discountedPrice}</span></p>
        </div>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="confirm-btn" onClick={onConfirm}>Confirm Booking</button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;