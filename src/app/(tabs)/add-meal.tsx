import MealForm, { type MealInput } from '@/components/MealForm';
import { useToast } from '@/components/Toast';
import { useTranslation } from '@/i18n';
import { usePro } from '@/pro/ProProvider';
import { track } from '@/services/analytics';
import { addMeal } from '@/storage/meals';
import { takePendingScan } from '@/utils/scanResult';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export default function AddMealScreen() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isPro } = usePro();
  // A scanned product remounts the form (via `key`) with the product filled in.
  const [scanned, setScanned] = useState<{ key: number; food: MealInput }>();

  // Coming back from the scanner: load the scanned product into the form.
  useFocusEffect(
    useCallback(() => {
      const food = takePendingScan();
      if (!food) {
        return;
      }
      setScanned({
        key: Date.now(),
        food: {
          name: food.name,
          ...food.per100g,
          // Start with one serving when the package states it, otherwise 100 g.
          portion: {
            per100g: food.per100g,
            grams: food.servingGrams ?? 100,
            servingGrams: food.servingGrams,
            servings: food.servingGrams ? 1 : undefined,
            barcode: food.barcode,
          },
        },
      });
    }, []),
  );

  return (
    <MealForm
      key={scanned?.key ?? 0}
      title={t('addMeal')}
      submitLabel={t('addMeal')}
      initialMeal={scanned?.food}
      showRecentFoods
      onScanPress={() => router.push(isPro ? '/scan' : '/pro')}
      onSubmit={async (meal) => {
        await addMeal(meal);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        track('meal_added', {
          per100g: !!meal.portion,
          scanned: !!meal.portion?.barcode,
        });
        showToast(t('mealAddedToast').replace('{name}', meal.name));
        router.navigate('/');
        return true;
      }}
    />
  );
}
