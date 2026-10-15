import DatePicker from '@/components/DatePicker';
import MealItem from '@/components/MealItem';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { clearAllMeals, getMealsByDate, Meal } from '@/storage/meals';
import { useGlobalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AllMealsScreen() {
  const { t, locale } = useTranslation();
  const { colors } = useTheme();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadMeals = useCallback(async () => {
    const data = await getMealsByDate(date);
    setMeals(data);
  }, [date]);

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

  return (
    <ScrollView style={themeStyles.container}>
      <View style={themeStyles.header}>
        <Text style={themeStyles.title}>{t('allMeals')}</Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={{ color: colors.alert, fontSize: 16 }}>{t('clearAll')}</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={themeStyles.sectionTitle}>{t('pickADate')}</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={[themeStyles.sectionTitle, { color: colors.primary, marginTop: 0 }]}>
            {date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
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
      </View>
      <View style={{ marginTop: 14, paddingBottom: 40 }}>
        {meals.length === 0 ? (
          <Text style={themeStyles.empty}>{t('noMeals')}</Text>
        ) : (
          meals.map((meal) => (
            <MealItem
              key={meal.id}
              id={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
              createdAt={meal.createdAt}
              onDelete={loadMeals}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
