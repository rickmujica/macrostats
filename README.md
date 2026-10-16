# MacroZone (macrostats)

A React Native app built with [Expo](https://expo.dev) (SDK 56) for tracking daily calories and macros: protein, carbs and fat. Everything is stored on the device; there is no account or server.

## Features

- **First-run setup**: a short profile (age, height, weight, gender, activity, goal) that fills in recommended calorie and macro goals, with a health disclaimer.
- **Daily dashboard**: progress rings for calories, protein, carbs and fat, daily water with a goal, and a logging streak. Step back through previous days with the arrows.
- **Logging meals**: name plus calories and macros, either as the total eaten or **per 100 g** with an amount in grams or servings (the form shows the resulting totals). Leave calories blank and they are calculated from the macros (4 kcal/g protein and carbs, 9 kcal/g fat).
- **Favorites and recent foods**: star a meal to keep it as a favorite; favorites and recently logged foods fill the Add Meal form with one tap (long-press a favorite to remove it).
- **Copy a day**: copy yesterday's meals (or any past day's) to today, with **Undo**.
- **Edit and delete**: tap a meal to edit it. Swipe it left or tap the trash icon to delete it, with **Undo**.
- **History**: a weekly calorie chart against your goal, plus your **body weight** for the week and the 30-day change. Logging today's weight updates the profile.
- **Backups**: export everything to a JSON file and import it on another phone (Settings → Your data).
- **Share or copy** a plain-text summary of the selected day.
- **Settings**: macro and water goals, profile, English or Spanish, light, dark or system theme, lunch and dinner reminders, ad privacy choices and an opt-out for anonymous usage stats.

### MacroZone Pro

A one-time purchase or a subscription (RevenueCat entitlement `pro`) that:

- removes the ads (AdMob banners on Home and History),
- unlocks the **barcode scanner**, which looks products up in [Open Food Facts](https://world.openfoodfacts.org) and fills Add Meal per 100 g,
- unlocks **CSV export** of the full meal history.

## Requirements

- Node.js 20 or later and npm
- For iOS: Xcode with an iOS simulator (Xcode 27 works; it needs `@expo/cli` 56.1.26 or later, which the current dependencies include)
- For Android: Android Studio with an emulator
- An [Expo account](https://expo.dev) and `npm install -g eas-cli` for development and store builds

## Run the app

```bash
npm install
```

The app runs two ways:

| | Expo Go | Development build |
|---|---|---|
| Start with | `npm run start:go` | `npm start` |
| Ads, purchases, Android reminders | No (hidden or explained in the app) | Yes |
| Everything else, including the barcode scanner | Yes | Yes |

Because `expo-dev-client` is installed, `npx expo start` opens a **development build** by default. Use `npm run start:go` (or press `s` in the terminal) for Expo Go.

To make a development build, either build locally:

```bash
npx expo run:android
npx expo run:ios
```

or in the cloud with `eas build --profile development --platform android`, then install it on the emulator or phone.

In development, ads use Google's test ads, and Pro can be turned on without paying from the Pro screen ("Simulate Pro").

If a launch fails with a port or cache problem, make sure no other `expo start` is running and start with a clean cache:

```bash
npx expo start --clear
```

### Reminders and Expo Go

Meal reminders use `expo-notifications`:

- **iOS (Expo Go or a build)**: reminders work once notifications are allowed. If they were denied, the app offers an **Open Settings** button.
- **Android in Expo Go**: not supported, because Expo Go on Android can't load `expo-notifications`. The switch explains this instead of crashing. Reminders work in a development or store build.

## Configuration

Services turn on only when their keys are set, so a build without them simply has no ads, purchases, analytics or crash reports. Set these as [EAS environment variables](https://docs.expo.dev/eas/environment-variables/) (for the `preview` and `production` environments) or in a local `.env` file:

| Variable | What it's for |
|---|---|
| `EXPO_PUBLIC_ADMOB_BANNER_ANDROID`, `EXPO_PUBLIC_ADMOB_BANNER_IOS` | AdMob banner ad unit IDs (release builds; development uses test ads) |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat public SDK keys |
| `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_HOST` | PostHog project key and host (`https://us.i.posthog.com` or `https://eu.i.posthog.com`) |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry DSN for crash reports |

Also replace the AdMob **app IDs** in `app.json` (`react-native-google-mobile-ads` plugin). The ones there are Google's sample IDs, which only show test ads.

In RevenueCat, create an entitlement `pro`, attach the subscription and the one-time (non-consumable) product to it, and put both packages in the current offering.

## Releasing to Google Play

```bash
eas build --platform android --profile production
```

This produces an `.aab` with an auto-incremented version code. The first upload to Play Console is manual; later ones can use `eas submit --platform android` (internal track, as a draft). `preview` builds an installable `.apk` for testers.

Store listing graphics and screenshots are in `store/`. The privacy policy is `docs/privacy.md`, served by GitHub Pages at <https://rickmujica.github.io/macrostats/privacy.html> once Pages is enabled for `master` → `/docs`.

## Project structure

```
src/
  app/                  Screens (Expo Router file-based routing)
    _layout.tsx         Root: theme, Pro, ads, toasts, onboarding gate
    (tabs)/index.tsx    Home: dashboard, water, streak, copy a day
    (tabs)/add-meal.tsx Add Meal (favorites, recent foods, per 100 g, scanner)
    (tabs)/meals.tsx    History: weekly chart, weight and meals per day
    (tabs)/settings.tsx Pro, goals, language, theme, reminders, data, about
    meal/[id].tsx       Edit Meal (modal)
    profile.tsx         Edit profile (modal)
    pro.tsx             MacroZone Pro paywall (modal)
    scan.tsx            Barcode scanner (Pro)
    weight.tsx          Log weight (modal)
  ads/                  AdMob consent, initialization and banner
  pro/                  RevenueCat purchases and the Pro status
  services/             PostHog analytics and Sentry crash reporting
  components/           UI pieces (MealForm, MealItem, WeekChart, WaterCard, ...)
  hooks/useTheme.tsx    Light, dark and system theme
  i18n.ts               English and Spanish strings
  storage/              AsyncStorage: meals, settings, favorites, weight, water
  utils/                Dates, portions, streak, backup, CSV, Open Food Facts, ...
  __tests__/            Jest unit tests
plugins/                Local Expo config plugins
docs/                   Privacy policy (GitHub Pages)
store/                  Play Store icon, feature graphic and screenshots
```

## Checks

```bash
npm run lint
npm run typecheck
npm test
```

GitHub Actions runs the same three on pushes to `dev` and `master` and on pull requests.

## Roadmap

- **Scan a meal from a photo**: take or pick a photo on Add Meal and get an estimated name, calories and macros to review before saving. The likely approach is a vision AI model behind a small server (so no API key ships in the app), with the estimate filling the existing form. Alternatives considered: the Passio Nutrition-AI SDK (needs a development build, paid per scan) and the LogMeal REST API. iOS 27's camera reads packaged nutrition labels into Apple Health but doesn't expose meal-photo estimates to other apps.

## Branches

New work happens on `dev`. `master` holds the released state and is updated by merging pull requests from `dev`.
