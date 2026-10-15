import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { Meal } from '@/storage/meals';
import { useGlobalStyles } from '@/styles/global';
import { Text, View } from 'react-native';
import MealItem from './MealItem';

type RecentMealsProps = {
  meals: Meal[];
  onDelete: () => void;
};

export default function RecentMeals({ meals, onDelete }: RecentMealsProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const themeStyles = useGlobalStyles();

  return (
    <View>
      <Text style={[themeStyles.sectionTitle, { color: colors.text }]}>{t('recentMeals')}</Text>
      {meals.length === 0 ? (
        <Text style={themeStyles.empty}>{t('noMeals')}</Text>
      ) : (
        meals
          .slice(0, 5)
          .map((meal) => (
            <MealItem
              key={meal.id}
              id={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
              createdAt={meal.createdAt}
              onDelete={onDelete}
            />
          ))
      )}
    </View>
  );
}
