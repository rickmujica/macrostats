import {
  decimalSeparator,
  formatInputNumber,
  formatNumber,
  localizeTypedNumber,
  parseAmount,
  roundAmount,
} from '@/utils/numbers';
import { getFormatLocale } from '@/i18n';

describe('parseAmount', () => {
  it('accepts a dot or a comma as the decimal separator', () => {
    expect(parseAmount('12.5')).toBe(12.5);
    expect(parseAmount('12,5')).toBe(12.5);
    expect(parseAmount(' 7 ')).toBe(7);
  });

  it('rejects empty, negative and non-numeric text', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('   ')).toBeNull();
    expect(parseAmount('-3')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
  });
});

describe('roundAmount', () => {
  it('rounds to one decimal', () => {
    expect(roundAmount(0.1 + 0.2)).toBe(0.3);
    expect(roundAmount(12.349)).toBe(12.3);
  });
});

describe('formatNumber', () => {
  it('uses the decimal separator of the app language', () => {
    expect(formatNumber(80.6, 'en')).toBe('80.6');
    expect(formatNumber(80.6, 'es')).toBe('80,6');
  });

  it('rounds to the given decimals and drops trailing zeros', () => {
    expect(formatNumber(6.14, 'es')).toBe('6,1');
    expect(formatNumber(6.14, 'es', 2)).toBe('6,14');
    expect(formatNumber(1499.6, 'en', 0)).toBe('1,500');
    expect(formatNumber(12, 'es')).toBe('12');
    expect(formatNumber(0, 'en')).toBe('0');
  });

  it('groups thousands the way each language does', () => {
    expect(formatNumber(12345.67, 'en')).toBe('12,345.7');
    expect(formatNumber(12345.67, 'es')).toBe('12.345,7');
  });

  it('keeps the sign of negative numbers', () => {
    expect(formatNumber(-1.2, 'en')).toBe('-1.2');
    expect(formatNumber(-1.2, 'es')).toBe('-1,2');
  });
});

describe('decimalSeparator', () => {
  it('is a comma in Spanish and a dot in English', () => {
    expect(decimalSeparator('es')).toBe(',');
    expect(decimalSeparator('es-PY')).toBe(',');
    expect(decimalSeparator('en')).toBe('.');
    expect(decimalSeparator('en-US')).toBe('.');
  });
});

describe('localizeTypedNumber', () => {
  it('rewrites the typed separator to the app language one', () => {
    expect(localizeTypedNumber('10.2', 'es')).toBe('10,2');
    expect(localizeTypedNumber('10,2', 'es')).toBe('10,2');
    expect(localizeTypedNumber('10,2', 'en')).toBe('10.2');
    expect(localizeTypedNumber('10.', 'es')).toBe('10,');
  });

  it('leaves whole numbers and empty text alone', () => {
    expect(localizeTypedNumber('2200', 'es')).toBe('2200');
    expect(localizeTypedNumber('', 'es')).toBe('');
  });

  it('keeps the value parseAmount reads', () => {
    for (const text of ['10.2', '0,25', '17.5', '60']) {
      expect(parseAmount(localizeTypedNumber(text, 'es'))).toBe(parseAmount(text));
      expect(parseAmount(localizeTypedNumber(text, 'en'))).toBe(parseAmount(text));
    }
  });
});

describe('formatInputNumber', () => {
  it('uses the decimal separator of the app language without rounding', () => {
    expect(formatInputNumber(80.6, 'en')).toBe('80.6');
    expect(formatInputNumber(80.6, 'es')).toBe('80,6');
    expect(formatInputNumber(0.25, 'es')).toBe('0,25');
    expect(formatInputNumber(2500, 'es')).toBe('2500');
  });

  it('never adds thousands separators', () => {
    expect(formatInputNumber(12345.5, 'en')).toBe('12345.5');
    expect(formatInputNumber(12345.5, 'es')).toBe('12345,5');
  });

  it('reads back as the same number with parseAmount', () => {
    for (const value of [0, 7, 12.5, 80.65, 1500, 12345.5]) {
      expect(parseAmount(formatInputNumber(value, 'en'))).toBe(value);
      expect(parseAmount(formatInputNumber(value, 'es'))).toBe(value);
    }
  });
});

describe('getFormatLocale', () => {
  it('keeps the app language', () => {
    expect(getFormatLocale('es').startsWith('es')).toBe(true);
    expect(getFormatLocale('en').startsWith('en')).toBe(true);
  });

  it('formats by region within a language', () => {
    expect(formatNumber(80.6, 'es-PY')).toBe('80,6');
    expect(formatNumber(80.6, 'es-MX')).toBe('80.6');
  });
});
