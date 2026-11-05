import { setAppLocale, t } from "@/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type MacroGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type ReminderScheduleItem = {
  id: string;
  label: string;
  hour: number;
  minute: number;
  body: string;
};

export type UserProfile = {
  age: number;
  height: number;
  weight: number;
  gender: "male" | "female" | "other";
  activityLevel: "low" | "moderate" | "high";
  goal: "maintain" | "lose" | "gain";
};

export type AppTheme = "system" | "light" | "dark";

export type AppSettings = {
  goals: MacroGoals;
  remindersEnabled: boolean;
  reminderSchedule: ReminderScheduleItem[];
  locale: "en" | "es";
  theme: AppTheme;
  profile: UserProfile;
  onboardingComplete: boolean;
  /** Daily water goal in ml. */
  waterGoal: number;
  /** Whether anonymous usage analytics may be sent. */
  analyticsEnabled: boolean;
};

export const APP_SETTINGS_KEY = "appSettings";

const DEFAULT_WATER_GOAL = 2000;

const defaultGoals: MacroGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

const defaultReminderSchedule = (): ReminderScheduleItem[] => [
  {
    id: "lunch",
    label: t("lunchReminderLabel"),
    hour: 12,
    minute: 0,
    body: t("lunchReminderBody"),
  },
  {
    id: "dinner",
    label: t("dinnerReminderLabel"),
    hour: 18,
    minute: 0,
    body: t("dinnerReminderBody"),
  },
];

const getDefaultProfile = (): UserProfile => ({
  age: 25,
  height: 170,
  weight: 70,
  gender: "male",
  activityLevel: "moderate",
  goal: "maintain",
});

const getDeviceLocale = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || "en-US";
  } catch {
    return "en-US";
  }
};

export const getDefaultSettings = (): AppSettings => {
  const defaultLocale = getDeviceLocale().startsWith("es") ? "es" : "en";
  setAppLocale(defaultLocale);

  return {
    goals: defaultGoals,
    remindersEnabled: false,
    reminderSchedule: defaultReminderSchedule(),
    locale: defaultLocale,
    theme: "system",
    profile: getDefaultProfile(),
    onboardingComplete: false,
    waterGoal: DEFAULT_WATER_GOAL,
    analyticsEnabled: true,
  };
};

export const getSettings = async (): Promise<AppSettings> => {
  const stored = await AsyncStorage.getItem(APP_SETTINGS_KEY);
  if (!stored) {
    return getDefaultSettings();
  }

  try {
    const defaults = getDefaultSettings();
    const parsed = JSON.parse(stored) as Partial<AppSettings>;
    const nextLocale = parsed.locale ?? defaults.locale;
    setAppLocale(nextLocale);

    return {
      ...defaults,
      ...parsed,
      goals: parsed.goals ?? defaultGoals,
      reminderSchedule: parsed.reminderSchedule ?? defaultReminderSchedule(),
      locale: nextLocale,
      theme: parsed.theme ?? defaults.theme,
      remindersEnabled: parsed.remindersEnabled ?? false,
      profile: parsed.profile ?? getDefaultProfile(),
      // People who saved settings before onboarding existed have already set up the app.
      onboardingComplete: parsed.onboardingComplete ?? true,
      waterGoal: parsed.waterGoal ?? DEFAULT_WATER_GOAL,
      analyticsEnabled: parsed.analyticsEnabled ?? true,
    };
  } catch {
    return getDefaultSettings();
  }
};

export const saveSettings = async (settings: AppSettings) => {
  await AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
};

export const updateSettings = async (
  next: Partial<AppSettings>,
): Promise<AppSettings> => {
  const current = await getSettings();
  const nextLocale = next.locale ?? current.locale;
  setAppLocale(nextLocale);

  const merged: AppSettings = {
    ...current,
    ...next,
    goals: next.goals ?? current.goals,
    reminderSchedule: next.reminderSchedule ?? current.reminderSchedule,
    locale: nextLocale,
    theme: next.theme ?? current.theme,
    remindersEnabled: next.remindersEnabled ?? current.remindersEnabled,
    profile: next.profile ?? current.profile,
    onboardingComplete: next.onboardingComplete ?? current.onboardingComplete,
    waterGoal: next.waterGoal ?? current.waterGoal,
    analyticsEnabled: next.analyticsEnabled ?? current.analyticsEnabled,
  };
  await saveSettings(merged);
  return merged;
};

export const calculateGoals = (profile: UserProfile): MacroGoals => {
  const weight = Math.max(profile.weight, 40);
  const height = Math.max(profile.height, 140);
  const age = Math.max(profile.age, 18);

  const baseBmr =
    profile.gender === "female"
      ? 10 * weight + 6.25 * height - 5 * age - 161
      : 10 * weight + 6.25 * height - 5 * age + 5;

  const activityFactor =
    profile.activityLevel === "low"
      ? 1.2
      : profile.activityLevel === "moderate"
        ? 1.45
        : 1.7;

  let calories = Math.round(baseBmr * activityFactor);

  if (profile.goal === "lose") {
    calories = Math.max(1200, calories - 350);
  } else if (profile.goal === "gain") {
    calories += 350;
  }

  const protein = Math.round(weight * 1.8);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return {
    calories,
    protein,
    carbs,
    fat,
  };
};
