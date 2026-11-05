import AsyncStorage from '@react-native-async-storage/async-storage';

import { addWater, logWeight } from './body';
import { MEALS_KEY, type Meal } from './meals';
import { APP_SETTINGS_KEY, calculateGoals, getDefaultSettings, saveSettings, type UserProfile } from './settings';

const SEEDED_KEY = 'demoSeeded';

// Weight in kg every other day, from today back to 12 days ago.
const WEIGH_INS = [78.3, 78.6, 78.5, 78.9, 79.2, 79.1, 79.5];

const profile: UserProfile = {
  age: 30,
  height: 178,
  weight: 78,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'maintain',
};

// [es, en, calories, protein, carbs, fat, hour]
type Sample = [string, string, number, number, number, number, number];

const DAYS: Sample[][] = [
  [
    ['Avena con banana', 'Oatmeal with banana', 380, 12, 68, 7, 8],
    ['Pollo con arroz y ensalada', 'Chicken, rice and salad', 640, 48, 72, 14, 13],
    ['Yogur griego con nueces', 'Greek yogurt with walnuts', 260, 18, 12, 16, 17],
  ],
  [
    ['Tostadas con huevo', 'Eggs on toast', 420, 22, 38, 19, 8],
    ['Milanesa con puré', 'Breaded steak with mash', 780, 42, 70, 34, 13],
    ['Batido de proteína', 'Protein shake', 220, 30, 14, 4, 18],
    ['Salmón con verduras', 'Salmon with vegetables', 560, 40, 22, 32, 21],
  ],
  [
    ['Café con leche y medialunas', 'Latte and croissants', 450, 12, 52, 21, 8],
    ['Ensalada César con pollo', 'Chicken Caesar salad', 520, 38, 20, 32, 13],
    ['Pasta con tuco', 'Pasta with tomato sauce', 690, 26, 104, 16, 21],
  ],
  [
    ['Avena con frutos rojos', 'Oatmeal with berries', 350, 11, 60, 7, 8],
    ['Wrap de carne', 'Beef wrap', 610, 36, 58, 24, 13],
    ['Manzana y almendras', 'Apple and almonds', 240, 6, 26, 14, 17],
    ['Pollo al horno con batata', 'Roast chicken with sweet potato', 620, 50, 54, 18, 21],
  ],
  [
    ['Tostadas con palta', 'Avocado toast', 400, 12, 40, 22, 8],
    ['Hamburguesa casera', 'Homemade burger', 820, 44, 62, 42, 13],
    ['Yogur con granola', 'Yogurt with granola', 300, 14, 42, 9, 18],
  ],
  [
    ['Panqueques de avena', 'Oat pancakes', 430, 24, 56, 11, 9],
    ['Bowl de arroz, carne y porotos', 'Rice, beef and bean bowl', 710, 46, 82, 18, 14],
    ['Pizza (2 porciones)', 'Pizza (2 slices)', 560, 24, 66, 22, 21],
  ],
  [
    ['Huevos revueltos y tostada', 'Scrambled eggs and toast', 390, 24, 28, 19, 8],
    ['Pollo con arroz integral', 'Chicken with brown rice', 590, 46, 64, 13, 13],
  ],
];

/**
 * The web version is a public demo: on the first visit it skips onboarding with a
 * sample profile and fills the last week with meals, weigh-ins and water so there is something to explore.
 * It runs only once per browser.
 */
export const seedDemo = async () => {
  if (typeof window === 'undefined') return;
  if (await AsyncStorage.getItem(SEEDED_KEY)) return;
  const hasData = (await AsyncStorage.getItem(APP_SETTINGS_KEY)) || (await AsyncStorage.getItem(MEALS_KEY));
  if (!hasData) {
    const defaults = getDefaultSettings();
    await saveSettings({ ...defaults, profile, goals: calculateGoals(profile), onboardingComplete: true });

    const es = defaults.locale === 'es';
    const meals: Meal[] = [];
    DAYS.forEach((day, i) => {
      const daysAgo = DAYS.length - 1 - i;
      day.forEach(([nameEs, nameEn, calories, protein, carbs, fat, hour], j) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(hour, 15, 0, 0);
        // Today only shows the meals whose time has already passed.
        if (date.getTime() > Date.now() && j > 0) return;
        meals.push({
          id: `demo-${i}-${j}`,
          name: es ? nameEs : nameEn,
          calories,
          protein,
          carbs,
          fat,
          createdAt: date.toISOString(),
        });
      });
    });
    meals.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(meals));

    // Two weeks of weigh-ins trending down a little, and water for the last few days.
    for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      if (daysAgo % 2 === 0) await logWeight(date, WEIGH_INS[daysAgo / 2]);
      if (daysAgo <= 3) await addWater(date, daysAgo === 0 ? 750 : 2000);
    }
  }
  await AsyncStorage.setItem(SEEDED_KEY, '1');
};
