/**
 * Card validation: Luhn check + card type detection.
 * Optional BIN lookup via binlist.net (free, no API key) for extra authentication.
 */

export function luhnCheck(value) {
  const digits = String(value).replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let even = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (even) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    even = !even;
  }
  return sum % 10 === 0;
}

export function isValidCardNumber(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length >= 13 && digits.length <= 19 && luhnCheck(digits);
}

/** Card type from number pattern (Visa, Mastercard, Amex, Discover). */
export function getCardType(value) {
  const digits = String(value).replace(/\D/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720)/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6(011|5)/.test(digits)) return 'discover';
  return null;
}

export function isValidExpiry(mm, yy) {
  const m = parseInt(mm, 10);
  const y = parseInt(yy, 10);
  if (m < 1 || m > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (y < currentYear) return false;
  if (y === currentYear && m < currentMonth) return false;
  return true;
}

export function isValidCVC(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length === 3 || digits.length === 4;
}

export function parseExpiry(value) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return { mm: cleaned.slice(0, 2), yy: cleaned.slice(2, 4) };
  }
  return { mm: cleaned, yy: '' };
}
