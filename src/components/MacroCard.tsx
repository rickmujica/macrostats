import { useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet, Text, View } from 'react-native';
import ProgressCircle from './ProgressCircle';

type MacroCardProps = {
  label: string;
  value: string;
  goal: string;
  color: string;
};

export default function MacroCard({
  label,
  value,
  goal,
  color,
}: MacroCardProps) {
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
        },
        value: {
          fontSize: 28,
          fontWeight: 'bold',
          color: colors.text,
          marginTop: 4,
        },
        goal: {
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 2,
        },
      }),
    [colors],
  );

  const numericGoal = Number(goal.replace(/[^\d]/g, '')) || 0;
  const numericValue = Number(value.replace(/[^\d]/g, '')) || 0;
  const progress = numericGoal > 0 ? Math.min(1, numericValue / numericGoal) : 0;

  return (
    <View style={[styles.card, { borderLeftColor: color }]}> 
      <View style={styles.row}>
        <View style={styles.details}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.goal}>/ {goal}</Text>
        </View>
        <ProgressCircle progress={progress} color={color} />
      </View>
    </View>
  );
}
