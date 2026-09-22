import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { Meal } from '@/storage/meals';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

type CopyButtonProps = {
  meals: Meal[];
};

export default function CopyButton({ meals }: CopyButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleCopy = async () => {
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const summary = `${t('appName')} ${t('dailySummary')}\n\n${t('calories')}: ${totals.calories}\n${t('protein')}: ${totals.protein}g\n${t('carbs')}: ${totals.carbs}g\n${t('fat')}: ${totals.fat}g\n\n${t('mealsLabel')}: ${meals.length} ${t('loggedToday')}`;

    await Clipboard.setStringAsync(summary);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(t('copied'), t('copiedClipboard'));
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleCopy}>
      <Ionicons name='copy-outline' size={18} color={colors.primary} />
      <Text style={[styles.text, { color: colors.primary }]}>{t('copySummary')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
  },
  text: {
    fontSize: 14,
  },
});