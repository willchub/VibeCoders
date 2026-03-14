/**
 * BIN (Bank Identification Number) lookup for card authentication.
 * Uses binlist.net public API (first 6 digits) - no API key required.
 * Falls back to local card-type detection if the API fails.
 */

import { getCardType, luhnCheck } from '../utils/cardValidation';

const BINLIST_URL = 'https://lookup.binlist.net';

/**
 * Fetch BIN details (card scheme, type, brand). Returns null on network/API error.
 * @param {string} bin - First 6 digits of card number
 * @returns {Promise<{ scheme?: string, type?: string, brand?: string } | null>}
 */
export async function lookupBIN(bin) {
  const digits = String(bin).replace(/\D/g, '').slice(0, 6);
  if (digits.length < 6) return null;
  try {
    const res = await fetch(`${BINLIST_URL}/${digits}`, {
      method: 'GET',
      headers: { 'Accept-Version': '3' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      scheme: data.scheme?.toLowerCase(),
      type: data.type,
      brand: data.brand?.toLowerCase(),
    };
  } catch {
    return null;
  }
}

/**
 * Validate card number: Luhn + optional BIN lookup. Returns { valid, cardType, binInfo }.
 * cardType is from local pattern if BIN lookup fails.
 */
export async function validateCardWithBIN(cardNumber) {
  const digits = String(cardNumber).replace(/\D/g, '');
  const cardType = getCardType(digits);
  const bin = digits.slice(0, 6);
  const binInfo = bin.length >= 6 ? await lookupBIN(bin) : null;
  const scheme = binInfo?.scheme || cardType;
  return {
    valid: digits.length >= 13 && digits.length <= 19 && luhnCheck(digits),
    cardType: scheme || cardType,
    binInfo,
  };
}
