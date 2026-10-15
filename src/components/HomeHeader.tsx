import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeHeader() {
  const { locale } = useTranslation();
  const { colors } = useTheme();

  const currentDate = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.header}>
      <Text style={[styles.date, { color: colors.textSecondary }]}>{currentDate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 24,
    marginBottom: 20,
  },
  date: {
    fontSize: 14,
  },
});