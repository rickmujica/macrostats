import { useTranslation } from '@/i18n';
import { Meal, sumMeals } from '@/storage/meals';
import type { MacroGoals } from '@/storage/settings';
import { StyleSheet, View } from 'react-native';
import MacroCard from './MacroCard';

type MacroGridProps = {
  meals: Meal[];
  goals: MacroGoals;
};

export default function MacroGrid({ meals, goals }: MacroGridProps) {
  const { t } = useTranslation();
  const totals = sumMeals(meals);

  return (
    <View style={styles.grid}>
      <MacroCard
        label={t('calories')}
        value={totals.calories}
        goal={goals.calories}
        color='#ff6b6b'
      />
      <MacroCard
        label={t('protein')}
        value={totals.protein}
        goal={goals.protein}
        unit='g'
        color='#4ecdc4'
      />
      <MacroCard
        label={t('carbs')}
        value={totals.carbs}
        goal={goals.carbs}
        unit='g'
        color='#ffd93d'
      />
      <MacroCard
        label={t('fat')}
        value={totals.fat}
        goal={goals.fat}
        unit='g'
        color='#6bcb77'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});