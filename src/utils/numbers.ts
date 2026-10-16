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

/** The decimal separator of the app's language: "," in Spanish, "." in English. */
export const decimalSeparator = (locale: string): string => formatNumber(1.5, locale).charAt(1);

/**
 * Formats a number to pre-fill a text field in the app's language. It keeps every
 * decimal and leaves out thousands separators, so parseAmount reads it back unchanged.
 */
export const formatInputNumber = (value: number, locale: string): string =>
  String(value).replace('.', decimalSeparator(locale));

/**
 * Rewrites what the user types in a number field with the app language's decimal
 * separator, so "10.2" shows as "10,2" in Spanish. parseAmount reads both the same way.
 */
export const localizeTypedNumber = (text: string, locale: string): string =>
  text.replace(/[.,]/g, decimalSeparator(locale));
