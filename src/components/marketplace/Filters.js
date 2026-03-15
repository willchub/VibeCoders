import React from 'react';

const Filters = ({ onFilterChange, onPriceChange, maxPrice, selectedCategory }) => {
  const categories = ['All', 'Barbershop', 'Gym Class', 'Salon', 'Nail Salon'];

  return (
    <div className="filters-container">
      <h3>Filters</h3>
      <div className="filter-options">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onFilterChange(category)}
            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>

      <h3>Max Price: ${maxPrice}</h3>
      <div className="price-filter">
        <input
          type="range"
          min="0"
          max="200"
          value={maxPrice}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default Filters;
