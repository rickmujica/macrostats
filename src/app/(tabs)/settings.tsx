import { useAds } from '@/ads/AdsProvider';
import LabeledTextInput from '@/components/LabeledTextInput';
import { PRIVACY_POLICY_URL } from '@/constants/links';
import TimePicker from '@/components/TimePicker';
import { useToast } from '@/components/Toast';
import { useTheme } from '@/hooks/useTheme';
import { setAppLocale, useTranslation } from '@/i18n';
import { usePro } from '@/pro/ProProvider';
import { setAnalyticsEnabled, track } from '@/services/analytics';
import { resetFavoritesCache } from '@/storage/favorites';
import { getMeals } from '@/storage/meals';
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
import { createBackup, InvalidBackupError, parseBackup, restoreBackup } from '@/utils/backup';
import { buildMealsCsv } from '@/utils/csv';
import { dateKey } from '@/utils/dates';
import { pickTextFile, shareTextFile } from '@/utils/files';
import { parseAmount, roundAmount } from '@/utils/numbers';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useMemo, useState } from 'react';
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
  const { isPro } = usePro();
  const { privacyOptionsRequired, showPrivacyOptions } = useAds();
  const { showToast } = useToast();

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
  const [waterGoal, setWaterGoal] = useState('');
  const [analytics, setAnalytics] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderSchedule, setReminderSchedule] = useState<ReminderScheduleItem[]>([]);
  const [locale, setLocale] = useState<'en' | 'es'>('en');
  const [theme, setTheme] = useState<AppTheme>('system');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Reload on focus so profile edits and recalculated goals show up.
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const settings = await getSettings();
        setCalories(settings.goals.calories.toString());
        setProtein(settings.goals.protein.toString());
        setCarbs(settings.goals.carbs.toString());
        setFat(settings.goals.fat.toString());
        setWaterGoal(settings.waterGoal.toString());
        setAnalytics(settings.analyticsEnabled);
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
        setProfile(settings.profile);
      };

      load();
    }, []),
  );

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

  const fillRecommendedGoals = () => {
    if (!profile) {
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
    const goals = {
      calories: parseAmount(calories),
      protein: parseAmount(protein),
      carbs: parseAmount(carbs),
      fat: parseAmount(fat),
    };

    const parsedWaterGoal = parseAmount(waterGoal);

    if (
      goals.calories === null ||
      goals.protein === null ||
      goals.carbs === null ||
      goals.fat === null ||
      parsedWaterGoal === null
    ) {
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
      waterGoal: Math.round(parsedWaterGoal),
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(t('success'), t('settingsSaved'));
  };

  const toggleAnalytics = async (value: boolean) => {
    setAnalytics(value);
    await updateSettings({ analyticsEnabled: value });
    await setAnalyticsEnabled(value);
  };

  const exportBackup = async () => {
    try {
      const backup = await createBackup();
      const shared = await shareTextFile(
        `macrozone-backup-${dateKey(new Date())}.json`,
        JSON.stringify(backup),
        { mimeType: 'application/json', uti: 'public.json', dialogTitle: t('exportBackup') },
      );
      if (!shared) {
        Alert.alert(t('error'), t('shareUnavailable'));
        return;
      }
      track('backup_exported');
    } catch {
      Alert.alert(t('error'), t('exportError'));
    }
  };

  const importBackup = async () => {
    let text: string | null;
    try {
      text = await pickTextFile();
    } catch {
      Alert.alert(t('error'), t('importError'));
      return;
    }
    if (text === null) {
      return;
    }

    let backup: ReturnType<typeof parseBackup>;
    try {
      backup = parseBackup(text);
    } catch (error) {
      Alert.alert(t('error'), error instanceof InvalidBackupError ? t('invalidBackup') : t('importError'));
      return;
    }

    const exportedOn = new Date(backup.exportedAt).toLocaleDateString();
    Alert.alert(t('importBackup'), t('importConfirm').replace('{date}', exportedOn), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('restore'),
        style: 'destructive',
        onPress: async () => {
          await restoreBackup(backup);
          resetFavoritesCache();
          const settings = await getSettings();
          setAppLocale(settings.locale);
          await setAppTheme(settings.theme);
          await cancelMealReminders();
          if (settings.remindersEnabled) {
            await scheduleMealReminders(settings.reminderSchedule);
          }
          track('backup_imported');
          showToast(t('backupRestored'));
          router.navigate('/');
        },
      },
    ]);
  };

  const exportCsv = async () => {
    if (!isPro) {
      router.push('/pro');
      return;
    }
    try {
      const meals = await getMeals();
      const shared = await shareTextFile(`macrozone-${dateKey(new Date())}.csv`, buildMealsCsv(meals), {
        mimeType: 'text/csv',
        uti: 'public.comma-separated-values-text',
        dialogTitle: t('exportCsv'),
      });
      if (!shared) {
        Alert.alert(t('error'), t('shareUnavailable'));
        return;
      }
      track('csv_exported', { meals: meals.length });
    } catch {
      Alert.alert(t('error'), t('exportError'));
    }
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
    profileRow: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    profileText: {
      flex: 1,
    },
    profileTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    profileSummary: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 4,
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
    linkRow: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    linkText: {
      color: colors.text,
      fontSize: 16,
    },
    proCard: {
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 20,
      backgroundColor: isPro ? colors.surface : colors.primary,
    },
    proTitle: {
      color: isPro ? colors.text : colors.background,
      fontSize: 16,
      fontWeight: '700',
    },
    proText: {
      color: isPro ? colors.textSecondary : colors.background,
      fontSize: 13,
      marginTop: 2,
    },
    dataButtons: {
      gap: 10,
    },
    proBadge: {
      color: '#1a1a2e',
      backgroundColor: '#ffd93d',
      fontSize: 11,
      fontWeight: '800',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      overflow: 'hidden',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 16,
    },
    disclaimerText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 16,
    },
  }), [colors, isPro]);

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.content}>
      <Text style={globalStyles.title}>{t('settingsTitle')}</Text>

      <TouchableOpacity style={styles.proCard} onPress={() => router.push('/pro')} accessibilityRole='button'>
        <Ionicons name='star' size={26} color='#ffd93d' />
        <View style={styles.profileText}>
          <Text style={styles.proTitle}>{isPro ? t('proActiveShort') : t('getPro')}</Text>
          <Text style={styles.proText}>{isPro ? t('proThanksShort') : t('getProHint')}</Text>
        </View>
        <Ionicons name='chevron-forward' size={20} color={isPro ? colors.textSecondary : colors.background} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{t('userProfile')}</Text>
      <TouchableOpacity
        style={styles.profileRow}
        onPress={() => router.push('/profile')}
        accessibilityRole='button'
        accessibilityHint={t('editProfileHint')}
      >
        <View style={styles.profileText}>
          <Text style={styles.profileTitle}>{t('yourProfile')}</Text>
          {profile && (
            <>
              <Text style={styles.profileSummary}>
                {[
                  t('ageYears').replace('{age}', String(profile.age)),
                  `${profile.height} cm`,
                  `${profile.weight} kg`,
                  profile.gender === 'male'
                    ? t('genderMale')
                    : profile.gender === 'female'
                      ? t('genderFemale')
                      : t('genderOther'),
                ].join(' · ')}
              </Text>
              <Text style={styles.profileSummary}>
                {`${t('activityLevel')}: ${
                  profile.activityLevel === 'low'
                    ? t('activityLow')
                    : profile.activityLevel === 'moderate'
                      ? t('activityModerate')
                      : t('activityHigh')
                } · ${t('goal')}: ${
                  profile.goal === 'maintain'
                    ? t('goalMaintain')
                    : profile.goal === 'lose'
                      ? t('goalLose')
                      : t('goalGain')
                }`}
              </Text>
            </>
          )}
        </View>
        <Ionicons name='chevron-forward' size={20} color={colors.textSecondary} />
      </TouchableOpacity>

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

      <LabeledTextInput
        label={t('waterGoal')}
        keyboardType='number-pad'
        value={waterGoal}
        onChangeText={setWaterGoal}
      />

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

      <Text style={styles.sectionTitle}>{t('yourData')}</Text>
      <View style={styles.dataButtons}>
        <TouchableOpacity style={styles.linkRow} onPress={exportBackup} accessibilityRole='button'>
          <Text style={styles.linkText}>{t('exportBackup')}</Text>
          <Ionicons name='share-outline' size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={importBackup} accessibilityRole='button'>
          <Text style={styles.linkText}>{t('importBackup')}</Text>
          <Ionicons name='download-outline' size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={exportCsv} accessibilityRole='button'>
          <Text style={styles.linkText}>{t('exportCsv')}</Text>
          {isPro ? (
            <Ionicons name='document-text-outline' size={18} color={colors.textSecondary} />
          ) : (
            <Text style={styles.proBadge}>PRO</Text>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.disclaimerText}>{t('backupNote')}</Text>

      <Text style={styles.sectionTitle}>{t('about')}</Text>
      <View style={styles.dataButtons}>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
          accessibilityRole='link'
        >
          <Text style={styles.linkText}>{t('privacyPolicy')}</Text>
          <Ionicons name='open-outline' size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        {privacyOptionsRequired && (
          <TouchableOpacity style={styles.linkRow} onPress={showPrivacyOptions} accessibilityRole='button'>
            <Text style={styles.linkText}>{t('adPrivacyOptions')}</Text>
            <Ionicons name='shield-checkmark-outline' size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.switchRow}>
        <View style={styles.profileText}>
          <Text style={styles.reminderLabel}>{t('shareUsageStats')}</Text>
          <Text style={styles.profileSummary}>{t('shareUsageStatsHint')}</Text>
        </View>
        <Switch
          value={analytics}
          onValueChange={toggleAnalytics}
          trackColor={{ false: colors.surface, true: colors.primary }}
        />
      </View>
      <Text style={styles.disclaimerText}>{t('healthDisclaimer')}</Text>
      <Text style={styles.disclaimerText}>
        {t('appVersion').replace('{version}', Constants.expoConfig?.version ?? '')}
      </Text>
    </ScrollView>
  );
}
