import { ToastProvider } from '@/components/Toast';
import UserOnboarding from '@/components/UserOnboarding';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import { setAppLocale } from '@/i18n';
import { calculateGoals, getSettings, updateSettings, type UserProfile } from '@/storage/settings';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function AppContent() {
  const { colors } = useTheme();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      const settings = await getSettings();
      setAppLocale(settings.locale);
      setOnboardingComplete(settings.onboardingComplete);
    };

    load();
  }, []);

  const finishOnboarding = async (profile: UserProfile) => {
    await updateSettings({
      profile,
      goals: calculateGoals(profile),
      onboardingComplete: true,
    });
    setOnboardingComplete(true);
  };

  if (onboardingComplete === null) {
    // Settings load almost instantly; avoid flashing the wrong screen meanwhile.
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!onboardingComplete) {
    return <UserOnboarding onComplete={finishOnboarding} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' />
      <Stack.Screen name='meal/[id]' options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
