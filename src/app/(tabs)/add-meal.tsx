import MealForm from '@/components/MealForm';
import { useToast } from '@/components/Toast';
import { useTranslation } from '@/i18n';
import { addMeal } from '@/storage/meals';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

export default function AddMealScreen() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  return (
    <MealForm
      title={t('addMeal')}
      submitLabel={t('addMeal')}
      showRecentFoods
      onSubmit={async (meal) => {
        await addMeal(meal);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(t('mealAddedToast').replace('{name}', meal.name));
        router.navigate('/');
        return true;
      }}
    />
  );
}
