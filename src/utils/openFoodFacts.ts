import type { MacroTotals } from '@/storage/meals';
import { roundAmount } from '@/utils/numbers';
import Constants from 'expo-constants';

export type ScannedFood = {
  barcode: string;
  name: string;
  per100g: MacroTotals;
  /** Grams in one serving, when the package states it. */
  servingGrams?: number;
};

type OffNutriments = Record<string, number | string | undefined>;

type OffProduct = {
  product_name?: string;
  product_name_es?: string;
  product_name_en?: string;
  brands?: string;
  nutriments?: OffNutriments;
  serving_quantity?: number | string;
};

type OffResponse = {
  status?: number;
  product?: OffProduct;
};

const FIELDS = [
  'product_name',
  'product_name_es',
  'product_name_en',
  'brands',
  'nutriments',
  'serving_quantity',
].join(',');

const toNumber = (value: unknown): number | null => {
  const number = typeof value === 'string' ? Number(value) : value;
  return typeof number === 'number' && Number.isFinite(number) && number >= 0 ? number : null;
};

/** Turns an Open Food Facts product response into a food, or null when it lacks the basics. */
export const parseOffProduct = (barcode: string, response: OffResponse, locale: string): ScannedFood | null => {
  const product = response.product;
  if (response.status !== 1 || !product) {
    return null;
  }

  const nutriments = product.nutriments ?? {};
  const protein = toNumber(nutriments.proteins_100g) ?? 0;
  const carbs = toNumber(nutriments.carbohydrates_100g) ?? 0;
  const fat = toNumber(nutriments.fat_100g) ?? 0;
  const kcal = toNumber(nutriments['energy-kcal_100g']);
  const kj = toNumber(nutriments.energy_100g);
  const calories = kcal ?? (kj !== null ? kj / 4.184 : null);
  if (calories === null && protein === 0 && carbs === 0 && fat === 0) {
    return null;
  }

  const localizedName = locale.startsWith('es') ? product.product_name_es : product.product_name_en;
  const baseName = (localizedName || product.product_name || '').trim();
  const brand = product.brands?.split(',')[0]?.trim();
  const name = baseName && brand && !baseName.toLowerCase().includes(brand.toLowerCase())
    ? `${baseName} (${brand})`
    : baseName || brand || barcode;

  const servingGrams = toNumber(product.serving_quantity);

  return {
    barcode,
    name,
    per100g: {
      calories: Math.round(calories ?? protein * 4 + carbs * 4 + fat * 9),
      protein: roundAmount(protein),
      carbs: roundAmount(carbs),
      fat: roundAmount(fat),
    },
    servingGrams: servingGrams ? roundAmount(servingGrams) : undefined,
  };
};

export class FoodLookupError extends Error {}

/** Looks a barcode up in Open Food Facts. Resolves null when the product isn't in the database. */
export const lookupBarcode = async (barcode: string, locale: string): Promise<ScannedFood | null> => {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  let response: Response;
  try {
    response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`,
      // Open Food Facts asks every app to identify itself.
      { headers: { 'User-Agent': `MacroZone/${version} (https://github.com/rickmujica/macrostats)` } },
    );
  } catch {
    throw new FoodLookupError('network');
  }

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new FoodLookupError(`HTTP ${response.status}`);
  }
  return parseOffProduct(barcode, (await response.json()) as OffResponse, locale);
};
