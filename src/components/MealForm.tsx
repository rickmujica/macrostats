import LabeledTextInput from '@/components/LabeledTextInput';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { getRecentFoods, type Meal, type MacroTotals } from '@/storage/meals';
import { useGlobalStyles } from '@/styles/global';
import { parseAmount, roundAmount } from '@/utils/numbers';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type MealInput = MacroTotals & { name: string };

type MealFormProps = {
  title: string;
  submitLabel: string;
  initialMeal?: MealInput;
  showRecentFoods?: boolean;
  headerAction?: ReactNode;
  /** Resolves once saved. Return true to clear the form for the next entry. */
  onSubmit: (meal: MealInput) => Promise<boolean>;
};

const toText = (value?: number) => (value === undefined || value === 0 ? '' : String(value));

/** Calories implied by the macros: 4 kcal per gram of protein or carbs, 9 per gram of fat. */
export const caloriesFromMacros = (protein: number, carbs: number, fat: number) =>
  Math.round(protein * 4 + carbs * 4 + fat * 9);

export default function MealForm({
  title,
  submitLabel,
  initialMeal,
  showRecentFoods = false,
  headerAction,
  onSubmit,
}: MealFormProps) {
  const { t } = useTranslation();
  const themeStyles = useGlobalStyles();
  const { colors } = useTheme();
  const [name, setName] = useState(initialMeal?.name ?? '');
  const [calories, setCalories] = useState(
    initialMeal ? String(initialMeal.calories) : '',
  );
  const [protein, setProtein] = useState(toText(initialMeal?.protein));
  const [carbs, setCarbs] = useState(toText(initialMeal?.carbs));
  const [fat, setFat] = useState(toText(initialMeal?.fat));
  const [recentFoods, setRecentFoods] = useState<Meal[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (showRecentFoods) {
        getRecentFoods().then(setRecentFoods);
      }
    }, [showRecentFoods]),
  );

  // Macros are optional, but anything typed must be a valid amount.
  const optionalAmount = (value: string) => (value.trim() === '' ? 0 : parseAmount(value));
  const parsedProtein = optionalAmount(protein);
  const parsedCarbs = optionalAmount(carbs);
  const parsedFat = optionalAmount(fat);
  const estimatedCalories =
    parsedProtein !== null && parsedCarbs !== null && parsedFat !== null
      ? caloriesFromMacros(parsedProtein, parsedCarbs, parsedFat)
      : 0;
  const caloriesBlank = calories.trim() === '';

  const fillFromFood = (food: Meal) => {
    setName(food.name);
    setCalories(String(food.calories));
    setProtein(toText(food.protein));
    setCarbs(toText(food.carbs));
    setFat(toText(food.fat));
  };

  const handleSubmit = async () => {
    if (!name.trim() || (caloriesBlank && estimatedCalories === 0)) {
      Alert.alert(t('error'), t('enterMealError'));
      return;
    }

    const parsedCalories = caloriesBlank ? estimatedCalories : parseAmount(calories);
    if (parsedCalories === null || parsedProtein === null || parsedCarbs === null || parsedFat === null) {
      Alert.alert(t('error'), t('invalidNumber'));
      return;
    }

    const shouldReset = await onSubmit({
      name: name.trim(),
      calories: roundAmount(parsedCalories),
      protein: roundAmount(parsedProtein),
      carbs: roundAmount(parsedCarbs),
      fat: roundAmount(parsedFat),
    });

    if (shouldReset) {
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          paddingBottom: 40,
        },
        row: {
          flexDirection: 'row',
          gap: 10,
        },
        rowInput: {
          flex: 1,
        },
        hint: {
          color: colors.textSecondary,
          fontSize: 12,
          marginTop: 8,
          marginLeft: 4,
        },
        recentTitle: {
          color: colors.textSecondary,
          fontSize: 12,
          fontWeight: '600',
          marginTop: 20,
          marginLeft: 4,
        },
        chips: {
          gap: 8,
          paddingVertical: 8,
        },
        chip: {
          backgroundColor: colors.surface,
          borderRadius: 18,
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.textSecondary,
        },
        chipText: {
          color: colors.text,
          fontSize: 14,
        },
        chipMeta: {
          color: colors.textSecondary,
          fontSize: 12,
        },
        button: {
          padding: 16,
          borderRadius: 10,
          alignItems: 'center',
          marginTop: 24,
          backgroundColor: colors.primary,
        },
        buttonText: {
          fontSize: 16,
          fontWeight: 'bold',
          color: colors.background,
        },
      }),
    [colors],
  );

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={themeStyles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps='handled'
      >
        <View style={themeStyles.header}>
          <Text style={themeStyles.title}>{title}</Text>
          {headerAction}
        </View>

        {showRecentFoods && recentFoods.length > 0 && (
          <>
            <Text style={styles.recentTitle}>{t('recentFoods')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              keyboardShouldPersistTaps='handled'
            >
              {recentFoods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.chip}
                  onPress={() => fillFromFood(food)}
                  accessibilityRole='button'
                  accessibilityHint={t('recentFoodHint')}
                >
                  <Text style={styles.chipText}>{food.name}</Text>
                  <Text style={styles.chipMeta}>{food.calories} kcal</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <LabeledTextInput
          label={t('mealName')}
          placeholder={t('enterMealName')}
          value={name}
          onChangeText={setName}
        />

        <View style={styles.row}>
          <LabeledTextInput
            label={t('calories')}
            placeholder={caloriesBlank && estimatedCalories > 0 ? `≈ ${estimatedCalories}` : undefined}
            keyboardType='decimal-pad'
            value={calories}
            onChangeText={setCalories}
            containerStyle={styles.rowInput}
          />
          <LabeledTextInput
            label={t('proteinPlaceholder')}
            keyboardType='decimal-pad'
            value={protein}
            onChangeText={setProtein}
            containerStyle={styles.rowInput}
          />
        </View>
        <View style={styles.row}>
          <LabeledTextInput
            label={t('carbsPlaceholder')}
            keyboardType='decimal-pad'
            value={carbs}
            onChangeText={setCarbs}
            containerStyle={styles.rowInput}
          />
          <LabeledTextInput
            label={t('fatPlaceholder')}
            keyboardType='decimal-pad'
            value={fat}
            onChangeText={setFat}
            containerStyle={styles.rowInput}
          />
        </View>
        {caloriesBlank && estimatedCalories > 0 && (
          <Text style={styles.hint}>
            {t('caloriesFromMacrosHint').replace('{calories}', String(estimatedCalories))}
          </Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{submitLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
