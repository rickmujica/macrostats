import type { Meal } from '@/storage/meals';
import { addDays, dateKey } from '@/utils/dates';

/**
 * Consecutive days with at least one logged meal, counting back from today.
 * A day that hasn't been logged yet today doesn't break the streak until it's over.
 */
export const getStreak = (meals: Meal[], today = new Date()): number => {
  const loggedDays = new Set(meals.map((meal) => dateKey(new Date(meal.createdAt))));
  let day = loggedDays.has(dateKey(today)) ? today : addDays(today, -1);
  let streak = 0;

  while (loggedDays.has(dateKey(day))) {
    streak += 1;
    day = addDays(day, -1);
  }

  return streak;
};
