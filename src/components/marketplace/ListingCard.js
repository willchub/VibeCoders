import React from 'react';

const ListingCard = ({ listing }) => {
  const {
    title,
    seller,
    type,
    originalPrice,
    discountedPrice,
    imageUrl,
    appointmentTime,
  } = listing;

  // A simple function to format the date/time
  const formatAppointmentTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="listing-card">
      <div className="listing-image">
        <img src={imageUrl} alt={title} />
        <span className="booking-type">{type}</span>
      </div>
      <div className="listing-details">
        <h3 className="listing-title">{title}</h3>
        <p className="seller-info">from {seller}</p>
        
        <div className="price-container">
          <span className="original-price">${originalPrice}</span>
          <span className="discounted-price">${discountedPrice}</span>
        </div>

        <div className="time-sensitive-info">
          <p>Appointment at: <strong>{formatAppointmentTime(appointmentTime)}</strong></p>
        </div>
        
        <button className="book-now-btn">Book Now</button>
      </div>
    </div>
  );
};

export default ListingCard;
