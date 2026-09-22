import AsyncStorage from '@react-native-async-storage/async-storage';

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
};

const MEALS_KEY = 'meals';

const sameDay = (dateA: Date, dateB: Date) =>
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
): Promise<Meal> => {
  const meals = await getMeals();
  const newMeal: Meal = {
    ...meal,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify([newMeal, ...meals]));
  return newMeal;
};

export const deleteMeal = async (id: string): Promise<void> => {
  const meals = await getMeals();
  const filtered = meals.filter((meal) => meal.id !== id);
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(filtered));
};

export const clearAllMeals = async (): Promise<void> => {
  await AsyncStorage.removeItem(MEALS_KEY);
};
