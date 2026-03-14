/**
 * Map utilities: distance calculation, default center, user location.
 * Used by map components and "near me" search.
 */

// Default map center (Sydney CBD). Used when user location is unavailable or not chosen.
export const DEFAULT_CENTER = { lat: -33.8688, lng: 151.2093 };

// Haversine formula: distance in km between two lat/lng points
export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Sort listings by distance from a point. Listings without location are pushed to the end.
 * @param {Array} listings - List of listings (each may have .location)
 * @param {{ lat: number, lng: number }} from - Reference point
 * @returns {Array} New sorted array (does not mutate)
 */
export function sortListingsByDistance(listings, from) {
  if (!from || typeof from.lat !== 'number' || typeof from.lng !== 'number') {
    return [...listings];
  }
  return [...listings].sort((a, b) => {
    const hasA = a.location && typeof a.location.lat === 'number';
    const hasB = b.location && typeof b.location.lat === 'number';
    if (!hasA && !hasB) return 0;
    if (!hasA) return 1;
    if (!hasB) return -1;
    const distA = getDistanceKm(from.lat, from.lng, a.location.lat, a.location.lng);
    const distB = getDistanceKm(from.lat, from.lng, b.location.lat, b.location.lng);
    return distA - distB;
  });
}

/**
 * Get user's current position via browser Geolocation API.
 * @returns {Promise<{ lat: number, lng: number }>}
 */
export function getUserPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}
