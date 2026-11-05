import type { Meal } from '@/storage/meals';
import { dateKey } from '@/utils/dates';

const CSV_HEADER = ['date', 'time', 'meal', 'calories_kcal', 'protein_g', 'carbs_g', 'fat_g', 'amount_g'];

const escapeCell = (value: string | number): string => {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Every meal as one CSV row, oldest first, with dates and times in local time. */
export const buildMealsCsv = (meals: Meal[]): string => {
  const rows = [...meals]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((meal) => {
      const created = new Date(meal.createdAt);
      const time = `${String(created.getHours()).padStart(2, '0')}:${String(created.getMinutes()).padStart(2, '0')}`;
      return [
        dateKey(created),
        time,
        meal.name,
        meal.calories,
        meal.protein,
        meal.carbs,
        meal.fat,
        meal.portion ? meal.portion.grams : '',
      ];
    });

  // The byte order mark lets Excel open accented names correctly.
  return '﻿' + [CSV_HEADER, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n') + '\r\n';
};
