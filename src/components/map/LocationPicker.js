import React, { useState, useCallback } from 'react';
import MapView from './MapView';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Geocode an address using Nominatim (free, no API key).
 */
async function searchAddress(query) {
  if (!query || query.trim().length < 3) return [];
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    limit: '5',
  });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item) => ({
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    address: item.display_name,
  }));
}

/**
 * Lets store owners pick a location by clicking the map or searching an address (Nominatim).
 * Value shape: { lat, lng, address? }
 */
const LocationPicker = ({ value, onChange, height = '400px', placeholder = 'Search address or click map...' }) => {
  const [addressInput, setAddressInput] = useState(value?.address || '');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const center = value?.lat != null ? { lat: value.lat, lng: value.lng } : { lat: -37.8136, lng: 144.9631 };

  const handleMapClick = useCallback(
    (pos) => {
      onChange({ ...value, lat: pos.lat, lng: pos.lng, address: addressInput || undefined });
    },
    [onChange, value, addressInput]
  );

  const handleSearch = useCallback(async () => {
    const query = addressInput.trim();
    if (query.length < 3) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const results = await searchAddress(query);
      setSearchResults(results);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [addressInput]);

  const handleSelectResult = useCallback(
    (result) => {
      setAddressInput(result.address);
      setSearchResults([]);
      onChange({ lat: result.lat, lng: result.lng, address: result.address });
    },
    [onChange]
  );

  return (
    <div className="location-picker">
      <div className="location-picker-search" style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder={placeholder}
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 14,
            }}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || addressInput.trim().length < 3}
            style={{
              padding: '10px 16px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>
        {searchResults.length > 0 && (
          <ul
            style={{
              margin: '8px 0 0',
              padding: 0,
              listStyle: 'none',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: 6,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            {searchResults.map((r, i) => (
              <li
                key={i}
                onClick={() => handleSelectResult(r)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: i < searchResults.length - 1 ? '1px solid #eee' : 'none',
                }}
              >
                {r.address}
              </li>
            ))}
          </ul>
        )}
      </div>
      <MapView
        center={center}
        zoom={value?.lat != null ? 15 : 12}
        markers={value?.lat != null ? [{ id: 'picked', lat: value.lat, lng: value.lng, title: value.address || 'Store location' }] : []}
        onMapClick={handleMapClick}
        style={{ width: '100%', height }}
      />
      {value?.lat != null && (
        <p className="location-picker-coords" style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          Lat: {value.lat.toFixed(5)}, Lng: {value.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
