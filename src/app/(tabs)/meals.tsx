import AdBanner from '@/ads/AdBanner';
import DatePicker from '@/components/DatePicker';
import MealItem from '@/components/MealItem';
import WeekChart from '@/components/WeekChart';
import WeightCard from '@/components/WeightCard';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { getWeights, type WeightEntry } from '@/storage/body';
import { clearAllMeals, getMeals, Meal, sameDay } from '@/storage/meals';
import { getSettings } from '@/storage/settings';
import { useGlobalStyles } from '@/styles/global';
import { addDays, getWeekDays } from '@/utils/dates';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const { t, locale } = useTranslation();
  const { colors } = useTheme();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(0);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const weekDays = getWeekDays(date, locale);
  const isCurrentWeek = weekDays.some((day) => sameDay(day, new Date()));
  const dayMeals = meals.filter((meal) => sameDay(new Date(meal.createdAt), date));

  const loadMeals = useCallback(async () => {
    const [data, settings, weightEntries] = await Promise.all([getMeals(), getSettings(), getWeights()]);
    setMeals(data);
    setWeights(weightEntries);
    setCalorieGoal(settings.goals.calories);
  }, []);

  const handleClearAll = () => {
    Alert.alert(t('clearAllTitle'), t('clearAllMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await clearAllMeals();
          loadMeals();
        },
      },
    ]);
  };

  const themeStyles = useGlobalStyles();

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [loadMeals]),
  );

  const weekRange = `${weekDays[0].toLocaleDateString(locale, { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(locale, { month: 'short', day: 'numeric' })}`;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={themeStyles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={themeStyles.header}>
          <Text style={themeStyles.title}>{t('history')}</Text>
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={{ color: colors.alert, fontSize: 16 }}>{t('clearAll')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekNav}>
          <TouchableOpacity
            onPress={() => setDate(addDays(date, -7))}
            hitSlop={10}
            accessibilityRole='button'
            accessibilityLabel={t('previousWeek')}
          >
            <Ionicons name='chevron-back' size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.weekRange, { color: colors.text }]}>{weekRange}</Text>
          <TouchableOpacity
            onPress={() => setDate(addDays(date, 7))}
            disabled={isCurrentWeek}
            hitSlop={10}
            accessibilityRole='button'
            accessibilityLabel={t('nextWeek')}
            accessibilityState={{ disabled: isCurrentWeek }}
          >
            <Ionicons
              name='chevron-forward'
              size={22}
              color={isCurrentWeek ? colors.textSecondary : colors.primary}
            style={{ opacity: isCurrentWeek ? 0.3 : 1 }}
            />
          </TouchableOpacity>
        </View>

        <WeekChart
          days={weekDays}
          meals={meals}
          calorieGoal={calorieGoal}
          selectedDate={date}
          onSelect={setDate}
        />

        <WeightCard days={weekDays} entries={weights} selectedDate={date} />

        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dayButton}>
          <Text style={[themeStyles.sectionTitle, styles.dayTitle, { color: colors.text }]}>
            {date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Ionicons name='calendar-outline' size={20} color={colors.primary} />
        </TouchableOpacity>

        {showDatePicker && (
          <DatePicker
            date={date}
            setDate={setDate}
            visible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            possitiveBtnLabel={{ label: t('confirm') }}
            negativeBtnLabel={{ label: t('cancel') }}
          />
        )}

        {dayMeals.length === 0 ? (
          <Text style={themeStyles.empty}>{t('noMealsDay')}</Text>
        ) : (
          dayMeals.map((meal) => <MealItem key={meal.id} meal={meal} onChange={loadMeals} />)
        )}
      </ScrollView>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },
  weekRange: {
    fontSize: 15,
    fontWeight: '600',
  },
  dayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 12,
  },
  dayTitle: {
    marginTop: 0,
    marginBottom: 0,
  },
});
