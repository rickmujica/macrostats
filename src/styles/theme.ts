import { Appearance, type ColorSchemeName } from "react-native";

export type ThemeColors = {
  background: string;
  header: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  alert: string;
};

export const darkColors: ThemeColors = {
  background: "#1a1a2e",
  header: "#242444",
  surface: "#2a2a4a",
  primary: "#4fc3f7",
  text: "#ffffff",
  textSecondary: "#a0a0b0",
  alert: "#ff5252",
};

export const lightColors: ThemeColors = {
  background: "#f5f7ff",
  header: "#dde1f5",
  surface: "#ffffff",
  primary: "#1766ff",
  text: "#1f2937",
  textSecondary: "#6b7280",
  alert: "#ef4444",
};

export type AppTheme = "system" | "light" | "dark";

export const getAppColors = (
  theme: ColorSchemeName | AppTheme,
): ThemeColors => {
  const scheme =
    theme === "system" ? (Appearance.getColorScheme() ?? "dark") : theme;

  return scheme === "light" ? lightColors : darkColors;
};
