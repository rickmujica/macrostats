import { AdsProvider } from '@/ads/AdsProvider';
import { ToastProvider } from '@/components/Toast';
import ProfileForm from '@/components/ProfileForm';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import { setAppLocale, useTranslation } from '@/i18n';
import { ProProvider } from '@/pro/ProProvider';
import { initAnalytics, trackScreen } from '@/services/analytics';
import { initMonitoring, wrapRoot } from '@/services/monitoring';
import { calculateGoals, getSettings, updateSettings, type UserProfile } from '@/storage/settings';
import { Stack, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

initMonitoring();

function AppContent() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      const settings = await getSettings();
      setAppLocale(settings.locale);
      initAnalytics(settings.analyticsEnabled);
      setOnboardingComplete(settings.onboardingComplete);
    };

    load();
  }, []);

  useEffect(() => {
    trackScreen(pathname);
  }, [pathname]);

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
    return (
      <ProfileForm
        title={t('onboardingTitle')}
        intro={t('onboardingIntro')}
        footnote={t('healthDisclaimer')}
        submitLabel={t('getStarted')}
        onSubmit={finishOnboarding}
      />
    );
  }

  return (
    <AdsProvider enabled={onboardingComplete}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(tabs)' />
        <Stack.Screen name='meal/[id]' options={{ presentation: 'modal' }} />
        <Stack.Screen name='profile' options={{ presentation: 'modal' }} />
        <Stack.Screen name='pro' options={{ presentation: 'modal' }} />
        <Stack.Screen name='scan' options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name='weight' options={{ presentation: 'modal' }} />
      </Stack>
    </AdsProvider>
  );
}

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ProProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ProProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default wrapRoot(RootLayout);
