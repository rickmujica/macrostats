import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { Meal, sumMeals } from '@/storage/meals';
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
    const totals = sumMeals(meals);

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