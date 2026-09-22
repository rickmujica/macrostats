import { useSyncExternalStore } from "react";
import { NativeModules } from "react-native";

const getDeviceLocale = (): string => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale) {
      return locale;
    }
  } catch {
    // ignore
  }

  const settingsModule =
    NativeModules.SettingsManager || NativeModules.I18nManager;
  const deviceLocale =
    settingsModule?.settings?.AppleLocale ||
    settingsModule?.settings?.AppleLanguages?.[0] ||
    settingsModule?.localeIdentifier ||
    settingsModule?.systemLocale ||
    "en-US";

  return String(deviceLocale).replace("_", "-");
};

const locales = ["en", "es"] as const;
type Locale = (typeof locales)[number];

const normalizeLocale = (value?: string): Locale => {
  return value?.startsWith("es") ? "es" : "en";
};

let locale: Locale = normalizeLocale(getDeviceLocale());
const localeListeners = new Set<() => void>();

type TranslationMap = {
  appName: string;
  home: string;
  homeTitle: string;
  recentMeals: string;
  noMeals: string;
  addMeal: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  mealName: string;
  caloriesPlaceholder: string;
  proteinPlaceholder: string;
  carbsPlaceholder: string;
  fatPlaceholder: string;
  enterMealName: string;
  enterCalories: string;
  enterProtein: string;
  enterCarbs: string;
  enterFat: string;
  enterMealError: string;
  mealAddedSuccess: string;
  deleteMealTitle: string;
  deleteMealMessage: string;
  cancel: string;
  confirm: string;
  delete: string;
  error: string;
  success: string;
  copied: string;
  copiedClipboard: string;
  copySummary: string;
  remindersLabel: string;
  saveTimes: string;
  reminderEnabledError: string;
  scheduleSaved: string;
  allMeals: string;
  clearAll: string;
  dailyView: string;
  weeklyView: string;
  selectDate: string;
  onboardingTitle: string;
  age: string;
  height: string;
  weight: string;
  gender: string;
  activityLevel: string;
  goal: string;
  saveProfile: string;
  genderMale: string;
  genderFemale: string;
  genderOther: string;
  activityLow: string;
  activityModerate: string;
  activityHigh: string;
  goalMaintain: string;
  goalLose: string;
  goalGain: string;
  invalidProfile: string;
  today: string;
  thisWeek: string;
  settingsTitle: string;
  macroGoals: string;
  userProfile: string;
  language: string;
  theme: string;
  system: string;
  light: string;
  dark: string;
  themeNote: string;
  saveSettings: string;
  selectReminderTime: string;
  english: string;
  spanish: string;
  dailySummary: string;
  mealsLabel: string;
  loggedToday: string;
  selectedTime: string;
  pickTime: string;
  lunchReminderLabel: string;
  dinnerReminderLabel: string;
  lunchReminderBody: string;
  dinnerReminderBody: string;
  settingsSaved: string;
  themeUpdated: string;
  pickADate: string;
};

type TranslationKey = keyof TranslationMap;

const translations: Record<Locale, TranslationMap> = {
  en: {
    appName: "MacroZone",
    home: "Home",
    homeTitle: "MacroZone",
    recentMeals: "Recent Meals",
    noMeals: "No meals logged yet.",
    addMeal: "Add Meal",
    calories: "Calories",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    mealName: "Meal name",
    caloriesPlaceholder: "Calories",
    proteinPlaceholder: "Protein (g)",
    carbsPlaceholder: "Carbs (g)",
    fatPlaceholder: "Fat (g)",
    enterMealName: "Enter meal name",
    enterCalories: "Enter calories",
    enterProtein: "Enter protein",
    enterCarbs: "Enter carbs",
    enterFat: "Enter fat",
    enterMealError: "Please enter a meal name and calories.",
    mealAddedSuccess: "Meal added successfully!",
    deleteMealTitle: "Delete Meal",
    deleteMealMessage: "Are you sure you want to delete",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    error: "Error",
    success: "Success",
    copied: "Copied!",
    copiedClipboard: "Macro summary copied to clipboard.",
    copySummary: "Copy Summary",
    remindersLabel: "Meal Reminders",
    saveTimes: "Save times",
    reminderEnabledError: "Permission required to enable reminders.",
    scheduleSaved: "Schedule saved.",
    allMeals: "All Meals",
    clearAll: "Clear All",
    dailyView: "Daily",
    weeklyView: "Weekly",
    selectDate: "Select a date",
    onboardingTitle: "Tell us about you",
    age: "Age",
    height: "Height (cm)",
    weight: "Weight (kg)",
    gender: "Gender",
    activityLevel: "Activity",
    goal: "Goal",
    saveProfile: "Save profile",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    activityLow: "Low",
    activityModerate: "Moderate",
    activityHigh: "High",
    goalMaintain: "Maintain",
    goalLose: "Lose",
    goalGain: "Gain",
    invalidProfile: "Please complete all fields correctly.",
    today: "Today",
    thisWeek: "This week",
    settingsTitle: "Settings",
    macroGoals: "Macro Goals",
    userProfile: "User Profile",
    language: "Language",
    theme: "Theme",
    system: "System",
    light: "Light",
    dark: "Dark",
    themeNote:
      "System uses the device appearance to choose light or dark mode.",
    saveSettings: "Save Settings",
    selectReminderTime: "Select the time for reminders for each meal.",
    english: "English",
    spanish: "Español",
    dailySummary: "Daily Summary",
    mealsLabel: "Meals",
    loggedToday: "logged today",
    selectedTime: "Selected time:",
    pickTime: "Pick a time",
    lunchReminderLabel: "Lunch",
    dinnerReminderLabel: "Dinner",
    lunchReminderBody: "Don't forget to log your lunch!",
    dinnerReminderBody: "Time to log your dinner!",
    settingsSaved: "Settings saved successfully!",
    themeUpdated: "Theme updated successfully.",
    pickADate: "Pick a date",
  },
  es: {
    appName: "MacroZone",
    home: "Inicio",
    homeTitle: "MacroZone",
    recentMeals: "Comidas recientes",
    noMeals: "Aún no hay comidas registradas.",
    addMeal: "Agregar comida",
    calories: "Calorías",
    protein: "Proteínas",
    carbs: "Carbohidratos",
    fat: "Grasas",
    mealName: "Nombre de la comida",
    caloriesPlaceholder: "Calorías",
    proteinPlaceholder: "Proteínas (g)",
    carbsPlaceholder: "Carbohidratos (g)",
    fatPlaceholder: "Grasas (g)",
    enterMealName: "Ingresa el nombre de la comida",
    enterCalories: "Ingresa calorías",
    enterProtein: "Ingresa proteínas",
    enterCarbs: "Ingresa carbohidratos",
    enterFat: "Ingresa grasas",
    enterMealError: "Por favor ingresa un nombre y calorías.",
    mealAddedSuccess: "¡Comida agregada con éxito!",
    deleteMealTitle: "Eliminar comida",
    deleteMealMessage: "¿Estás seguro de que quieres eliminar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    delete: "Eliminar",
    error: "Error",
    success: "Éxito",
    copied: "¡Copiado!",
    copiedClipboard: "Resumen de macros copiado al portapapeles.",
    copySummary: "Copiar resumen",
    remindersLabel: "Recordatorios de comidas",
    saveTimes: "Guardar horarios",
    reminderEnabledError: "Se requiere permiso para activar recordatorios.",
    scheduleSaved: "Horario guardado.",
    allMeals: "Todas las comidas",
    clearAll: "Borrar todo",
    dailyView: "Día",
    weeklyView: "Semana",
    selectDate: "Selecciona una fecha",
    onboardingTitle: "Cuéntanos sobre ti",
    age: "Edad",
    height: "Altura (cm)",
    weight: "Peso (kg)",
    gender: "Género",
    activityLevel: "Actividad",
    goal: "Objetivo",
    saveProfile: "Guardar perfil",
    genderMale: "Hombre",
    genderFemale: "Mujer",
    genderOther: "Otro",
    activityLow: "Baja",
    activityModerate: "Moderada",
    activityHigh: "Alta",
    goalMaintain: "Mantener",
    goalLose: "Perder",
    goalGain: "Ganar",
    invalidProfile: "Completa todos los campos correctamente.",
    today: "Hoy",
    thisWeek: "Esta semana",
    settingsTitle: "Configuración",
    macroGoals: "Metas de macros",
    userProfile: "Perfil de usuario",
    language: "Idioma",
    theme: "Tema",
    system: "Sistema",
    light: "Claro",
    dark: "Oscuro",
    themeNote:
      "El sistema usa la apariencia del dispositivo para elegir el modo claro u oscuro.",
    saveSettings: "Guardar configuración",
    selectReminderTime:
      "Selecciona la hora de los recordatorios para cada comida.",
    english: "English",
    spanish: "Español",
    dailySummary: "Resumen diario",
    mealsLabel: "Comidas",
    loggedToday: "registradas hoy",
    selectedTime: "Hora seleccionada:",
    pickTime: "Elige una hora",
    lunchReminderLabel: "Almuerzo",
    dinnerReminderLabel: "Cena",
    lunchReminderBody: "¡No olvides registrar tu almuerzo!",
    dinnerReminderBody: "¡Es hora de registrar tu cena!",
    settingsSaved: "¡Configuración guardada con éxito!",
    themeUpdated: "Tema actualizado con éxito.",
    pickADate: "Elige una fecha",
  },
};

export const t = (key: TranslationKey): string => {
  return translations[locale][key] || translations.en[key] || key;
};

export const useTranslation = () => {
  const currentLocale = useSyncExternalStore(
    subscribeToLocaleChanges,
    () => locale,
    () => locale,
  );

  return {
    t: (key: TranslationKey) =>
      translations[currentLocale][key] || translations.en[key] || key,
    locale: currentLocale,
  };
};

export const setAppLocale = (nextLocale?: string | Locale): void => {
  const next = normalizeLocale(nextLocale);
  if (next === locale) {
    return;
  }

  locale = next;
  localeListeners.forEach((listener) => listener());
};

export const getAppLocale = (): Locale => locale;

export const subscribeToLocaleChanges = (
  listener: () => void,
): (() => void) => {
  localeListeners.add(listener);

  return () => {
    localeListeners.delete(listener);
  };
};
