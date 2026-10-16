import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { getWeightChange, type WeightEntry } from '@/storage/body';
import { dateKey } from '@/utils/dates';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

const WEIGHT_COLOR = '#b388ff';
const PLOT_HEIGHT = 70;

type WeightCardProps = {
  /** The seven days shown in the weekly chart above, so the two line up. */
  days: Date[];
  entries: WeightEntry[];
  selectedDate: Date;
};

/** Weight for the week as a line under the calorie chart, with the 30-day trend. */
export default function WeightCard({ days, entries, selectedDate }: WeightCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const byDay = new Map(entries.map((entry) => [entry.date, entry.kg]));
  const weekValues = days.map((day) => byDay.get(dateKey(day)) ?? null);
  const logged = weekValues.filter((value): value is number => value !== null);
  const latest = entries[entries.length - 1];
  const change = getWeightChange(entries, 30);

  const min = Math.min(...logged);
  const max = Math.max(...logged);
  const span = Math.max(max - min, 1);
  const columnWidth = width / 7;
  const points = weekValues
    .map((value, index) =>
      value === null
        ? null
        : {
            x: columnWidth * index + columnWidth / 2,
            y: 8 + (1 - (value - min) / span) * (PLOT_HEIGHT - 16),
          },
    )
    .filter((point): point is { x: number; y: number } => point !== null);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.text}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('bodyWeight')}</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {latest ? `${latest.kg} kg` : t('noWeightYet')}
          </Text>
          {change !== null && (
            <Text style={[styles.change, { color: colors.textSecondary }]}>
              {t('weightChange30').replace('{change}', `${change > 0 ? '+' : ''}${change}`)}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: WEIGHT_COLOR }]}
          onPress={() => router.push({ pathname: '/weight', params: { date: dateKey(selectedDate) } })}
          accessibilityRole='button'
        >
          <Ionicons name='add' size={18} color='#1a1033' />
          <Text style={styles.buttonText}>{t('logWeight')}</Text>
        </TouchableOpacity>
      </View>

      {logged.length > 0 && (
        <View style={styles.plot} onLayout={onLayout}>
          {width > 0 && (
            <Svg width={width} height={PLOT_HEIGHT}>
              {points.length > 1 && (
                <Polyline
                  points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                  fill='none'
                  stroke={WEIGHT_COLOR}
                  strokeWidth={2.5}
                  strokeLinejoin='round'
                />
              )}
              {points.map((point) => (
                <Circle key={point.x} cx={point.x} cy={point.y} r={4} fill={WEIGHT_COLOR} />
              ))}
            </Svg>
          )}
          <View style={styles.labels}>
            {weekValues.map((value, index) => (
              <Text key={index} style={[styles.dayValue, { color: colors.textSecondary }]}>
                {value ?? ''}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  change: {
    fontSize: 13,
    marginTop: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 36,
  },
  buttonText: {
    color: '#1a1033',
    fontWeight: '700',
    fontSize: 14,
  },
  plot: {
    marginTop: 12,
  },
  labels: {
    flexDirection: 'row',
  },
  dayValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
  },
});
