import CopyButton from '@/components/CopyButton';
import HomeHeader from '@/components/HomeHeader';
import MacroGrid from '@/components/MacroGrid';
import RecentMeals from '@/components/RecentMeals';
import { useTranslation } from '@/i18n';
import ShareButton from '@/components/ShareButton';
import { getMeals, Meal, sameDay } from '@/storage/meals';
import { getSettings, MacroGoals } from '@/storage/settings';
import { useGlobalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState, ScrollView, Text, View } from 'react-native';


export default function HomeScreen() {
  const { t } = useTranslation();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<MacroGoals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Totals only count today's meals; the recent list spans every day.
  const todayMeals = meals.filter((meal) => sameDay(new Date(meal.createdAt), new Date()));

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

      // Reload when the app returns to the foreground so a new day starts at zero.
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          loadMeals();
        }
      });
      return () => subscription.remove();
    }, []),
  );

  return (
    <ScrollView style={themeStyles.container}>
      <View style={themeStyles.header}>
        <Text style={themeStyles.title}>{t('appName')}</Text>
        <ShareButton meals={todayMeals} />
      </View>
      <HomeHeader />
      <MacroGrid meals={todayMeals} goals={goals} />
      <CopyButton meals={todayMeals} />
      <RecentMeals meals={meals} onDelete={loadMeals} />
    </ScrollView>
  );
}