import { createId } from '@/utils/ids';
import { roundAmount } from '@/utils/numbers';
import type { Portion } from '@/utils/portions';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
  /** Set when the meal was logged from macros per 100 g and an amount. */
  portion?: Portion;
};

export type MacroTotals = Pick<Meal, 'calories' | 'protein' | 'carbs' | 'fat'>;

export const MEALS_KEY = 'meals';

const byNewestFirst = (a: Meal, b: Meal) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export const sameDay = (dateA: Date, dateB: Date) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

const getWeekStart = (date: Date) => {
  const clone = new Date(date);
  const day = clone.getDay();
  clone.setDate(clone.getDate() - day);
  clone.setHours(0, 0, 0, 0);
  return clone;
};

export const getMeals = async (): Promise<Meal[]> => {
  const data = await AsyncStorage.getItem(MEALS_KEY);
  return data ? JSON.parse(data) : [];
};

export const sumMeals = (meals: Meal[]): MacroTotals => {
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return {
    calories: roundAmount(totals.calories),
    protein: roundAmount(totals.protein),
    carbs: roundAmount(totals.carbs),
    fat: roundAmount(totals.fat),
  };
};

export const getMealById = async (id: string): Promise<Meal | undefined> => {
  const meals = await getMeals();
  return meals.find((meal) => meal.id === id);
};

export const getMealsByDate = async (date: Date): Promise<Meal[]> => {
  const meals = await getMeals();
  return meals.filter((meal) => sameDay(new Date(meal.createdAt), date));
};

export const getMealsByWeek = async (date: Date): Promise<Meal[]> => {
  const meals = await getMeals();
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return meals.filter((meal) => {
    const created = new Date(meal.createdAt);
    return created >= weekStart && created < weekEnd;
  });
};

export const addMeal = async (
  meal: Omit<Meal, 'id' | 'createdAt'>,
  createdAt = new Date(),
): Promise<Meal> => {
  const meals = await getMeals();
  const newMeal: Meal = {
    ...meal,
    id: createId(),
    createdAt: createdAt.toISOString(),
  };
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify([newMeal, ...meals].sort(byNewestFirst)));
  return newMeal;
};

/**
 * Copies every meal logged on `from` to the day `to`, keeping each meal's time of day.
 * Returns the new meals so the copy can be undone with deleteMeals.
 */
export const copyMealsToDay = async (from: Date, to: Date): Promise<Meal[]> => {
  const meals = await getMeals();
  const copies = meals
    .filter((meal) => sameDay(new Date(meal.createdAt), from))
    .map((meal) => {
      const created = new Date(meal.createdAt);
      const copiedAt = new Date(to);
      copiedAt.setHours(created.getHours(), created.getMinutes(), created.getSeconds(), 0);
      return { ...meal, id: createId(), createdAt: copiedAt.toISOString() };
    });

  if (copies.length > 0) {
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify([...copies, ...meals].sort(byNewestFirst)));
  }
  return copies;
};

export const deleteMeals = async (ids: string[]): Promise<void> => {
  const remove = new Set(ids);
  const meals = await getMeals();
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(meals.filter((meal) => !remove.has(meal.id))));
};

export const updateMeal = async (
  id: string,
  changes: Omit<Meal, 'id' | 'createdAt'>,
): Promise<void> => {
  const meals = await getMeals();
  // A meal edited from per-100 g back to totals loses its portion, so replace it rather than merge.
  const updated = meals.map((meal) =>
    meal.id === id ? { ...meal, ...changes, portion: changes.portion } : meal,
  );
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(updated));
};

/** Deletes a meal and returns it, so the deletion can be undone with restoreMeal. */
export const deleteMeal = async (id: string): Promise<Meal | undefined> => {
  const meals = await getMeals();
  const removed = meals.find((meal) => meal.id === id);
  const filtered = meals.filter((meal) => meal.id !== id);
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(filtered));
  return removed;
};

export const restoreMeal = async (meal: Meal): Promise<void> => {
  const meals = await getMeals();
  const restored = [meal, ...meals.filter((existing) => existing.id !== meal.id)].sort(byNewestFirst);
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(restored));
};

/** The most recently logged distinct foods (by name), newest first. */
export const getRecentFoods = async (limit = 8): Promise<Meal[]> => {
  const meals = await getMeals();
  const seen = new Set<string>();
  const foods: Meal[] = [];

  for (const meal of meals) {
    const key = meal.name.trim().toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    foods.push(meal);
    if (foods.length === limit) {
      break;
    }
  }

  return foods;
};

export const clearAllMeals = async (): Promise<void> => {
  await AsyncStorage.removeItem(MEALS_KEY);
};
