import LabeledTextInput from '@/components/LabeledTextInput';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { addMeal } from '@/storage/meals';
import { useGlobalStyles } from '@/styles/global';
import { parseAmount, roundAmount } from '@/utils/numbers';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
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

export default function AddMealScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleAddMeal = async () => {
    const parsedCalories = parseAmount(calories);
    if (!name.trim() || calories.trim() === '') {
      Alert.alert(t('error'), t('enterMealError'));
      return;
    }

    // Macros are optional, but anything typed must be a valid amount.
    const optionalAmount = (value: string) => (value.trim() === '' ? 0 : parseAmount(value));
    const parsedProtein = optionalAmount(protein);
    const parsedCarbs = optionalAmount(carbs);
    const parsedFat = optionalAmount(fat);

    if (parsedCalories === null || parsedProtein === null || parsedCarbs === null || parsedFat === null) {
      Alert.alert(t('error'), t('invalidNumber'));
      return;
    }

    await addMeal({
      name: name.trim(),
      calories: roundAmount(parsedCalories),
      protein: roundAmount(parsedProtein),
      carbs: roundAmount(parsedCarbs),
      fat: roundAmount(parsedFat),
    });

    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');

    Alert.alert(t('success'), t('mealAddedSuccess'));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/');
  };

  const themeStyles = useGlobalStyles();
  const { colors } = useTheme();
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
        button: {
          padding: 16,
          borderRadius: 10,
          alignItems: 'center',
          marginTop: 24,
        },
        buttonText: {
          fontSize: 16,
          fontWeight: 'bold',
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
        <Text style={themeStyles.title}>{t('addMeal')}</Text>

        <LabeledTextInput
          label={t('mealName')}
          placeholder={t('enterMealName')}
          value={name}
          onChangeText={setName}
        />

        <View style={styles.row}>
          <LabeledTextInput
            label={t('calories')}
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

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleAddMeal}>
          <Text style={[styles.buttonText, { color: colors.background }]}>{t('addMeal')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
