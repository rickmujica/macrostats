import type { Meal } from '@/storage/meals';
import { buildMealsCsv } from '@/utils/csv';

const meal = (overrides: Partial<Meal>): Meal => ({
  id: '1',
  name: 'Eggs',
  calories: 140,
  protein: 12,
  carbs: 1,
  fat: 10,
  createdAt: new Date(2026, 9, 16, 9, 5).toISOString(),
  ...overrides,
});

describe('buildMealsCsv', () => {
  it('writes a header and one row per meal, oldest first', () => {
    const csv = buildMealsCsv([
      meal({ id: 'b', name: 'Rice', createdAt: new Date(2026, 9, 16, 13, 30).toISOString() }),
      meal({ id: 'a' }),
    ]);
    const lines = csv.replace('﻿', '').trim().split('\r\n');
    expect(lines[0]).toBe('date,time,meal,calories_kcal,protein_g,carbs_g,fat_g,amount_g');
    expect(lines[1]).toBe('2026-10-16,09:05,Eggs,140,12,1,10,');
    expect(lines[2]).toBe('2026-10-16,13:30,Rice,140,12,1,10,');
  });

  it('quotes names with commas or quotes and includes grams for portions', () => {
    const csv = buildMealsCsv([
      meal({
        name: 'Toast, "whole" grain',
        portion: { per100g: { calories: 250, protein: 10, carbs: 40, fat: 4 }, grams: 60 },
      }),
    ]);
    expect(csv).toContain('"Toast, ""whole"" grain",140,12,1,10,60');
  });

  it('starts with a byte order mark for Excel', () => {
    expect(buildMealsCsv([]).startsWith('﻿')).toBe(true);
  });
});
