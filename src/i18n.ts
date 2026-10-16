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

type Locale = "en" | "es";

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
  invalidNumber: string;
  clearAllTitle: string;
  clearAllMessage: string;
  recommendedGoals: string;
  goalsCalculated: string;
  remindersUnsupported: string;
  remindersBlocked: string;
  remindersScheduleError: string;
  openSettings: string;
  onboardingIntro: string;
  getStarted: string;
  recentFoods: string;
  recentFoodHint: string;
  caloriesFromMacrosHint: string;
  mealAddedToast: string;
  mealUpdatedToast: string;
  mealDeletedToast: string;
  undo: string;
  editMeal: string;
  editMealHint: string;
  saveChanges: string;
  mealNotFound: string;
  shareSummary: string;
  previousDay: string;
  nextDay: string;
  backToToday: string;
  todaysMeals: string;
  mealsThatDay: string;
  noMealsDay: string;
  history: string;
  previousWeek: string;
  nextWeek: string;
  weeklyAverage: string;
  noMealsWeek: string;
  yourProfile: string;
  editProfileHint: string;
  ageYears: string;
  profileSaved: string;
  profileAndGoalsSaved: string;
  recalculateGoalsLabel: string;
  recalculateGoalsHint: string;
  healthDisclaimer: string;
  about: string;
  privacyPolicy: string;
  appVersion: string;
  removeFavoriteTitle: string;
  servingSizeError: string;
  amountError: string;
  scanBarcode: string;
  favorites: string;
  favoriteChipHint: string;
  modeTotal: string;
  modePer100g: string;
  amountGrams: string;
  amountServings: string;
  servingsUnit: string;
  servingSize: string;
  portionTotal: string;
  storeUnavailable: string;
  proLifetime: string;
  proAnnual: string;
  proMonthly: string;
  proLifetimeNote: string;
  proSubscriptionNote: string;
  proThanks: string;
  purchaseError: string;
  restorePurchases: string;
  restoreSuccess: string;
  restoreNothing: string;
  close: string;
  proSubtitle: string;
  proBenefitNoAds: string;
  proBenefitScanner: string;
  proBenefitCsv: string;
  proActive: string;
  purchasesUnavailable: string;
  proLegal: string;
  devProToggle: string;
  productNotFoundTitle: string;
  productNotFound: string;
  enterManually: string;
  scanAgain: string;
  lookupFailed: string;
  cameraPermission: string;
  allowCamera: string;
  scanHint: string;
  offCredit: string;
  invalidWeight: string;
  weightSaved: string;
  logWeight: string;
  deleteWeight: string;
  save: string;
  water: string;
  removeGlass: string;
  addGlass: string;
  bodyWeight: string;
  noWeightYet: string;
  weightChange30: string;
  mealsCopied: string;
  streakLabel: string;
  streakOneDay: string;
  streakDays: string;
  copyYesterday: string;
  copyDayToToday: string;
  addedToFavorites: string;
  removedFromFavorites: string;
  removeFromFavorites: string;
  addToFavorites: string;
  exportBackup: string;
  importBackup: string;
  exportCsv: string;
  shareUnavailable: string;
  exportError: string;
  importError: string;
  invalidBackup: string;
  importConfirm: string;
  restore: string;
  backupRestored: string;
  proActiveShort: string;
  proThanksShort: string;
  getPro: string;
  getProHint: string;
  waterGoal: string;
  yourData: string;
  backupNote: string;
  adPrivacyOptions: string;
  shareUsageStats: string;
  shareUsageStatsHint: string;
};

type TranslationKey = keyof TranslationMap;

const translations: Record<Locale, TranslationMap> = {
  en: {
    appName: "MacroStats",
    home: "Home",
    homeTitle: "MacroStats",
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
    enterMealError: "Please enter a meal name and its calories or macros.",
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
    invalidNumber: "Amounts must be positive numbers, like 12 or 12.5.",
    clearAllTitle: "Delete all meals?",
    clearAllMessage:
      "This permanently deletes every meal you've logged, on every day.",
    recommendedGoals: "Calculate goals from profile",
    goalsCalculated:
      "Your macro goals were filled in from your profile. Tap Save Settings to keep them.",
    remindersBlocked:
      "Notifications are turned off for this app. Turn them on in Settings to get meal reminders.",
    remindersScheduleError:
      "Reminders couldn't be scheduled, so they were turned off. Check that notifications are allowed for this app.",
    openSettings: "Open Settings",
    onboardingIntro: "We'll use this to suggest daily calorie and macro goals. You can change them anytime in Settings.",
    getStarted: "Get started",
    recentFoods: "Recent foods",
    recentFoodHint: "Fills the form with this food",
    caloriesFromMacrosHint: "Leave calories blank to use {calories} kcal, calculated from the macros.",
    mealAddedToast: "Added {name}",
    mealUpdatedToast: "Meal updated",
    mealDeletedToast: "Deleted {name}",
    undo: "Undo",
    editMeal: "Edit Meal",
    editMealHint: "Opens the meal to edit it",
    saveChanges: "Save Changes",
    mealNotFound: "This meal no longer exists.",
    shareSummary: "Share summary",
    previousDay: "Previous day",
    nextDay: "Next day",
    backToToday: "Back to today",
    todaysMeals: "Today's Meals",
    mealsThatDay: "Meals",
    noMealsDay: "No meals logged on this day.",
    history: "History",
    previousWeek: "Previous week",
    nextWeek: "Next week",
    weeklyAverage: "Average on logged days: {calories} kcal",
    noMealsWeek: "No meals logged this week.",
    yourProfile: "Your profile",
    editProfileHint: "Opens your profile to edit it",
    ageYears: "{age} years",
    profileSaved: "Profile saved",
    profileAndGoalsSaved: "Profile saved and goals updated",
    recalculateGoalsLabel: "Update my macro goals",
    recalculateGoalsHint: "Recalculates calories, protein, carbs and fat from this profile.",
    healthDisclaimer:
      "MacroStats gives general estimates for information only. It is not medical or nutrition advice. Talk to a doctor or dietitian before making big changes to your diet, especially if you are pregnant, have a health condition or are under 18.",
    about: "About",
    privacyPolicy: "Privacy policy",
    appVersion: "Version {version}",
    removeFavoriteTitle: "Remove from favorites?",
    servingSizeError: "Enter the serving size in grams.",
    amountError: "Enter how much you ate.",
    scanBarcode: "Scan barcode",
    favorites: "Favorites",
    favoriteChipHint: "Fills the form with this food. Long-press to remove it from favorites.",
    modeTotal: "Total eaten",
    modePer100g: "Per 100 g",
    amountGrams: "Amount (g)",
    amountServings: "Servings",
    servingsUnit: "servings",
    servingSize: "Serving size (g)",
    portionTotal: "{grams} g: {calories} kcal · P {protein} g · C {carbs} g · F {fat} g",
    storeUnavailable: "The store couldn't be reached. Check your connection and try again.",
    proLifetime: "One-time purchase",
    proAnnual: "Yearly",
    proMonthly: "Monthly",
    proLifetimeNote: "Pay once, Pro forever",
    proSubscriptionNote: "Renews automatically. Cancel anytime.",
    proThanks: "Thanks! MacroStats Pro is on.",
    purchaseError: "The purchase couldn't be completed. Please try again.",
    restorePurchases: "Restore purchases",
    restoreSuccess: "Your Pro purchase was restored.",
    restoreNothing: "No previous Pro purchase was found for this account.",
    close: "Close",
    proSubtitle: "Support MacroStats and unlock everything.",
    proBenefitNoAds: "No ads",
    proBenefitScanner: "Barcode scanner with Open Food Facts",
    proBenefitCsv: "Export your full history to CSV",
    proActive: "MacroStats Pro is active. Thank you!",
    purchasesUnavailable:
      "Purchases aren't available in this version of the app. Install MacroStats from Google Play or the App Store to get Pro.",
    proLegal:
      "Subscriptions renew automatically until you cancel them in Google Play or App Store settings. The one-time purchase doesn't renew.",
    devProToggle: "Simulate Pro (development only)",
    productNotFoundTitle: "Product not found",
    productNotFound: "This barcode isn't in Open Food Facts yet. You can enter the nutrition label by hand.",
    enterManually: "Enter manually",
    scanAgain: "Scan again",
    lookupFailed: "Couldn't look up this product. Check your connection and try again.",
    cameraPermission: "MacroStats needs the camera to read barcodes. Images never leave your phone.",
    allowCamera: "Allow camera",
    scanHint: "Point the camera at the product's barcode",
    offCredit: "Nutrition data from Open Food Facts",
    invalidWeight: "Enter a weight between 20 and 400 kg.",
    weightSaved: "Weight saved",
    logWeight: "Log weight",
    deleteWeight: "Delete this weight",
    save: "Save",
    water: "Water",
    removeGlass: "Remove a glass of water",
    addGlass: "Add a glass of water",
    bodyWeight: "Body weight",
    noWeightYet: "No weight logged yet",
    weightChange30: "{change} kg in the last 30 days",
    mealsCopied: "{count} meals copied to today",
    streakLabel: "Logging streak: {days} days in a row",
    streakOneDay: "1 day streak",
    streakDays: "{days} day streak",
    copyYesterday: "Copy yesterday",
    copyDayToToday: "Copy to today",
    addedToFavorites: "{name} added to favorites",
    removedFromFavorites: "{name} removed from favorites",
    removeFromFavorites: "Remove from favorites",
    addToFavorites: "Add to favorites",
    exportBackup: "Export backup",
    importBackup: "Import backup",
    exportCsv: "Export history to CSV",
    shareUnavailable: "Sharing files isn't available on this device.",
    exportError: "The file couldn't be created. Please try again.",
    importError: "The file couldn't be read. Please try again.",
    invalidBackup: "This file isn't a MacroStats backup.",
    importConfirm:
      "This replaces all your meals, goals and settings with the backup from {date}. This can't be undone.",
    restore: "Restore",
    backupRestored: "Backup restored",
    proActiveShort: "MacroStats Pro",
    proThanksShort: "Active. Thanks for your support!",
    getPro: "Get MacroStats Pro",
    getProHint: "No ads, barcode scanner and CSV export",
    waterGoal: "Daily water goal (ml)",
    yourData: "Your data",
    backupNote:
      "Your data lives on this phone. Export a backup before changing phones, and import it on the new one. If Android or iCloud backup is on, the system also keeps a copy.",
    adPrivacyOptions: "Ad privacy choices",
    shareUsageStats: "Share anonymous usage stats",
    shareUsageStatsHint: "Helps us see which features are used. Never includes your meals or weight.",
    remindersUnsupported:
      "Reminders don't work in Expo Go on Android. They work in the installed app (a development or store build).",
  },
  es: {
    appName: "MacroStats",
    home: "Inicio",
    homeTitle: "MacroStats",
    recentMeals: "Comidas recientes",
    noMeals: "Aún no hay comidas registradas.",
    addMeal: "Agregar comida",
    calories: "Calorías",
    protein: "Proteínas",
    carbs: "Carbos",
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
    enterMealError: "Ingresa un nombre y sus calorías o macros.",
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
    invalidNumber:
      "Las cantidades deben ser números positivos, como 12 o 12,5.",
    clearAllTitle: "¿Eliminar todas las comidas?",
    clearAllMessage:
      "Esto elimina para siempre todas las comidas registradas, de todos los días.",
    recommendedGoals: "Calcular metas desde el perfil",
    goalsCalculated:
      "Tus metas de macros se completaron con tu perfil. Toca Guardar configuración para conservarlas.",
    remindersBlocked:
      "Las notificaciones están desactivadas para esta app. Actívalas en Ajustes para recibir recordatorios.",
    remindersScheduleError:
      "No se pudieron programar los recordatorios, así que se desactivaron. Revisa que las notificaciones estén permitidas para esta app.",
    openSettings: "Abrir Ajustes",
    onboardingIntro: "Usaremos esto para sugerir tus metas diarias de calorías y macros. Puedes cambiarlas cuando quieras en Configuración.",
    getStarted: "Comenzar",
    recentFoods: "Comidas recientes",
    recentFoodHint: "Completa el formulario con esta comida",
    caloriesFromMacrosHint: "Deja las calorías vacías para usar {calories} kcal, calculadas con los macros.",
    mealAddedToast: "Se agregó {name}",
    mealUpdatedToast: "Comida actualizada",
    mealDeletedToast: "Se eliminó {name}",
    undo: "Deshacer",
    editMeal: "Editar comida",
    editMealHint: "Abre la comida para editarla",
    saveChanges: "Guardar cambios",
    mealNotFound: "Esta comida ya no existe.",
    shareSummary: "Compartir resumen",
    previousDay: "Día anterior",
    nextDay: "Día siguiente",
    backToToday: "Volver a hoy",
    todaysMeals: "Comidas de hoy",
    mealsThatDay: "Comidas",
    noMealsDay: "No hay comidas registradas este día.",
    history: "Historial",
    previousWeek: "Semana anterior",
    nextWeek: "Semana siguiente",
    weeklyAverage: "Promedio en días registrados: {calories} kcal",
    noMealsWeek: "No hay comidas registradas esta semana.",
    yourProfile: "Tu perfil",
    editProfileHint: "Abre tu perfil para editarlo",
    ageYears: "{age} años",
    profileSaved: "Perfil guardado",
    profileAndGoalsSaved: "Perfil guardado y metas actualizadas",
    recalculateGoalsLabel: "Actualizar mis metas de macros",
    recalculateGoalsHint: "Recalcula calorías, proteínas, carbohidratos y grasas con este perfil.",
    healthDisclaimer:
      "MacroStats ofrece estimaciones generales solo con fines informativos. No es consejo médico ni nutricional. Consulta a un médico o nutricionista antes de hacer cambios importantes en tu alimentación, sobre todo si estás embarazada, tienes alguna condición de salud o eres menor de 18 años.",
    about: "Acerca de",
    privacyPolicy: "Política de privacidad",
    appVersion: "Versión {version}",
    removeFavoriteTitle: "¿Quitar de favoritos?",
    servingSizeError: "Ingresa el tamaño de la porción en gramos.",
    amountError: "Ingresa cuánto comiste.",
    scanBarcode: "Escanear código de barras",
    favorites: "Favoritos",
    favoriteChipHint:
      "Completa el formulario con este alimento. Mantén presionado para quitarlo de favoritos.",
    modeTotal: "Total consumido",
    modePer100g: "Por 100 g",
    amountGrams: "Cantidad (g)",
    amountServings: "Porciones",
    servingsUnit: "porciones",
    servingSize: "Tamaño de la porción (g)",
    portionTotal: "{grams} g: {calories} kcal · P {protein} g · C {carbs} g · G {fat} g",
    storeUnavailable: "No se pudo conectar con la tienda. Revisa tu conexión e inténtalo de nuevo.",
    proLifetime: "Pago único",
    proAnnual: "Anual",
    proMonthly: "Mensual",
    proLifetimeNote: "Pagas una vez y es tuyo para siempre",
    proSubscriptionNote: "Se renueva automáticamente. Cancela cuando quieras.",
    proThanks: "¡Gracias! MacroStats Pro está activo.",
    purchaseError: "No se pudo completar la compra. Inténtalo de nuevo.",
    restorePurchases: "Restaurar compras",
    restoreSuccess: "Se restauró tu compra de Pro.",
    restoreNothing: "No encontramos una compra de Pro en esta cuenta.",
    close: "Cerrar",
    proSubtitle: "Apoya a MacroStats y desbloquea todo.",
    proBenefitNoAds: "Sin anuncios",
    proBenefitScanner: "Escáner de códigos de barras con Open Food Facts",
    proBenefitCsv: "Exporta todo tu historial a CSV",
    proActive: "MacroStats Pro está activo. ¡Gracias!",
    purchasesUnavailable:
      "Las compras no están disponibles en esta versión de la app. Instala MacroStats desde Google Play o la App Store para obtener Pro.",
    proLegal:
      "Las suscripciones se renuevan automáticamente hasta que las canceles en los ajustes de Google Play o la App Store. El pago único no se renueva.",
    devProToggle: "Simular Pro (solo desarrollo)",
    productNotFoundTitle: "Producto no encontrado",
    productNotFound:
      "Este código todavía no está en Open Food Facts. Puedes cargar la etiqueta nutricional a mano.",
    enterManually: "Cargar a mano",
    scanAgain: "Escanear otra vez",
    lookupFailed: "No se pudo buscar el producto. Revisa tu conexión e inténtalo de nuevo.",
    cameraPermission:
      "MacroStats necesita la cámara para leer códigos de barras. Las imágenes no salen de tu teléfono.",
    allowCamera: "Permitir cámara",
    scanHint: "Apunta la cámara al código de barras del producto",
    offCredit: "Datos nutricionales de Open Food Facts",
    invalidWeight: "Ingresa un peso entre 20 y 400 kg.",
    weightSaved: "Peso guardado",
    logWeight: "Registrar peso",
    deleteWeight: "Borrar este peso",
    save: "Guardar",
    water: "Agua",
    removeGlass: "Quitar un vaso de agua",
    addGlass: "Agregar un vaso de agua",
    bodyWeight: "Peso corporal",
    noWeightYet: "Todavía no has registrado tu peso",
    weightChange30: "{change} kg en los últimos 30 días",
    mealsCopied: "{count} comidas copiadas a hoy",
    streakLabel: "Racha: {days} días seguidos registrando",
    streakOneDay: "Racha de 1 día",
    streakDays: "Racha de {days} días",
    copyYesterday: "Copiar ayer",
    copyDayToToday: "Copiar a hoy",
    addedToFavorites: "{name} agregado a favoritos",
    removedFromFavorites: "{name} quitado de favoritos",
    removeFromFavorites: "Quitar de favoritos",
    addToFavorites: "Agregar a favoritos",
    exportBackup: "Exportar respaldo",
    importBackup: "Importar respaldo",
    exportCsv: "Exportar historial a CSV",
    shareUnavailable: "Compartir archivos no está disponible en este dispositivo.",
    exportError: "No se pudo crear el archivo. Inténtalo de nuevo.",
    importError: "No se pudo leer el archivo. Inténtalo de nuevo.",
    invalidBackup: "Este archivo no es un respaldo de MacroStats.",
    importConfirm:
      "Esto reemplaza todas tus comidas, metas y ajustes por el respaldo del {date}. No se puede deshacer.",
    restore: "Restaurar",
    backupRestored: "Respaldo restaurado",
    proActiveShort: "MacroStats Pro",
    proThanksShort: "Activo. ¡Gracias por tu apoyo!",
    getPro: "Obtén MacroStats Pro",
    getProHint: "Sin anuncios, escáner de códigos y exportación a CSV",
    waterGoal: "Meta diaria de agua (ml)",
    yourData: "Tus datos",
    backupNote:
      "Tus datos están en este teléfono. Exporta un respaldo antes de cambiar de celular e impórtalo en el nuevo. Si la copia de seguridad de Android o iCloud está activada, el sistema también guarda una copia.",
    adPrivacyOptions: "Opciones de privacidad de anuncios",
    shareUsageStats: "Compartir estadísticas de uso anónimas",
    shareUsageStatsHint: "Nos ayuda a saber qué funciones se usan. Nunca incluye tus comidas ni tu peso.",
    remindersUnsupported:
      "Los recordatorios no funcionan en Expo Go en Android. Funcionan en la app instalada (una compilación de desarrollo o de la tienda).",
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
