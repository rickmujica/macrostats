import MealForm from '@/components/MealForm';
import { useToast } from '@/components/Toast';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { track } from '@/services/analytics';
import { getMealById, updateMeal, type Meal } from '@/storage/meals';
import { useGlobalStyles } from '@/styles/global';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function EditMealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const themeStyles = useGlobalStyles();
  const { showToast } = useToast();
  const [meal, setMeal] = useState<Meal | null | undefined>(undefined);

  useEffect(() => {
    getMealById(id).then((found) => setMeal(found ?? null));
  }, [id]);

  const cancelButton = (
    <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
      <Text style={{ color: colors.primary, fontSize: 16 }}>{t('cancel')}</Text>
    </TouchableOpacity>
  );

  if (meal === undefined) {
    return <View style={themeStyles.container} />;
  }

  if (meal === null) {
    return (
      <View style={themeStyles.container}>
        <View style={themeStyles.header}>
          <Text style={themeStyles.title}>{t('editMeal')}</Text>
          {cancelButton}
        </View>
        <Text style={[themeStyles.empty, { marginTop: 20 }]}>{t('mealNotFound')}</Text>
      </View>
    );
  }

  return (
    <MealForm
      title={t('editMeal')}
      submitLabel={t('saveChanges')}
      initialMeal={meal}
      headerAction={cancelButton}
      onSubmit={async (changes) => {
        await updateMeal(meal.id, changes);
        track('meal_edited');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(t('mealUpdatedToast'));
        router.back();
        return false;
      }}
    />
  );
}
