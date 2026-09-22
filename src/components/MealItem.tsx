import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { deleteMeal } from '@/storage/meals';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

type MealItemProps = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onDelete: () => void;
};

export default function MealItem({
  id,
  name,
  calories,
  protein,
  carbs,
  fat,
  onDelete,
}: MealItemProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.surface,
          borderRadius: 10,
          padding: 16,
          marginBottom: 10,
        },
        name: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
        },
        macros: {
          fontSize: 13,
          color: colors.textSecondary,
          marginTop: 4,
        },
      }),
    [colors],
  );

  const handleLongPress = () => {
    Alert.alert(t('deleteMealTitle'), `${t('deleteMealMessage')} "${name}"?`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteMeal(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onDelete();
        },
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.container} onLongPress={handleLongPress}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.macros}>
        {calories} {t('calories').slice(0, 3).toLowerCase()} • {protein}g {t('protein').slice(0, 1)} • {carbs}g {t('carbs').slice(0, 1)} • {fat}g {t('fat').slice(0, 1)}
      </Text>
    </TouchableOpacity>
  );
}
