import CopyButton from '@/components/CopyButton';
import HomeHeader from '@/components/HomeHeader';
import MacroGrid from '@/components/MacroGrid';
import RecentMeals from '@/components/RecentMeals';
import { useTranslation } from '@/i18n';
// import ReminderToggle from '@/components/ReminderToggle';
import ShareButton from '@/components/ShareButton';
import { getMeals, Meal } from '@/storage/meals';
import { getSettings, MacroGoals } from '@/storage/settings';
import { useGlobalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';


export default function HomeScreen() {
  const { t } = useTranslation();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<MacroGoals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
    // console.log('Loaded meals:', data);
  };

  const loadGoals = async () => {
    const settings = await getSettings();
    setGoals(settings.goals);
    // console.log('Loaded goals:', settings.goals);
  };

  const themeStyles = useGlobalStyles();

  useFocusEffect(
    useCallback(() => {
      loadMeals();
      loadGoals();
    }, []),
  );

  return (
    <ScrollView style={themeStyles.container}>
      <View style={themeStyles.header}>
        <Text style={themeStyles.title}>{t('appName')}</Text>
        <ShareButton meals={meals} />
      </View>
      <HomeHeader />
      <MacroGrid meals={meals} goals={goals}/>
      <CopyButton meals={meals} />
      {/* <ReminderToggle /> */}
      <RecentMeals meals={meals} onDelete={loadMeals} />
    </ScrollView>
  );
}