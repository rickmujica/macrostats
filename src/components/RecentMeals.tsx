import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { Meal } from '@/storage/meals';
import { useGlobalStyles } from '@/styles/global';
import { Text, View } from 'react-native';
import MealItem from './MealItem';

type RecentMealsProps = {
  title: string;
  meals: Meal[];
  onChange: () => void;
};

export default function RecentMeals({ title, meals, onChange }: RecentMealsProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const themeStyles = useGlobalStyles();

  return (
    <View>
      <Text style={[themeStyles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {meals.length === 0 ? (
        <Text style={themeStyles.empty}>{t('noMealsDay')}</Text>
      ) : (
        meals.map((meal) => <MealItem key={meal.id} meal={meal} onChange={onChange} />)
      )}
    </View>
  );
}
