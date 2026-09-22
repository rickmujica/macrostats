import DatePicker from '@/components/DatePicker';
import MealItem from '@/components/MealItem';
import { useTranslation } from '@/i18n';
import { clearAllMeals, getMeals, Meal } from '@/storage/meals';
import { useGlobalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AllMealsScreen() {
  const { t } = useTranslation();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
  };

  const handleClearAll = async () => {
    await clearAllMeals();
    loadMeals();
  };

  const themeStyles = useGlobalStyles();

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, []),
  );

  return (
    <ScrollView style={themeStyles.container}>
      <View style={themeStyles.header}>
        <Text style={themeStyles.title}>{t('allMeals')}</Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={styles.clearButton}>{t('clearAll')}</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={themeStyles.sectionTitle}>{t('pickADate')}</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={themeStyles.sectionTitle}>{date.toLocaleDateString()}</Text>
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
      <View style={{ marginTop: 30 }}>
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
              onDelete={loadMeals}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = {
  clearButton: {
    color: 'red',
    fontSize: 16,
  },
};