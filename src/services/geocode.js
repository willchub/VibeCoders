/**
 * Geocoding via Nominatim (OpenStreetMap). Free, no API key.
 * Use for address/location autocomplete anywhere in the app.
 * Policy: https://operations.osmfoundation.org/policies/nominatim/ - max 1 req/sec, set User-Agent.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const NOMINATIM_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'VibeCoders-Marketplace/1.0 (last-minute marketplace)',
};

// Only allow locations in Australia across the app (all maps and location pickers)
const ALLOWED_COUNTRY_CODES = ['au'];

export async function searchAddressSuggestions(query) {
  if (!query || query.trim().length < 2) return [];
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    limit: '8',
    countrycodes: ALLOWED_COUNTRY_CODES.join(','), // Australia only
  });
  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item) => item.display_name || '');
}

/**
 * Reverse geocode: get address string for a lat/lng.
 * Returns display_name or null if not found or outside Australia.
 */
export async function reverseGeocode(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
  });
  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) return null;
  const data = await res.json();
  const countryCode = data && data.address && data.address.country_code
    ? String(data.address.country_code).toLowerCase()
    : null;

  if (!countryCode || !ALLOWED_COUNTRY_CODES.includes(countryCode)) {
    return null;
  }

  return (data && (data.display_name || data.name)) || null;
}
