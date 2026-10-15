import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { Meal } from '@/storage/meals';
import { buildDaySummary } from '@/utils/summary';
import { Ionicons } from '@expo/vector-icons';
import { Share, TouchableOpacity } from 'react-native';

type ShareButtonProps = {
  meals: Meal[];
  date: Date;
};

export default function ShareButton({ meals, date }: ShareButtonProps) {
  const { t, locale } = useTranslation();
  const { colors } = useTheme();

  const handleShare = async () => {
    await Share.share({ message: buildDaySummary(meals, date, locale) });
  };

  return (
    <TouchableOpacity onPress={handleShare} accessibilityRole='button' accessibilityLabel={t('shareSummary')}>
      <Ionicons name='share-outline' size={24} color={colors.primary} />
    </TouchableOpacity>
  );
}
