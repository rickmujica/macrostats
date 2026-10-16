import { t } from '@/i18n';
import { sumMeals, type Meal } from '@/storage/meals';
import { formatNumber } from '@/utils/numbers';

/** Plain-text macro summary for sharing or copying. */
export const buildDaySummary = (meals: Meal[], date: Date, locale: string): string => {
  const totals = sumMeals(meals);
  const day = date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });

  return [
    `${t('appName')} ${t('dailySummary')} (${day})`,
    '',
    `${t('calories')}: ${formatNumber(totals.calories, locale)}`,
    `${t('protein')}: ${formatNumber(totals.protein, locale)}g`,
    `${t('carbs')}: ${formatNumber(totals.carbs, locale)}g`,
    `${t('fat')}: ${formatNumber(totals.fat, locale)}g`,
    '',
    `${t('mealsLabel')}: ${meals.length}`,
  ].join('\n');
};
