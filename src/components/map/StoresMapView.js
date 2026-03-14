import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import MapView from './MapView';
import ListingCard from '../marketplace/ListingCard';
import { getUserPosition } from '../../services/maps';
import { sortListingsByDistance, DEFAULT_CENTER } from '../../services/maps';
import { getDistanceKm } from '../../services/maps';

/**
 * Map + list of stores. "Near me" uses browser geolocation and sorts by distance.
 */
const StoresMapView = ({ listings, onBook }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [mapStyle, setMapStyle] = useState('carto-light');

  const listingsWithLocation = useMemo(
    () => listings.filter((l) => l.location && typeof l.location.lat === 'number'),
    [listings]
  );

  const sortedListings = useMemo(() => {
    if (!userLocation) return listingsWithLocation;
    return sortListingsByDistance(listingsWithLocation, userLocation);
  }, [listingsWithLocation, userLocation]);

  const mapCenter = useMemo(() => {
    if (userLocation) return userLocation;
    if (listingsWithLocation.length > 0) {
      const first = listingsWithLocation[0].location;
      return { lat: first.lat, lng: first.lng };
    }
    return DEFAULT_CENTER;
  }, [userLocation, listingsWithLocation]);

  const markers = useMemo(
    () =>
      listingsWithLocation.map((l) => ({
        id: l.id,
        lat: l.location.lat,
        lng: l.location.lng,
        title: l.seller || l.title,
      })),
    [listingsWithLocation]
  );

  const handleNearMe = useCallback(() => {
    setLocationError(null);
    getUserPosition()
      .then((pos) => setUserLocation(pos))
      .catch((err) => setLocationError(err.message || 'Could not get your location'));
  }, []);

  const handleMarkerClick = useCallback((marker) => {
    setSelectedListingId(marker.id);
  }, []);

  const cardRefs = useRef({});

  useEffect(() => {
    if (selectedListingId && cardRefs.current[selectedListingId]) {
      cardRefs.current[selectedListingId].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedListingId]);

  const distanceFromUser = (listing) => {
    if (!userLocation || !listing.location) return null;
    const km = getDistanceKm(userLocation.lat, userLocation.lng, listing.location.lat, listing.location.lng);
    return km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`;
  };

  return (
    <div className="stores-map-view">
      <div className="stores-map-header" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleNearMe}
          className="near-me-btn"
          style={{
            padding: '10px 18px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Near me
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
          Map style:
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd' }}
          >
            <option value="carto-light">Light (high quality)</option>
            <option value="carto-dark">Dark</option>
            <option value="osm">OpenStreetMap</option>
          </select>
        </label>
        {userLocation && (
          <span style={{ fontSize: 14, color: '#666' }}>
            Showing stores sorted by distance from your location
          </span>
        )}
        {locationError && (
          <span style={{ fontSize: 14, color: '#c0392b' }}>{locationError}</span>
        )}
      </div>

      <div className="stores-map-layout">
        <div className="stores-map-container" style={{ minHeight: 400, borderRadius: 8, overflow: 'hidden', border: '1px solid #eee' }}>
          <MapView
            center={mapCenter}
            zoom={userLocation && listingsWithLocation.length === 0 ? 14 : 13}
            markers={markers}
            onMarkerClick={handleMarkerClick}
            tileLayer={mapStyle}
            style={{ width: '100%', height: '100%', minHeight: 400 }}
          />
        </div>

        <div className="stores-map-list" style={{ overflowY: 'auto', maxHeight: 500 }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 1.1 + 'rem' }}>Stores</h3>
          {sortedListings.length === 0 ? (
            <p style={{ color: '#666' }}>No stores with location yet.</p>
          ) : (
            sortedListings.map((listing) => (
              <div
                key={listing.id}
                ref={(el) => { cardRefs.current[listing.id] = el; }}
                onClick={() => setSelectedListingId(listing.id)}
                style={{
                  marginBottom: 12,
                  padding: 12,
                  background: selectedListingId === listing.id ? '#e8f4fc' : '#fff',
                  border: selectedListingId === listing.id ? '2px solid #3498db' : '1px solid #eee',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: selectedListingId === listing.id ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedListingId !== listing.id) {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedListingId !== listing.id) {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                  }
                }}
              >
                <ListingCard listing={listing} onBook={onBook} />
                {distanceFromUser(listing) && (
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#3498db' }}>
                    {distanceFromUser(listing)} away
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StoresMapView;
