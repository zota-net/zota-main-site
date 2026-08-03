// Uganda mobile number normalization + network provider auto-detection.
// Mirrors the "0xxxxxxxxx -> 256xxxxxxxxx" normalization used by the
// mikrotik hotspot payment portal (radius-server-service/payment-service.ts),
// extended with automatic MTN/Airtel network detection from the dial prefix.

export type MobileProvider = 'MTN' | 'Airtel';

// Uganda Communications Commission numbering plan (mobile network prefixes).
const MTN_PREFIXES = ['77', '78', '76', '39'];
const AIRTEL_PREFIXES = ['70', '74', '75', '20'];

/**
 * Normalize any reasonably-formatted Ugandan phone number to 256XXXXXXXXX.
 * Accepts "0757994796", "+256757994796", "256 757 994 796", etc.
 */
export function normalizePhoneUG(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  let local: string;
  if (digits.startsWith('256')) {
    local = digits.slice(3);
  } else if (digits.startsWith('0')) {
    local = digits.slice(1);
  } else {
    local = digits;
  }

  return `256${local}`;
}

/** True when the input normalizes to a complete 256 + 9-digit number. */
export function isValidPhoneUG(raw: string): boolean {
  return /^256\d{9}$/.test(normalizePhoneUG(raw));
}

/**
 * Detect MTN vs Airtel from the number's dial prefix. Returns null when the
 * number is incomplete or the prefix doesn't map to a known network.
 */
export function detectProviderUG(raw: string): MobileProvider | null {
  const normalized = normalizePhoneUG(raw);
  const prefix = normalized.slice(3, 5);

  if (MTN_PREFIXES.includes(prefix)) return 'MTN';
  if (AIRTEL_PREFIXES.includes(prefix)) return 'Airtel';
  return null;
}

/** Display formatting: 256757994796 -> +256 757 994 796 */
export function formatPhoneUG(raw: string): string {
  const normalized = normalizePhoneUG(raw);
  if (!/^256\d{9}$/.test(normalized)) return raw;
  return `+${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`;
}
