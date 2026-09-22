import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { Meal } from '@/storage/meals';
import { Ionicons } from '@expo/vector-icons';
import { Share, TouchableOpacity } from 'react-native';

type ShareButtonProps = {
  meals: Meal[];
};

export default function ShareButton({ meals }: ShareButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleShare = async () => {
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    await Share.share({
      message: `${t('appName')} ${t('dailySummary')}\n\n${t('calories')}: ${totals.calories}\n${t('protein')}: ${totals.protein}g\n${t('carbs')}: ${totals.carbs}g\n${t('fat')}: ${totals.fat}g\n\n${t('mealsLabel')}: ${meals.length} ${t('loggedToday')}`,
    });
  };

  return (
    <TouchableOpacity onPress={handleShare}>
      <Ionicons name='share-outline' size={24} color={colors.primary} />
    </TouchableOpacity>
  );
}