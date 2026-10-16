import type { MacroTotals } from '@/storage/meals';
import { roundAmount } from '@/utils/numbers';

/** How a meal was measured: macros per 100 g of the food and how much was eaten. */
export type Portion = {
  per100g: MacroTotals;
  /** Total grams eaten. */
  grams: number;
  /** Grams in one serving, when the food has a serving size. */
  servingGrams?: number;
  /** Number of servings eaten, when the amount was entered in servings. */
  servings?: number;
  /** Barcode the food was scanned from, if any. */
  barcode?: string;
};

/** Macros for `grams` of a food, given its macros per 100 g. */
export const macrosForGrams = (per100g: MacroTotals, grams: number): MacroTotals => {
  const factor = grams / 100;
  return {
    calories: Math.round(per100g.calories * factor),
    protein: roundAmount(per100g.protein * factor),
    carbs: roundAmount(per100g.carbs * factor),
    fat: roundAmount(per100g.fat * factor),
  };
};
