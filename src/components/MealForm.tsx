import LabeledTextInput from '@/components/LabeledTextInput';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { removeFavorite, useFavorites, type FavoriteFood } from '@/storage/favorites';
import { getRecentFoods, type Meal, type MacroTotals } from '@/storage/meals';
import { useGlobalStyles } from '@/styles/global';
import { formatInputNumber, formatNumber, parseAmount, roundAmount } from '@/utils/numbers';
import { macrosForGrams, type Portion } from '@/utils/portions';
import { Ionicons } from '@expo/vector-icons';
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

export type MealInput = MacroTotals & { name: string; portion?: Portion };

type MealFormProps = {
  title: string;
  submitLabel: string;
  initialMeal?: MealInput;
  /** Shows favorites and recently logged foods to fill the form from. */
  showRecentFoods?: boolean;
  headerAction?: ReactNode;
  /** Shows a "Scan barcode" button. */
  onScanPress?: () => void;
  /** Resolves once saved. Return true to clear the form for the next entry. */
  onSubmit: (meal: MealInput) => Promise<boolean>;
};

type EntryMode = 'total' | 'per100';
type AmountUnit = 'g' | 'serving';

const toText = (value: number | undefined, locale: string) =>
  value === undefined || value === 0 ? '' : formatInputNumber(value, locale);

/** Calories implied by the macros: 4 kcal per gram of protein or carbs, 9 per gram of fat. */
export const caloriesFromMacros = (protein: number, carbs: number, fat: number) =>
  Math.round(protein * 4 + carbs * 4 + fat * 9);

export default function MealForm({
  title,
  submitLabel,
  initialMeal,
  showRecentFoods = false,
  headerAction,
  onScanPress,
  onSubmit,
}: MealFormProps) {
  const { t, locale } = useTranslation();
  const themeStyles = useGlobalStyles();
  const { colors } = useTheme();
  const { favorites } = useFavorites();
  // In per-100 g mode the macro fields hold values per 100 g, from a nutrition label.
  const initialPortion = initialMeal?.portion;
  const initialMacros = initialPortion ? initialPortion.per100g : initialMeal;
  const [name, setName] = useState(initialMeal?.name ?? '');
  const [mode, setMode] = useState<EntryMode>(initialPortion ? 'per100' : 'total');
  const [calories, setCalories] = useState(
    initialMacros ? formatInputNumber(initialMacros.calories, locale) : '',
  );
  const [protein, setProtein] = useState(toText(initialMacros?.protein, locale));
  const [carbs, setCarbs] = useState(toText(initialMacros?.carbs, locale));
  const [fat, setFat] = useState(toText(initialMacros?.fat, locale));
  const [unit, setUnit] = useState<AmountUnit>(initialPortion?.servings ? 'serving' : 'g');
  const [amount, setAmount] = useState(
    initialPortion ? formatInputNumber(initialPortion.servings ?? initialPortion.grams, locale) : '100',
  );
  const [servingSize, setServingSize] = useState(toText(initialPortion?.servingGrams, locale));
  const [barcode, setBarcode] = useState(initialPortion?.barcode);
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
  const perServing = parseAmount(servingSize);
  const parsedAmount = parseAmount(amount);
  // Total grams eaten, in per-100 g mode.
  const grams =
    parsedAmount === null
      ? null
      : unit === 'g'
        ? parsedAmount
        : perServing
          ? roundAmount(parsedAmount * perServing)
          : null;

  const fillFromFood = useCallback((food: MealInput) => {
    const portion = food.portion;
    const macros = portion ? portion.per100g : food;
    setName(food.name);
    setMode(portion ? 'per100' : 'total');
    setCalories(formatInputNumber(macros.calories, locale));
    setProtein(toText(macros.protein, locale));
    setCarbs(toText(macros.carbs, locale));
    setFat(toText(macros.fat, locale));
    setServingSize(toText(portion?.servingGrams, locale));
    setBarcode(portion?.barcode);
    if (portion?.servings) {
      setUnit('serving');
      setAmount(formatInputNumber(portion.servings, locale));
    } else {
      setUnit('g');
      setAmount(formatInputNumber(portion?.grams ?? 100, locale));
    }
  }, [locale]);

  const confirmRemoveFavorite = (favorite: FavoriteFood) => {
    Alert.alert(t('removeFavoriteTitle'), favorite.name, [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => removeFavorite(favorite.id) },
    ]);
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

    const entered: MacroTotals = {
      calories: roundAmount(parsedCalories),
      protein: roundAmount(parsedProtein),
      carbs: roundAmount(parsedCarbs),
      fat: roundAmount(parsedFat),
    };

    let meal: MealInput;
    if (mode === 'per100') {
      if (grams === null || grams <= 0) {
        Alert.alert(t('error'), unit === 'serving' && !perServing ? t('servingSizeError') : t('amountError'));
        return;
      }
      meal = {
        name: name.trim(),
        ...macrosForGrams(entered, grams),
        portion: {
          per100g: entered,
          grams,
          ...(perServing ? { servingGrams: perServing } : {}),
          ...(unit === 'serving' && parsedAmount !== null ? { servings: parsedAmount } : {}),
          ...(barcode ? { barcode } : {}),
        },
      };
    } else {
      meal = { name: name.trim(), ...entered };
    }

    const shouldReset = await onSubmit(meal);

    if (shouldReset) {
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setMode('total');
      setUnit('g');
      setAmount('100');
      setServingSize('');
      setBarcode(undefined);
    }
  };

  const preview =
    mode === 'per100' && grams !== null && grams > 0 && parsedProtein !== null && parsedCarbs !== null && parsedFat !== null
      ? macrosForGrams(
          {
            calories: caloriesBlank ? estimatedCalories : (parseAmount(calories) ?? 0),
            protein: parsedProtein,
            carbs: parsedCarbs,
            fat: parsedFat,
          },
          grams,
        )
      : null;

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
        segment: {
          flexDirection: 'row',
          backgroundColor: colors.surface,
          borderRadius: 10,
          padding: 3,
          marginTop: 20,
        },
        segmentOption: {
          flex: 1,
          paddingVertical: 9,
          borderRadius: 8,
          alignItems: 'center',
        },
        segmentSelected: {
          backgroundColor: colors.primary,
        },
        segmentText: {
          color: colors.text,
          fontSize: 14,
        },
        segmentTextSelected: {
          color: colors.background,
          fontWeight: '700',
        },
        unitRow: {
          flexDirection: 'row',
          gap: 8,
          marginTop: 38,
        },
        unitOption: {
          // The row stretches these to the height of the amount field; keep the label centered.
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 10,
          backgroundColor: colors.surface,
        },
        preview: {
          color: colors.text,
          fontSize: 14,
          fontWeight: '600',
          marginTop: 14,
          marginLeft: 4,
        },
        scanButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderWidth: 1,
          borderColor: colors.primary,
          borderRadius: 10,
          paddingVertical: 12,
          marginTop: 20,
        },
        scanText: {
          color: colors.primary,
          fontSize: 15,
          fontWeight: '600',
        },
        favoriteChip: {
          borderColor: '#ffd93d',
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

        {onScanPress && (
          <TouchableOpacity style={styles.scanButton} onPress={onScanPress} accessibilityRole='button'>
            <Ionicons name='barcode-outline' size={20} color={colors.primary} />
            <Text style={styles.scanText}>{t('scanBarcode')}</Text>
          </TouchableOpacity>
        )}

        {showRecentFoods && favorites.length > 0 && (
          <>
            <Text style={styles.recentTitle}>{t('favorites')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              keyboardShouldPersistTaps='handled'
            >
              {favorites.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={[styles.chip, styles.favoriteChip]}
                  onPress={() => fillFromFood(food)}
                  onLongPress={() => confirmRemoveFavorite(food)}
                  accessibilityRole='button'
                  accessibilityHint={t('favoriteChipHint')}
                >
                  <Text style={styles.chipText}>{food.name}</Text>
                  <Text style={styles.chipMeta}>{formatNumber(food.calories, locale)} kcal</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

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
                  <Text style={styles.chipMeta}>{formatNumber(food.calories, locale)} kcal</Text>
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

        <View style={styles.segment} accessibilityRole='tablist'>
          {(['total', 'per100'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.segmentOption, mode === option && styles.segmentSelected]}
              onPress={() => setMode(option)}
              accessibilityRole='tab'
              accessibilityState={{ selected: mode === option }}
            >
              <Text style={mode === option ? styles.segmentTextSelected : styles.segmentText}>
                {option === 'total' ? t('modeTotal') : t('modePer100g')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <LabeledTextInput
            label={mode === 'per100' ? `${t('calories')} / 100 g` : t('calories')}
            placeholder={caloriesBlank && estimatedCalories > 0 ? `≈ ${formatNumber(estimatedCalories, locale)}` : undefined}
            keyboardType='decimal-pad'
            value={calories}
            onChangeText={setCalories}
            containerStyle={styles.rowInput}
          />
          <LabeledTextInput
            label={mode === 'per100' ? `${t('proteinPlaceholder')} / 100 g` : t('proteinPlaceholder')}
            keyboardType='decimal-pad'
            value={protein}
            onChangeText={setProtein}
            containerStyle={styles.rowInput}
          />
        </View>
        <View style={styles.row}>
          <LabeledTextInput
            label={mode === 'per100' ? `${t('carbsPlaceholder')} / 100 g` : t('carbsPlaceholder')}
            keyboardType='decimal-pad'
            value={carbs}
            onChangeText={setCarbs}
            containerStyle={styles.rowInput}
          />
          <LabeledTextInput
            label={mode === 'per100' ? `${t('fatPlaceholder')} / 100 g` : t('fatPlaceholder')}
            keyboardType='decimal-pad'
            value={fat}
            onChangeText={setFat}
            containerStyle={styles.rowInput}
          />
        </View>
        {caloriesBlank && estimatedCalories > 0 && (
          <Text style={styles.hint}>
            {t('caloriesFromMacrosHint').replace('{calories}', formatNumber(estimatedCalories, locale))}
          </Text>
        )}

        {mode === 'per100' && (
          <>
            <View style={styles.row}>
              <LabeledTextInput
                label={unit === 'g' ? t('amountGrams') : t('amountServings')}
                keyboardType='decimal-pad'
                value={amount}
                onChangeText={setAmount}
                containerStyle={styles.rowInput}
              />
              <View style={styles.unitRow}>
                {(['g', 'serving'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.unitOption, unit === option && styles.segmentSelected]}
                    onPress={() => setUnit(option)}
                    accessibilityRole='button'
                    accessibilityState={{ selected: unit === option }}
                  >
                    <Text style={unit === option ? styles.segmentTextSelected : styles.segmentText}>
                      {option === 'g' ? 'g' : t('servingsUnit')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {unit === 'serving' && (
              <LabeledTextInput
                label={t('servingSize')}
                keyboardType='decimal-pad'
                value={servingSize}
                onChangeText={setServingSize}
              />
            )}
            {preview && grams !== null && (
              <Text style={styles.preview}>
                {t('portionTotal')
                  .replace('{grams}', formatNumber(grams, locale))
                  .replace('{calories}', formatNumber(preview.calories, locale))
                  .replace('{protein}', formatNumber(preview.protein, locale))
                  .replace('{carbs}', formatNumber(preview.carbs, locale))
                  .replace('{fat}', formatNumber(preview.fat, locale))}
              </Text>
            )}
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{submitLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
