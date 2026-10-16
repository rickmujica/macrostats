// Writes a MacroStats backup full of sample data, for store screenshots.
// Import it in the app from Settings → Import backup. It replaces the app's data.
//
//   node scripts/make-demo-backup.mjs es demo-es.json
//   node scripts/make-demo-backup.mjs en demo-en.json
//
// Dates are relative to today on the machine that runs it, so generate it the day you take the screenshots.
import { writeFileSync } from 'node:fs';

const locale = process.argv[2] === 'en' ? 'en' : 'es';
const out = process.argv[3] ?? `demo-${locale}.json`;

const day = (offset, h, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(h, m, 0, 0);
  return d;
};
const key = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const names =
  locale === 'es'
    ? {
        oats: 'Avena con banana',
        chicken: 'Pollo con arroz',
        yogurt: 'Yogur griego',
        eggs: 'Huevos revueltos',
        pasta: 'Pasta boloñesa',
        shake: 'Batido de proteína',
      }
    : {
        oats: 'Oatmeal with banana',
        chicken: 'Chicken and rice',
        yogurt: 'Greek yogurt',
        eggs: 'Scrambled eggs',
        pasta: 'Spaghetti bolognese',
        shake: 'Protein shake',
      };

let id = 0;
const meal = (name, calories, protein, carbs, fat, date, portion) => ({
  id: `demo${id++}`,
  name,
  calories,
  protein,
  carbs,
  fat,
  createdAt: date.toISOString(),
  ...(portion ? { portion } : {}),
});

const meals = [];
[0.9, 1, 1.1, 0.95, 0.9, 1.05].forEach((k, i) => {
  const offset = -(i + 1);
  meals.push(meal(names.oats, Math.round(380 * k), 12, 64, 8, day(offset, 8, 10)));
  meals.push(meal(names.chicken, Math.round(640 * k), 48, 72, 14, day(offset, 13, 5)));
  meals.push(meal(names.yogurt, Math.round(180 * k), 17, 9, 8, day(offset, 17, 0)));
  meals.push(meal(names.pasta, Math.round(780 * k), 36, 95, 26, day(offset, 21, 0)));
});
meals.push(
  meal(names.oats, 380, 12, 64, 8, day(0, 8, 5), {
    per100g: { calories: 152, protein: 4.8, carbs: 25.6, fat: 3.2 },
    grams: 250,
  }),
);
meals.push(meal(names.chicken, 640, 48, 72, 14, day(0, 13, 10)));
meals.push(meal(names.shake, 160, 30, 4, 2, day(0, 17, 30)));
meals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const weights = [
  { date: key(day(-30, 8)), kg: 82.4 },
  ...[81.6, 81.4, 81.5, 81.1, 80.9, 80.8, 80.6].map((kg, i) => ({ date: key(day(i - 6, 8)), kg })),
];

const backup = {
  app: 'MacroStats',
  format: 1,
  exportedAt: new Date().toISOString(),
  data: {
    meals,
    appSettings: {
      goals: { calories: 2200, protein: 150, carbs: 240, fat: 70 },
      remindersEnabled: false,
      locale,
      theme: 'dark',
      profile: { age: 31, height: 178, weight: 80.6, gender: 'male', activityLevel: 'moderate', goal: 'lose' },
      onboardingComplete: true,
      waterGoal: 2500,
      analyticsEnabled: true,
    },
    favorites: [
      { id: 'f1', name: names.shake, calories: 160, protein: 30, carbs: 4, fat: 2 },
      { id: 'f2', name: names.yogurt, calories: 180, protein: 17, carbs: 9, fat: 8 },
      { id: 'f3', name: names.eggs, calories: 210, protein: 14, carbs: 2, fat: 16 },
    ],
    weights,
    water: { [key(day(0, 9))]: 1500 },
  },
};

writeFileSync(out, JSON.stringify(backup, null, 2));
console.log(`Wrote ${out}`);
