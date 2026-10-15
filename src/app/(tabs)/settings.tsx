import LabeledTextInput from '@/components/LabeledTextInput';
import TimePicker from '@/components/TimePicker';
import { useTheme } from '@/hooks/useTheme';
import { setAppLocale, useTranslation } from '@/i18n';
import {
  calculateGoals,
  getSettings,
  updateSettings,
  type AppTheme,
  type ReminderScheduleItem,
  type UserProfile,
} from '@/storage/settings';
import { useGlobalStyles } from '@/styles/global';
import {
  cancelMealReminders,
  hasReminderPermission,
  remindersSupported,
  requestPermissions,
  scheduleMealReminders,
} from '@/utils/notifications';
import { parseAmount, roundAmount } from '@/utils/numbers';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type OptionItem<T extends string> = {
  key: T;
  label: string;
};

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors, setAppTheme } = useTheme();
  const globalStyles = useGlobalStyles();

  const languageOptions: OptionItem<'en' | 'es'>[] = [
    { key: 'en', label: t('english') },
    { key: 'es', label: t('spanish') },
  ];

  const themeOptions: OptionItem<AppTheme>[] = [
    { key: 'system', label: t('system') },
    { key: 'light', label: t('light') },
    { key: 'dark', label: t('dark') },
  ];

  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderSchedule, setReminderSchedule] = useState<ReminderScheduleItem[]>([]);
  const [locale, setLocale] = useState<'en' | 'es'>('en');
  const [theme, setTheme] = useState<AppTheme>('system');
  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [gender, setGender] = useState<UserProfile['gender']>('male');
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>('moderate');
  const [goal, setGoal] = useState<UserProfile['goal']>('maintain');

  useEffect(() => {
    const load = async () => {
      const settings = await getSettings();
      setCalories(settings.goals.calories.toString());
      setProtein(settings.goals.protein.toString());
      setCarbs(settings.goals.carbs.toString());
      setFat(settings.goals.fat.toString());
      // If notification permission was revoked, show reminders as off.
      const remindersOn = settings.remindersEnabled && (await hasReminderPermission());
      setRemindersEnabled(remindersOn);
      if (remindersOn !== settings.remindersEnabled) {
        await updateSettings({ remindersEnabled: remindersOn });
      }
      setReminderSchedule(settings.reminderSchedule);
      setLocale(settings.locale);
      setAppLocale(settings.locale);
      setTheme(settings.theme);
      setAge(settings.profile.age.toString());
      setHeight(settings.profile.height.toString());
      setWeight(settings.profile.weight.toString());
      setGender(settings.profile.gender);
      setActivityLevel(settings.profile.activityLevel);
      setGoal(settings.profile.goal);
    };

    load();
  }, []);

  function selectOption<T extends string>(nextValue: T, setter: (value: T) => void) {
    setter(nextValue);
  }

  const reminderLabel = (item: ReminderScheduleItem) =>
    item.id === 'lunch'
      ? t('lunchReminderLabel')
      : item.id === 'dinner'
        ? t('dinnerReminderLabel')
        : item.label;

  // Tap-to-choose options (language, theme, reminders) apply right away.
  // Typed values (goals and profile) are kept when you tap Save Settings.
  const selectLanguage = async (nextLocale: 'en' | 'es') => {
    setLocale(nextLocale);
    setAppLocale(nextLocale);
    await updateSettings({ locale: nextLocale });
    if (remindersEnabled) {
      // Reschedule so reminder text matches the new language.
      await rescheduleOrTurnOff(reminderSchedule);
    }
  };

  const selectTheme = async (nextTheme: AppTheme) => {
    setTheme(nextTheme);
    await setAppTheme(nextTheme);
  };

  const turnRemindersOff = async () => {
    await cancelMealReminders();
    setRemindersEnabled(false);
    await updateSettings({ remindersEnabled: false });
  };

  const rescheduleOrTurnOff = async (schedule: ReminderScheduleItem[]) => {
    if (!(await scheduleMealReminders(schedule))) {
      await turnRemindersOff();
      Alert.alert(t('remindersLabel'), t('remindersScheduleError'));
    }
  };

  const toggleReminders = async (value: boolean) => {
    if (!value) {
      await turnRemindersOff();
      return;
    }

    if (!remindersSupported) {
      Alert.alert(t('remindersLabel'), t('remindersUnsupported'));
      return;
    }

    const permission = await requestPermissions();
    if (permission === 'blocked') {
      Alert.alert(t('remindersLabel'), t('remindersBlocked'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('openSettings'), onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    if (permission === 'denied') {
      Alert.alert(t('error'), t('reminderEnabledError'));
      return;
    }

    if (!(await scheduleMealReminders(reminderSchedule))) {
      Alert.alert(t('remindersLabel'), t('remindersScheduleError'));
      return;
    }

    setRemindersEnabled(true);
    await updateSettings({ remindersEnabled: true });
  };

  const changeReminderTime = async (id: string, nextDate: Date) => {
    const nextSchedule = reminderSchedule.map((item) =>
      item.id === id
        ? { ...item, hour: nextDate.getHours(), minute: nextDate.getMinutes() }
        : item,
    );

    setReminderSchedule(nextSchedule);
    await updateSettings({ reminderSchedule: nextSchedule });
    if (remindersEnabled) {
      await rescheduleOrTurnOff(nextSchedule);
    }
  };

  const readProfile = (): UserProfile | null => {
    const parsedAge = parseAmount(age);
    const parsedHeight = parseAmount(height);
    const parsedWeight = parseAmount(weight);

    if (!parsedAge || !parsedHeight || !parsedWeight) {
      return null;
    }

    return {
      age: parsedAge,
      height: parsedHeight,
      weight: parsedWeight,
      gender,
      activityLevel,
      goal,
    };
  };

  const fillRecommendedGoals = () => {
    const profile = readProfile();
    if (!profile) {
      Alert.alert(t('error'), t('invalidProfile'));
      return;
    }

    const recommended = calculateGoals(profile);
    setCalories(recommended.calories.toString());
    setProtein(recommended.protein.toString());
    setCarbs(recommended.carbs.toString());
    setFat(recommended.fat.toString());
    Haptics.selectionAsync();
    Alert.alert(t('macroGoals'), t('goalsCalculated'));
  };

  const saveSettings = async () => {
    const profile = readProfile();
    if (!profile) {
      Alert.alert(t('error'), t('invalidProfile'));
      return;
    }

    const goals = {
      calories: parseAmount(calories),
      protein: parseAmount(protein),
      carbs: parseAmount(carbs),
      fat: parseAmount(fat),
    };

    if (goals.calories === null || goals.protein === null || goals.carbs === null || goals.fat === null) {
      Alert.alert(t('error'), t('invalidNumber'));
      return;
    }

    await updateSettings({
      goals: {
        calories: roundAmount(goals.calories),
        protein: roundAmount(goals.protein),
        carbs: roundAmount(goals.carbs),
        fat: roundAmount(goals.fat),
      },
      profile,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(t('success'), t('settingsSaved'));
  };

  const styles = useMemo(() => StyleSheet.create({
    content: {
      paddingBottom: 60,
    },
    row: {
      flexDirection: 'row',
      gap: 10,
    },
    rowInput: {
      flex: 1,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 24,
    },
    buttonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: 'bold',
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      padding: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 30,
      marginBottom: 16,
    },
    subTitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
      marginTop: 16,
    },
    optionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    option: {
      borderWidth: 1,
      borderColor: colors.surface,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
    },
    optionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      color: colors.text,
    },
    selectedOptionText: {
      color: colors.background,
      fontWeight: '700',
    },
    noteText: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 10,
      marginBottom: 20,
    },
    reminderContainer: {
      marginTop: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reminderLabel: {
      color: colors.text,
      fontSize: 16,
    },
    timePickerWrapper: {
      marginBottom: 16,
    },
  }), [colors]);

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.content}>
      <Text style={globalStyles.title}>{t('settingsTitle')}</Text>

      <Text style={styles.sectionTitle}>{t('macroGoals')}</Text>
      <View style={styles.row}>
        <LabeledTextInput
          label={t('calories')}
          placeholder={t('enterCalories')}
          keyboardType='decimal-pad'
          value={calories}
          onChangeText={setCalories}
          containerStyle={styles.rowInput}
        />
        <LabeledTextInput
          label={t('proteinPlaceholder')}
          placeholder={t('enterProtein')}
          keyboardType='decimal-pad'
          value={protein}
          onChangeText={setProtein}
          containerStyle={styles.rowInput}
        />
      </View>
      <View style={styles.row}>
        <LabeledTextInput
          label={t('carbsPlaceholder')}
          placeholder={t('enterCarbs')}
          keyboardType='decimal-pad'
          value={carbs}
          onChangeText={setCarbs}
          containerStyle={styles.rowInput}
        />
        <LabeledTextInput
          label={t('fatPlaceholder')}
          placeholder={t('enterFat')}
          keyboardType='decimal-pad'
          value={fat}
          onChangeText={setFat}
          containerStyle={styles.rowInput}
        />
      </View>

      <Text style={styles.sectionTitle}>{t('userProfile')}</Text>
      <View style={styles.row}>
        <LabeledTextInput
          label={t('age')}
          placeholder={t('age')}
          keyboardType='decimal-pad'
          value={age}
          onChangeText={setAge}
          containerStyle={styles.rowInput}
        />
        <LabeledTextInput
          label={t('height')}
          placeholder={t('height')}
          keyboardType='decimal-pad'
          value={height}
          onChangeText={setHeight}
          containerStyle={styles.rowInput}
        />
      </View>
      <LabeledTextInput
        label={t('weight')}
        placeholder={t('weight')}
        keyboardType='decimal-pad'
        value={weight}
        onChangeText={setWeight}
      />

      <Text style={styles.subTitle}>{t('gender')}</Text>
      <View style={styles.optionRow}>
        {(['male', 'female', 'other'] as UserProfile['gender'][]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.option, gender === option && styles.optionSelected]}
            onPress={() => selectOption(option, setGender)}
          >
            <Text style={gender === option ? styles.selectedOptionText : styles.optionText}>
              {option === 'male' ? t('genderMale') : option === 'female' ? t('genderFemale') : t('genderOther')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subTitle}>{t('activityLevel')}</Text>
      <View style={styles.optionRow}>
        {(['low', 'moderate', 'high'] as UserProfile['activityLevel'][]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.option, activityLevel === option && styles.optionSelected]}
            onPress={() => selectOption(option, setActivityLevel)}
          >
            <Text style={activityLevel === option ? styles.selectedOptionText : styles.optionText}>
              {option === 'low' ? t('activityLow') : option === 'moderate' ? t('activityModerate') : t('activityHigh')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subTitle}>{t('goal')}</Text>
      <View style={styles.optionRow}>
        {(['maintain', 'lose', 'gain'] as UserProfile['goal'][]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.option, goal === option && styles.optionSelected]}
            onPress={() => selectOption(option, setGoal)}
          >
            <Text style={goal === option ? styles.selectedOptionText : styles.optionText}>
              {option === 'maintain' ? t('goalMaintain') : option === 'lose' ? t('goalLose') : t('goalGain')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={fillRecommendedGoals}>
        <Text style={styles.secondaryButtonText}>{t('recommendedGoals')}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{t('language')}</Text>
      <View style={styles.optionRow}>
        {languageOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.option, locale === option.key && styles.optionSelected]}
            onPress={() => selectLanguage(option.key)}
          >
            <Text style={locale === option.key ? styles.selectedOptionText : styles.optionText}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t('theme')}</Text>
      <View style={styles.optionRow}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.option, theme === option.key && styles.optionSelected]}
            onPress={() => selectTheme(option.key)}
          >
            <Text style={theme === option.key ? styles.selectedOptionText : styles.optionText}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.noteText}>{t('themeNote')}</Text>

      <View style={styles.reminderContainer}>
        <Text style={styles.reminderLabel}>{t('remindersLabel')}</Text>
        <Switch
          value={remindersEnabled}
          onValueChange={toggleReminders}
          trackColor={{ false: colors.surface, true: colors.primary }}
          thumbColor={remindersEnabled ? colors.background : colors.text}
        />
      </View>

      {remindersEnabled && (
        <View>
          <Text style={styles.noteText}>{t('selectReminderTime')}</Text>
          {reminderSchedule.map((item) => {
            const value = new Date();
            value.setHours(item.hour, item.minute, 0, 0);

            return (
              <View key={item.id} style={styles.timePickerWrapper}>
                <TimePicker
                  labelStyle={styles.reminderLabel}
                  valueStyle={styles.noteText}
                  label={reminderLabel(item)}
                  value={value}
                  onChange={(nextDate) => changeReminderTime(item.id, nextDate)}
                />
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={saveSettings}>
        <Text style={styles.buttonText}>{t('saveSettings')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
