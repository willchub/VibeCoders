import React, { useState } from 'react';

const ListingForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Barbershop', // Default value
    originalPrice: '',
    discountedPrice: '',
    appointmentTime: '',
    seller: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New Listing Data:', formData);
    alert('Listing created successfully! (Check console for data)');
    // Future: API call to save listing
  };

  return (
    <div className="listing-form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Listing Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Last Minute Haircut"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="type">Service Type</label>
          <select name="type" id="type" value={formData.type} onChange={handleChange}>
            <option value="Barbershop">Barbershop</option>
            <option value="Salon">Salon</option>
            <option value="Gym Class">Gym Class</option>
            <option value="Nail Salon">Nail Salon</option>
          </select>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label htmlFor="originalPrice">Original Price ($)</label>
                <input
                    type="number"
                    id="originalPrice"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="discountedPrice">Discounted Price ($)</label>
                <input
                    type="number"
                    id="discountedPrice"
                    name="discountedPrice"
                    value={formData.discountedPrice}
                    onChange={handleChange}
                    required
                />
            </div>
        </div>

        <div className="form-group">
          <label htmlFor="appointmentTime">Appointment Time</label>
          <input
            type="datetime-local"
            id="appointmentTime"
            name="appointmentTime"
            value={formData.appointmentTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="seller">Business Name</label>
          <input
            type="text"
            id="seller"
            name="seller"
            value={formData.seller}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Post Listing</button>
      </form>
    </div>
  );
};

export default ListingForm;