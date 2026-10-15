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
