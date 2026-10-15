# MacroZone (macrostats)

A React Native app built with [Expo](https://expo.dev) (SDK 56) for tracking daily calories and macros: protein, carbs and fat. Everything is stored on the device; there is no account or server.

## Features

- **First-run setup**: a short profile (age, height, weight, gender, activity, goal) that fills in recommended calorie and macro goals.
- **Daily dashboard**: progress rings for calories, protein, carbs and fat against your goals. Step back through previous days with the arrows; "Back to today" returns to the current day.
- **Logging meals**: name plus calories and macros. Decimals work with either `12.5` or `12,5`. Leave calories blank and they are calculated from the macros (4 kcal/g protein and carbs, 9 kcal/g fat).
- **Recent foods**: tap a recently logged food on the Add Meal screen to fill the form and log it again.
- **Edit and delete**: tap a meal to edit it. Swipe it left or tap the trash icon to delete it, with an **Undo** button in the confirmation.
- **History**: a weekly bar chart of calories against your goal (bars turn red over goal), the average on logged days, and the meals for any selected day.
- **Share or copy** a plain-text summary of the selected day.
- **Settings**: macro goals (or "Calculate goals from profile"), profile, English or Spanish, light, dark or system theme, and daily lunch and dinner reminders.

## Requirements

- Node.js 20 or later and npm
- For iOS: Xcode with an iOS simulator (Xcode 27 works; it needs `@expo/cli` 56.1.26 or later, which the current dependencies include)
- For Android: Android Studio with an emulator
- [Expo Go](https://expo.dev/go) installed on the simulator or device (the Expo CLI installs it on simulators for you)

## Run the app

```bash
npm install
```

```bash
npx expo start
```

Then press `i` for the iOS simulator or `a` for the Android emulator, or scan the QR code with Expo Go on a phone. `npm run ios` and `npm run android` start the server and open the platform in one step.

If a launch fails with a port or cache problem, make sure no other `expo start` is running and start with a clean cache:

```bash
npx expo start --clear
```

### Reminders and Expo Go

Meal reminders use `expo-notifications`:

- **iOS (Expo Go or a build)**: reminders work once notifications are allowed. If they were denied, the app offers an **Open Settings** button.
- **Android in Expo Go**: not supported, because Expo Go on Android can't load `expo-notifications`. The switch explains this instead of crashing. Reminders work in a [development build](https://docs.expo.dev/develop/development-builds/introduction/) or a store build.

## Project structure

```
src/
  app/                  Screens (Expo Router file-based routing)
    _layout.tsx         Root: theme, toasts, gestures, onboarding gate
    (tabs)/index.tsx    Home: daily dashboard with day navigation
    (tabs)/add-meal.tsx Add Meal (recent foods, calories from macros)
    (tabs)/meals.tsx    History: weekly chart and meals per day
    (tabs)/settings.tsx Goals, profile, language, theme, reminders
    meal/[id].tsx       Edit Meal (modal)
  components/           UI pieces (MealForm, MealItem, WeekChart, Toast, ...)
  hooks/useTheme.tsx    Light, dark and system theme
  i18n.ts               English and Spanish strings
  storage/              AsyncStorage persistence for meals and settings
  utils/                Dates, number parsing, notifications, share summary
```

## Checks

```bash
npx tsc --noEmit
```

```bash
npm run lint
```

## Branches

New work happens on `dev`. `master` holds the released state and is updated by merging pull requests from `dev`.
