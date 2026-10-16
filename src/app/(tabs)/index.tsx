import AdBanner from '@/ads/AdBanner';
import CopyButton from '@/components/CopyButton';
import DayNavigator from '@/components/DayNavigator';
import MacroGrid from '@/components/MacroGrid';
import RecentMeals from '@/components/RecentMeals';
import ShareButton from '@/components/ShareButton';
import { useToast } from '@/components/Toast';
import WaterCard from '@/components/WaterCard';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { track } from '@/services/analytics';
import { getWater } from '@/storage/body';
import { copyMealsToDay, deleteMeals, getMeals, Meal, sameDay } from '@/storage/meals';
import { getSettings, MacroGoals } from '@/storage/settings';
import { useGlobalStyles } from '@/styles/global';
import { addDays } from '@/utils/dates';
import { formatNumber } from '@/utils/numbers';
import { getStreak } from '@/utils/streak';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { t, locale } = useTranslation();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [goals, setGoals] = useState<MacroGoals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [waterGoal, setWaterGoal] = useState(0);
  const [water, setWater] = useState(0);

  const dayMeals = meals.filter((meal) => sameDay(new Date(meal.createdAt), selectedDate));
  const isToday = sameDay(selectedDate, new Date());
  const yesterday = addDays(new Date(), -1);
  const yesterdayHasMeals = meals.some((meal) => sameDay(new Date(meal.createdAt), yesterday));
  const streak = getStreak(meals);

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
  };

  const loadGoals = async () => {
    const settings = await getSettings();
    setGoals(settings.goals);
    setWaterGoal(settings.waterGoal);
  };

  const themeStyles = useGlobalStyles();

  useFocusEffect(
    useCallback(() => {
      loadMeals();
      loadGoals();

      // Back in the foreground on a new day: jump to the new day so it starts at zero.
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          setSelectedDate((current) =>
            sameDay(current, new Date()) ? current : new Date(),
          );
          loadMeals();
        }
      });
      return () => subscription.remove();
    }, []),
  );

  // Water for the selected day, reloaded on focus (a restored backup changes it) and when the
  // app comes back to the foreground.
  useFocusEffect(
    useCallback(() => {
      // Ignore answers that arrive after the day changed or the screen lost focus.
      let current = true;
      const loadWater = () =>
        getWater(selectedDate).then((ml) => {
          if (current) {
            setWater(ml);
          }
        });

      loadWater();
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          loadWater();
        }
      });
      return () => {
        current = false;
        subscription.remove();
      };
    }, [selectedDate]),
  );

  // Today: copy yesterday's meals. Another day: copy that day's meals to today.
  const copySource = isToday ? (yesterdayHasMeals ? yesterday : null) : dayMeals.length > 0 ? selectedDate : null;

  const copyDay = async () => {
    if (!copySource) {
      return;
    }
    const copies = await copyMealsToDay(copySource, new Date());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    track('day_copied', { meals: copies.length });
    setSelectedDate(new Date());
    await loadMeals();
    const copiedMessage =
      copies.length === 1 ? t('mealsCopiedOne') : t('mealsCopied').replace('{count}', formatNumber(copies.length, locale));
    showToast(copiedMessage, {
      actionLabel: t('undo'),
      onAction: async () => {
        await deleteMeals(copies.map((meal) => meal.id));
        loadMeals();
      },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={themeStyles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={themeStyles.header}>
          <Text style={themeStyles.title}>{t('appName')}</Text>
          <ShareButton meals={dayMeals} date={selectedDate} />
        </View>
        {streak > 0 && (
          <View
            style={[styles.streak, { backgroundColor: colors.surface }]}
            accessibilityLabel={streak === 1 ? t('streakLabelOne') : t('streakLabel').replace('{days}', String(streak))}
          >
            <Ionicons name='flame' size={16} color='#ff8a3d' />
            <Text style={[styles.streakText, { color: colors.text }]}>
              {(streak === 1 ? t('streakOneDay') : t('streakDays')).replace('{days}', String(streak))}
            </Text>
          </View>
        )}
        <DayNavigator date={selectedDate} onChange={setSelectedDate} />
        <MacroGrid meals={dayMeals} goals={goals} />
        <WaterCard date={selectedDate} ml={water} goal={waterGoal} onChange={setWater} />
        <View style={styles.actions}>
          <CopyButton meals={dayMeals} date={selectedDate} />
          {copySource && (
            <TouchableOpacity style={styles.copyDay} onPress={copyDay} accessibilityRole='button'>
              <Ionicons name='duplicate-outline' size={18} color={colors.primary} />
              <Text style={[styles.copyDayText, { color: colors.primary }]}>
                {isToday ? t('copyYesterday') : t('copyDayToToday')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <RecentMeals
          title={isToday ? t('todaysMeals') : t('mealsThatDay')}
          meals={dayMeals}
          onChange={loadMeals}
        />
      </ScrollView>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 24,
  },
  copyDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
  },
  copyDayText: {
    fontSize: 14,
  },
});
