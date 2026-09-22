import { getSettings, updateSettings, type AppTheme } from '@/storage/settings';
import { getAppColors, type ThemeColors } from '@/styles/theme';
import { createContext, useContext, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

type ThemeContextValue = {
  theme: AppTheme;
  colors: ThemeColors;
  setAppTheme: (theme: AppTheme) => Promise<void>;
};

type ThemeProviderProps = {
  children: ReactNode;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps): ReactElement {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<AppTheme>('system');

  useEffect(() => {
    const loadTheme = async () => {
      const settings = await getSettings();
      setThemeState(settings.theme);
    };
    loadTheme();
  }, []);

  const effectiveTheme = theme === 'system' ? (systemScheme ?? 'dark') : theme;
  const colors = useMemo(() => getAppColors(effectiveTheme), [effectiveTheme]);

  const setAppTheme = async (nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    await updateSettings({ theme: nextTheme });
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, setAppTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
