import { useTranslation } from '@/i18n';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeHeader() {
  const { locale } = useTranslation();

  const currentDate = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.header}>
      <Text style={styles.date}>{currentDate}</Text>
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
    color: '#a0a0b0',
  },
});