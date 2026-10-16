import { useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { formatNumber } from '@/utils/numbers';
import { StyleSheet, Text, View } from 'react-native';
import ProgressCircle from './ProgressCircle';

type MacroCardProps = {
  label: string;
  value: number;
  goal: number;
  unit?: string;
  color: string;
};

export default function MacroCard({
  label,
  value,
  goal,
  unit = '',
  color,
}: MacroCardProps) {
  const { locale } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          width: '47%',
          borderLeftWidth: 4,
          borderColor: colors.text,
          borderStyle: 'solid',
          borderWidth: 0.2,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        details: {
          flex: 1,
          marginRight: 12,
        },
        label: {
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 4,
        },
        value: {
          fontSize: 28,
          fontWeight: 'bold',
          color: colors.text,
        },
        goal: {
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 2,
        },
      }),
    [colors],
  );

  const progress = goal > 0 ? Math.min(1, value / goal) : 0;

  return (
    <View style={[styles.card, { borderLeftColor: color }]}> 
      {/* Shrink rather than wrap on narrow phones (360 dp wide is common on Android). The label sits
          above the progress ring and uses the full card width, so "Carbohidratos" keeps its size. */}
      <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
      <View style={styles.row}>
        <View style={styles.details}>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {formatNumber(value, locale)}{unit}
          </Text>
          <Text style={styles.goal} numberOfLines={1} adjustsFontSizeToFit>
            / {formatNumber(goal, locale)}{unit}
          </Text>
        </View>
        <ProgressCircle progress={progress} color={color} />
      </View>
    </View>
  );
}
