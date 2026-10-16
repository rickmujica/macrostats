import LabeledTextInput from '@/components/LabeledTextInput';
import { useToast } from '@/components/Toast';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { track } from '@/services/analytics';
import { deleteWeight, getWeights, logWeight } from '@/storage/body';
import { sameDay } from '@/storage/meals';
import { getSettings, updateSettings } from '@/storage/settings';
import { useGlobalStyles } from '@/styles/global';
import { dateKey, fromDateKey } from '@/utils/dates';
import { parseAmount } from '@/utils/numbers';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/** Logs body weight for one day (today unless a `date` param is passed). */
export default function WeightScreen() {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const { t, locale } = useTranslation();
  const { colors } = useTheme();
  const themeStyles = useGlobalStyles();
  const { showToast } = useToast();
  const date = dateParam ? fromDateKey(dateParam) : new Date();
  const [weight, setWeight] = useState('');
  const [hasEntry, setHasEntry] = useState(false);

  useEffect(() => {
    const load = async () => {
      const entries = await getWeights();
      const existing = entries.find((entry) => entry.date === dateKey(date));
      if (existing) {
        setHasEntry(true);
        setWeight(String(existing.kg));
        return;
      }
      const latest = entries[entries.length - 1];
      setWeight(String(latest?.kg ?? (await getSettings()).profile.weight));
    };
    load();
    // The date only comes from the route, so load once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    const kg = parseAmount(weight);
    if (!kg || kg < 20 || kg > 400) {
      Alert.alert(t('error'), t('invalidWeight'));
      return;
    }
    const entries = await logWeight(date, kg);
    // Keep the profile's weight current, so recalculated goals use it.
    const latest = entries[entries.length - 1];
    if (latest.date === dateKey(date)) {
      const settings = await getSettings();
      await updateSettings({ profile: { ...settings.profile, weight: latest.kg } });
    }
    track('weight_logged');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(t('weightSaved'));
    router.back();
  };

  const remove = async () => {
    await deleteWeight(date);
    router.back();
  };

  const styles = StyleSheet.create({
    date: { color: colors.textSecondary, fontSize: 15, marginTop: 8 },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 28,
    },
    buttonText: { color: colors.background, fontSize: 16, fontWeight: 'bold' },
    remove: { alignItems: 'center', marginTop: 20 },
    removeText: { color: colors.alert, fontSize: 15 },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={themeStyles.container}>
        <View style={themeStyles.header}>
          <Text style={themeStyles.title}>{t('logWeight')}</Text>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.date}>
          {sameDay(date, new Date())
            ? t('today')
            : date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        <LabeledTextInput
          label={t('weight')}
          keyboardType='decimal-pad'
          value={weight}
          onChangeText={setWeight}
          autoFocus
          selectTextOnFocus
        />
        <TouchableOpacity style={styles.button} onPress={save}>
          <Text style={styles.buttonText}>{t('save')}</Text>
        </TouchableOpacity>
        {hasEntry && (
          <TouchableOpacity style={styles.remove} onPress={remove}>
            <Text style={styles.removeText}>{t('deleteWeight')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
