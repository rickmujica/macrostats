/**
 * Parses an amount typed by the user, accepting either "," or "." as the
 * decimal separator. Returns null when the text isn't a non-negative number.
 */
export const parseAmount = (value: string): number | null => {
  const normalized = value.trim().replace(',', '.');
  if (normalized === '') {
    return null;
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

/** Rounds to one decimal so sums like 0.1 + 0.2 display cleanly. */
export const roundAmount = (value: number): number => Math.round(value * 10) / 10;

/**
 * Formats a number for display in the app's language, so 80.6 shows as "80,6"
 * in Spanish. Rounds to at most `maxFractionDigits` decimals, without trailing zeros.
 */
export const formatNumber = (value: number, locale: string, maxFractionDigits = 1): string =>
  value.toLocaleString(locale, { maximumFractionDigits: maxFractionDigits });

/**
 * Formats a number to pre-fill a text field in the app's language. It keeps every
 * decimal and leaves out thousands separators, so parseAmount reads it back unchanged.
 */
export const formatInputNumber = (value: number, locale: string): string =>
  String(value).replace('.', formatNumber(1.5, locale).charAt(1));
