import CopyButton from '@/components/CopyButton';
import DayNavigator from '@/components/DayNavigator';
import MacroGrid from '@/components/MacroGrid';
import RecentMeals from '@/components/RecentMeals';
import ShareButton from '@/components/ShareButton';
import { useTranslation } from '@/i18n';
import { getMeals, Meal, sameDay } from '@/storage/meals';
import { getSettings, MacroGoals } from '@/storage/settings';
import { useGlobalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  const { t } = useTranslation();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [goals, setGoals] = useState<MacroGoals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const dayMeals = meals.filter((meal) => sameDay(new Date(meal.createdAt), selectedDate));
  const isToday = sameDay(selectedDate, new Date());

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
  };

  const loadGoals = async () => {
    const settings = await getSettings();
    setGoals(settings.goals);
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

  return (
    <ScrollView style={themeStyles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={themeStyles.header}>
        <Text style={themeStyles.title}>{t('appName')}</Text>
        <ShareButton meals={dayMeals} date={selectedDate} />
      </View>
      <DayNavigator date={selectedDate} onChange={setSelectedDate} />
      <MacroGrid meals={dayMeals} goals={goals} />
      <CopyButton meals={dayMeals} date={selectedDate} />
      <RecentMeals
        title={isToday ? t('todaysMeals') : t('mealsThatDay')}
        meals={dayMeals}
        onChange={loadMeals}
      />
    </ScrollView>
  );
}
