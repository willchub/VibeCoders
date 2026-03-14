import React, { useState, useRef, useEffect } from 'react';

const DEBOUNCE_MS = 400;

/**
 * Text input with dropdown autocomplete.
 * Use `suggestions` for static list, or `fetchSuggestions(query)` for async (e.g. geocoding).
 */
const SearchAutocomplete = ({
  value,
  onChange,
  suggestions = [],
  fetchSuggestions,
  placeholder,
  icon: Icon,
  onBlur,
  onSubmit,
  'aria-label': ariaLabel,
  minChars = 1,
  maxSuggestions = 8,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [asyncSuggestions, setAsyncSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const fetchSuggestionsRef = useRef(fetchSuggestions);
  fetchSuggestionsRef.current = fetchSuggestions;
  const listId = id ? `autocomplete-${id}` : `autocomplete-${Math.random().toString(36).slice(2, 9)}`;

  const isAsync = typeof fetchSuggestions === 'function';
  const staticFiltered = suggestions.filter((s) =>
    (typeof s === 'string' ? s : s.label || s).toLowerCase().includes((value || '').trim().toLowerCase())
  ).slice(0, maxSuggestions);

  const filtered = isAsync ? asyncSuggestions.slice(0, maxSuggestions) : staticFiltered;
  const trimmedValue = (value || '').trim();
  const hasNoResultsMessage =
    isAsync && !loadingSuggestions && trimmedValue.length >= minChars && filtered.length === 0;

  const showDropdown = isOpen
    && trimmedValue.length >= minChars
    && (isAsync ? (loadingSuggestions || filtered.length > 0) : filtered.length > 0);

  useEffect(() => {
    setHighlightIndex(-1);
  }, [value, filtered.length]);

  useEffect(() => {
    if (!isAsync || !fetchSuggestionsRef.current) return;
    const query = value.trim();
    if (query.length < minChars) {
      setAsyncSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoadingSuggestions(true);
      setAsyncSuggestions([]);
      const fn = fetchSuggestionsRef.current;
      if (!fn) return;
      fn(query)
        .then((result) => {
          setAsyncSuggestions(Array.isArray(result) ? result : []);
        })
        .catch(() => setAsyncSuggestions([]))
        .finally(() => {
          setLoadingSuggestions(false);
          debounceRef.current = null;
        });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, minChars, isAsync]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLabel = (item) => (typeof item === 'string' ? item : item.label || item.value || '');

  const select = (item) => {
    const label = getLabel(item);
    onChange(label);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === 'Enter' && onSubmit) onSubmit();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i < filtered.length - 1 ? i + 1 : i));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i > 0 ? i - 1 : -1));
    } else if (e.key === 'Enter' && highlightIndex >= 0 && filtered[highlightIndex]) {
      e.preventDefault();
      select(filtered[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 flex items-center">
      {Icon && <Icon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />}
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listId : undefined}
          role="combobox"
          className="w-full border-none focus:ring-0 text-sm outline-none bg-transparent"
        />
        {showDropdown && (
          <ul
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-50"
          >
            {loadingSuggestions ? (
              <li className="px-3 py-3 text-sm text-gray-500" role="status">
                Loading…
              </li>
            ) : (
              filtered.map((item, i) => {
                const label = getLabel(item);
                return (
                  <li
                    key={label + i}
                    role="option"
                    aria-selected={i === highlightIndex}
                    className={`px-3 py-2 text-sm cursor-pointer ${
                      i === highlightIndex ? 'bg-brand-primary/10 text-brand-secondary' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onMouseDown={(e) => { e.preventDefault(); select(item); }}
                    onMouseEnter={() => setHighlightIndex(i)}
                  >
                    {label}
                  </li>
                );
              })
            )}
          </ul>
        )}
        {hasNoResultsMessage && (
          <p className="mt-1 text-xs text-red-500">Invalid location</p>
        )}
      </div>
    </div>
  );
};

export default SearchAutocomplete;
