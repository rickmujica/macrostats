import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addMeal,
  deleteMeal,
  getMealsByDate,
  getRecentFoods,
  restoreMeal,
  sumMeals,
  type Meal,
} from '@/storage/meals';

const meal = (overrides: Partial<Meal>): Meal => ({
  id: '1',
  name: 'Eggs',
  calories: 140,
  protein: 12,
  carbs: 1,
  fat: 10,
  createdAt: new Date(2026, 9, 16, 9).toISOString(),
  ...overrides,
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('sumMeals', () => {
  it('adds up every macro and rounds to one decimal', () => {
    const totals = sumMeals([
      meal({ calories: 100.1, protein: 0.1 }),
      meal({ calories: 200.2, protein: 0.2 }),
    ]);
    expect(totals).toEqual({ calories: 300.3, protein: 0.3, carbs: 2, fat: 20 });
  });

  it('returns zeros for no meals', () => {
    expect(sumMeals([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe('meal storage', () => {
  it('finds meals by local day', async () => {
    await AsyncStorage.setItem(
      'meals',
      JSON.stringify([
        meal({ id: 'a', createdAt: new Date(2026, 9, 16, 23, 30).toISOString() }),
        meal({ id: 'b', createdAt: new Date(2026, 9, 17, 0, 15).toISOString() }),
      ]),
    );
    const meals = await getMealsByDate(new Date(2026, 9, 16, 12));
    expect(meals.map((m) => m.id)).toEqual(['a']);
  });

  it('deletes a meal and restores it in date order', async () => {
    await AsyncStorage.setItem(
      'meals',
      JSON.stringify([
        meal({ id: 'new', createdAt: new Date(2026, 9, 16, 20).toISOString() }),
        meal({ id: 'mid', createdAt: new Date(2026, 9, 16, 13).toISOString() }),
        meal({ id: 'old', createdAt: new Date(2026, 9, 16, 8).toISOString() }),
      ]),
    );
    const removed = await deleteMeal('mid');
    expect(removed?.id).toBe('mid');
    await restoreMeal(removed!);
    const day = await getMealsByDate(new Date(2026, 9, 16));
    expect(day.map((m) => m.id)).toEqual(['new', 'mid', 'old']);
  });

  it('lists recent foods once per name, newest first', async () => {
    await addMeal({ name: 'Rice', calories: 200, protein: 4, carbs: 44, fat: 0 });
    await addMeal({ name: 'Eggs', calories: 140, protein: 12, carbs: 1, fat: 10 });
    await addMeal({ name: 'rice ', calories: 210, protein: 4, carbs: 46, fat: 0 });
    const foods = await getRecentFoods();
    expect(foods.map((f) => f.name)).toEqual(['rice ', 'Eggs']);
  });
});
