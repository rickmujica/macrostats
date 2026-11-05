import type { ScannedFood } from '@/utils/openFoodFacts';

// The scanner is a separate screen; it leaves its result here for Add Meal to pick up on focus.
let pending: ScannedFood | null = null;

export const setPendingScan = (food: ScannedFood) => {
  pending = food;
};

export const takePendingScan = (): ScannedFood | null => {
  const food = pending;
  pending = null;
  return food;
};
