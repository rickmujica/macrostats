import { useTheme } from "@/hooks/useTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { type ThemeColors } from "./theme";

export const getGlobalStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 60,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textSecondary,
      marginTop: 30,
      marginBottom: 16,
    },
    empty: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  });

export const useGlobalStyles = () => {
  const { colors } = useTheme();
  return useMemo(() => getGlobalStyles(colors), [colors]);
};
