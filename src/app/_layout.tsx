
import { ThemeProvider } from '@/hooks/useTheme';
import { setAppLocale } from '@/i18n';
import { getSettings } from '@/storage/settings';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    const loadLocale = async () => {
      const settings = await getSettings();
      setAppLocale(settings.locale);
    };

    loadLocale();
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(tabs)' />
      </Stack>
    </ThemeProvider>
  );
}