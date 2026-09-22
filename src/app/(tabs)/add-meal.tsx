import LabeledTextInput from '@/components/LabeledTextInput';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { addMeal } from '@/storage/meals';
import { useGlobalStyles } from '@/styles/global';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AddMealScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleAddMeal = async () => {
    if (!name || !calories) {
      Alert.alert(t('error'), t('enterMealError'));
      return;
    }

    await addMeal({
      name,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
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
        row: {
          flexDirection: 'row',
          gap: 10,
        },
        rowInput: {
          width: '49%',
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
    <View style={themeStyles.container}>
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
          // placeholder={t('enterCalories')}
          keyboardType='numeric'
          value={calories}
          onChangeText={setCalories}
          containerStyle={styles.rowInput}
        />
        <LabeledTextInput
          label={t('proteinPlaceholder')}
          // placeholder={t('enterProtein')}
          keyboardType='numeric'
          value={protein}
          onChangeText={setProtein}
          containerStyle={styles.rowInput}
        />
      </View>
      <View style={styles.row}>
        <LabeledTextInput
          label={t('carbsPlaceholder')}
          // placeholder={t('enterCarbs')}
          keyboardType='numeric'
          value={carbs}
          onChangeText={setCarbs}
          containerStyle={styles.rowInput}
        />
        <LabeledTextInput
          label={t('fatPlaceholder')}
          // placeholder={t('enterFat')}
          keyboardType='numeric'
          value={fat}
          onChangeText={setFat}
          containerStyle={styles.rowInput}
        />
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleAddMeal}>
        <Text style={[styles.buttonText, { color: colors.background }]}>{t('addMeal')}</Text>
      </TouchableOpacity>
    </View>
  );
}
