import { useToast } from '@/components/Toast';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { Meal } from '@/storage/meals';
import { buildDaySummary } from '@/utils/summary';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type CopyButtonProps = {
  meals: Meal[];
  date: Date;
};

export default function CopyButton({ meals, date }: CopyButtonProps) {
  const { t, locale } = useTranslation();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(buildDaySummary(meals, date, locale));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(t('copiedClipboard'));
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
