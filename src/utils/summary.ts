import { t } from '@/i18n';
import { sumMeals, type Meal } from '@/storage/meals';

/** Plain-text macro summary for sharing or copying. */
export const buildDaySummary = (meals: Meal[], date: Date, locale: string): string => {
  const totals = sumMeals(meals);
  const day = date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });

  return [
    `${t('appName')} ${t('dailySummary')} (${day})`,
    '',
    `${t('calories')}: ${totals.calories}`,
    `${t('protein')}: ${totals.protein}g`,
    `${t('carbs')}: ${totals.carbs}g`,
    `${t('fat')}: ${totals.fat}g`,
    '',
    `${t('mealsLabel')}: ${meals.length}`,
  ].join('\n');
};
