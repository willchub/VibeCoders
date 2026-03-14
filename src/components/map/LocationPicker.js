import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import MapView from './MapView';
import { reverseGeocode } from '../../services/geocode';
import { getUserPosition, DEFAULT_CENTER } from '../../services/maps';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const NOMINATIM_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'VibeCoders-Marketplace/1.0 (last-minute marketplace)',
};

/**
 * Geocode an address using Nominatim; returns exact lat/lng for each result.
 * Restricted to Australia + Israel.
 */
async function searchAddress(query) {
  if (!query || query.trim().length < 2) return [];
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    limit: '10',
    countrycodes: 'au,il',
  });
  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item) => ({
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    address: item.display_name || '',
  }));
}

/**
 * Lets store owners pick a location by clicking the map or searching an address (Nominatim).
 * Value shape: { lat, lng, address? }
 * - Pasting/searching an address shows the exact location on the map.
 * - Clicking the map reverse-geocodes and shows the exact address in the search bar.
 */
const DEBOUNCE_MS = 350;

const LocationPicker = ({ value, onChange, height = '400px', placeholder = 'Search address or click map...' }) => {
  const [addressInput, setAddressInput] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const lastQueryRef = useRef('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [defaultCenter, setDefaultCenter] = useState(DEFAULT_CENTER);

  useEffect(() => {
    getUserPosition()
      .then(setDefaultCenter)
      .catch(() => {});
  }, []);

  // Keep search bar in sync with the selected location (from parent, map click, or suggestion)
  const prevAddressRef = useRef(value?.address);
  useEffect(() => {
    const nextAddress = value?.address ?? '';
    if (nextAddress !== prevAddressRef.current) {
      prevAddressRef.current = nextAddress;
      setAddressInput(typeof nextAddress === 'string' ? nextAddress : '');
    }
  }, [value?.address]);

  // As-you-type suggestions: debounced fetch from Nominatim
  useEffect(() => {
    const query = addressInput.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setErrorMessage('');
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      lastQueryRef.current = query;
      setSuggestionsLoading(true);
      setSuggestions([]);
      searchAddress(query)
        .then((results) => {
          if (lastQueryRef.current === query) {
            setSuggestions(results);
            setHighlightIndex(-1);
            if (results.length > 0) {
              setErrorMessage('');
            }
          }
        })
        .catch(() => {
          if (lastQueryRef.current === query) setSuggestions([]);
        })
        .finally(() => {
          if (lastQueryRef.current === query) setSuggestionsLoading(false);
          debounceRef.current = null;
        });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [addressInput]);

  // Position dropdown below input (for portal); update when suggestions open or window scrolls/resizes
  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 280),
      });
    }
  }, []);

  useEffect(() => {
    if (suggestions.length > 0 && !suggestionsLoading) {
      updateDropdownPosition();
    }
  }, [suggestions.length, suggestionsLoading, updateDropdownPosition]);

  useEffect(() => {
    if (suggestions.length === 0) return;
    const onScrollOrResize = () => updateDropdownPosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [suggestions.length, updateDropdownPosition]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target) &&
        !e.target.closest('[data-location-picker-dropdown]')
      ) {
        setSuggestions([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const center = value?.lat != null ? { lat: value.lat, lng: value.lng } : defaultCenter;
  const zoom = value?.lat != null ? 17 : 12;

  const handleMapClick = useCallback(
    async (pos) => {
      const lat = pos.lat;
      const lng = pos.lng;
      setReverseLoading(true);
      setSuggestions([]);
      try {
        const address = await reverseGeocode(lat, lng);
        if (!address) {
          setErrorMessage('Only locations in Australia and Israel are supported.');
          return;
        }
        setErrorMessage('');
        setAddressInput(address);
        onChange({ ...value, lat, lng, address });
      } catch {
        setErrorMessage('Unable to look up this location. Please try again.');
      } finally {
        setReverseLoading(false);
      }
    },
    [onChange, value]
  );

  const applySuggestion = useCallback(
    (result) => {
      setAddressInput(result.address);
      setSuggestions([]);
      setHighlightIndex(-1);
      onChange({ lat: result.lat, lng: result.lng, address: result.address });
    },
    [onChange]
  );

  const triggerSearch = useCallback(() => {
    const query = addressInput.trim();
    if (query.length < 2) {
      setErrorMessage('Please enter at least 2 characters.');
      return;
    }
    if (suggestions.length > 0) {
      applySuggestion(suggestions[0]);
      return;
    }
    setErrorMessage('Invalid location');
  }, [addressInput, suggestions, applySuggestion]);

  const handleInputKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && suggestions.length === 0) {
        e.preventDefault();
        triggerSearch();
        return;
      }
      if (suggestions.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((i) => (i < suggestions.length - 1 ? i + 1 : i));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((i) => (i > 0 ? i - 1 : -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightIndex >= 0 && suggestions[highlightIndex]) {
          applySuggestion(suggestions[highlightIndex]);
        } else if (suggestions.length > 0) {
          applySuggestion(suggestions[0]);
        }
      } else if (e.key === 'Escape') {
        setSuggestions([]);
        setHighlightIndex(-1);
      }
    },
    [suggestions, highlightIndex, applySuggestion, triggerSearch]
  );

  return (
    <div className="location-picker" style={{ position: 'relative', zIndex: 1 }}>
      <div
        ref={wrapperRef}
        className="location-picker-search"
        style={{ marginBottom: 8, position: 'relative', zIndex: 1000, overflow: 'visible' }}
      >
        <div
          style={{
            position: 'relative',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={addressInput ?? ''}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            style={{
              width: '100%',
              padding: '10px 72px 10px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 14,
              boxSizing: 'border-box',
              background: '#fff',
              color: '#111',
            }}
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0}
          />
          <button
            type="button"
            onClick={triggerSearch}
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '6px 10px',
              fontSize: 12,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#111827',
              color: '#fff',
              whiteSpace: 'nowrap',
            }}
          >
            Search
          </button>
        </div>
        {suggestionsLoading && (
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#666' }}>Searching…</p>
        )}
        {!suggestionsLoading && errorMessage && (
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#dc2626' }}>{errorMessage}</p>
        )}
        {suggestions.length > 0 &&
          !suggestionsLoading &&
          createPortal(
            <div
              data-location-picker-dropdown
              style={{
                position: 'fixed',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 99999,
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: 6,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                maxHeight: 280,
                overflowY: 'auto',
              }}
            >
              <ul
                role="listbox"
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                }}
              >
                {suggestions.map((r, i) => (
                  <li
                    key={`${r.lat}-${r.lng}-${i}`}
                    role="option"
                    aria-selected={i === highlightIndex}
                    onClick={() => applySuggestion(r)}
                    onMouseEnter={() => setHighlightIndex(i)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: i < suggestions.length - 1 ? '1px solid #eee' : 'none',
                      background: i === highlightIndex ? '#e8f4fc' : undefined,
                      fontSize: 14,
                    }}
                  >
                    {r.address}
                  </li>
                ))}
              </ul>
            </div>,
            document.body
          )}
      </div>
      {reverseLoading && (
        <p style={{ marginBottom: 6, fontSize: 12, color: '#666' }}>Looking up address…</p>
      )}
      <MapView
        center={center}
        zoom={zoom}
        markers={value?.lat != null ? [{ id: 'picked', lat: value.lat, lng: value.lng, title: value.address || 'Store location' }] : []}
        onMapClick={handleMapClick}
        style={{ width: '100%', height }}
      />
    </div>
  );
};

export default LocationPicker;
