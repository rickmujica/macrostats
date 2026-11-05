import type { Meal } from '@/storage/meals';
import { getStreak } from '@/utils/streak';

const mealOn = (year: number, month: number, day: number, hour = 12): Meal => ({
  id: `${year}-${month}-${day}-${hour}`,
  name: 'Meal',
  calories: 100,
  protein: 1,
  carbs: 1,
  fat: 1,
  createdAt: new Date(year, month, day, hour).toISOString(),
});

describe('getStreak', () => {
  const today = new Date(2026, 9, 16, 15);

  it('counts consecutive logged days ending today', () => {
    const meals = [mealOn(2026, 9, 16), mealOn(2026, 9, 15), mealOn(2026, 9, 15, 20), mealOn(2026, 9, 14)];
    expect(getStreak(meals, today)).toBe(3);
  });

  it('keeps yesterday’s streak while today has no meals yet', () => {
    expect(getStreak([mealOn(2026, 9, 15), mealOn(2026, 9, 14)], today)).toBe(2);
  });

  it('stops at the first gap', () => {
    expect(getStreak([mealOn(2026, 9, 16), mealOn(2026, 9, 14)], today)).toBe(1);
    expect(getStreak([mealOn(2026, 9, 13)], today)).toBe(0);
  });

  it('crosses month boundaries', () => {
    const meals = [mealOn(2026, 10, 1), mealOn(2026, 9, 31), mealOn(2026, 9, 30)];
    expect(getStreak(meals, new Date(2026, 10, 1, 9))).toBe(3);
  });
});
