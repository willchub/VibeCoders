/**
 * Geocoding via Nominatim (OpenStreetMap). Free, no API key.
 * Use for address/location autocomplete anywhere in the app.
 * Policy: https://operations.osmfoundation.org/policies/nominatim/ - max 1 req/sec, set User-Agent.
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function searchAddressSuggestions(query) {
  if (!query || query.trim().length < 2) return [];
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    limit: '8',
  });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'VibeCoders-Marketplace/1.0 (last-minute marketplace)',
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item) => item.display_name || '');
}
