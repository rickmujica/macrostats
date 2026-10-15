import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { sameDay, sumMeals, type Meal } from '@/storage/meals';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type WeekChartProps = {
  days: Date[];
  meals: Meal[];
  calorieGoal: number;
  selectedDate: Date;
  onSelect: (date: Date) => void;
};

const CHART_HEIGHT = 140;
// Height of the day label under each bar (marginTop + height).
const LABEL_HEIGHT = 22;

/** Daily calories for one week as bars, with the calorie goal as a dashed line. */
export default function WeekChart({ days, meals, calorieGoal, selectedDate, onSelect }: WeekChartProps) {
  const { t, locale } = useTranslation();
  const { colors } = useTheme();

  const totals = days.map(
    (day) => sumMeals(meals.filter((meal) => sameDay(new Date(meal.createdAt), day))).calories,
  );
  const scaleMax = Math.max(calorieGoal, ...totals, 1);
  const goalOffset = (calorieGoal / scaleMax) * CHART_HEIGHT;
  const loggedDays = totals.filter((total) => total > 0);
  const average = loggedDays.length
    ? Math.round(loggedDays.reduce((sum, total) => sum + total, 0) / loggedDays.length)
    : 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.caption, { color: colors.textSecondary }]}>
        {average > 0
          ? t('weeklyAverage').replace('{calories}', String(average))
          : t('noMealsWeek')}
      </Text>
      <View style={styles.plot}>
        {calorieGoal > 0 && (
          <View
            style={[styles.goalLine, { bottom: goalOffset + LABEL_HEIGHT, borderColor: colors.textSecondary }]}
            accessibilityLabel={`${t('calories')} goal ${calorieGoal}`}
          />
        )}
        {days.map((day, index) => {
          const total = totals[index];
          const isSelected = sameDay(day, selectedDate);
          const overGoal = calorieGoal > 0 && total > calorieGoal;
          const barColor = overGoal ? colors.alert : colors.primary;

          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={styles.column}
              onPress={() => onSelect(day)}
              accessibilityRole='button'
              accessibilityLabel={`${day.toLocaleDateString(locale, { weekday: 'long' })}: ${total} kcal`}
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.barArea}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max((total / scaleMax) * CHART_HEIGHT, total > 0 ? 4 : 0),
                      backgroundColor: barColor,
                      opacity: isSelected ? 1 : 0.45,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  { color: isSelected ? colors.text : colors.textSecondary },
                  isSelected && styles.dayLabelSelected,
                ]}
              >
                {day.toLocaleDateString(locale, { weekday: 'narrow' })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
  },
  caption: {
    fontSize: 13,
    marginBottom: 12,
  },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  barArea: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 18,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 6,
    height: 16,
  },
  dayLabelSelected: {
    fontWeight: '700',
  },
});
