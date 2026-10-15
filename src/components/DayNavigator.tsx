import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { sameDay } from '@/storage/meals';
import { addDays } from '@/utils/dates';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DayNavigatorProps = {
  date: Date;
  onChange: (date: Date) => void;
};

export default function DayNavigator({ date, onChange }: DayNavigatorProps) {
  const { t, locale } = useTranslation();
  const { colors } = useTheme();
  const isToday = sameDay(date, new Date());
  const label = date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onChange(addDays(date, -1))}
        hitSlop={10}
        accessibilityRole='button'
        accessibilityLabel={t('previousDay')}
      >
        <Ionicons name='chevron-back' size={22} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.labels}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{label}</Text>
        {!isToday && (
          <TouchableOpacity onPress={() => onChange(new Date())} hitSlop={8}>
            <Text style={[styles.today, { color: colors.primary }]}>{t('backToToday')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={() => onChange(addDays(date, 1))}
        disabled={isToday}
        hitSlop={10}
        accessibilityRole='button'
        accessibilityLabel={t('nextDay')}
        accessibilityState={{ disabled: isToday }}
      >
        <Ionicons
          name='chevron-forward'
          size={22}
          color={isToday ? colors.textSecondary : colors.primary}
          style={{ opacity: isToday ? 0.3 : 1 }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  labels: {
    flex: 1,
    alignItems: 'center',
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
  },
  today: {
    fontSize: 13,
    marginTop: 4,
  },
});
