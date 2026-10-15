import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { deleteMeal, sameDay } from '@/storage/meals';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MealItemProps = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
  onDelete: () => void;
};

export default function MealItem({
  id,
  name,
  calories,
  protein,
  carbs,
  fat,
  createdAt,
  onDelete,
}: MealItemProps) {
  const { t, locale } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.surface,
          borderRadius: 10,
          padding: 16,
          marginBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
        },
        details: {
          flex: 1,
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
        time: {
          fontSize: 12,
          color: colors.textSecondary,
          marginTop: 4,
        },
        deleteButton: {
          padding: 8,
          marginLeft: 8,
        },
      }),
    [colors],
  );

  const created = new Date(createdAt);
  const time = created.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const loggedAt = sameDay(created, new Date())
    ? time
    : `${created.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}, ${time}`;

  const confirmDelete = () => {
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
    <TouchableOpacity style={styles.container} onLongPress={confirmDelete}>
      <View style={styles.details}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.macros}>
          {calories} {t('calories').slice(0, 3).toLowerCase()} • {protein}g {t('protein').slice(0, 1)} • {carbs}g {t('carbs').slice(0, 1)} • {fat}g {t('fat').slice(0, 1)}
        </Text>
        <Text style={styles.time}>{loggedAt}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={confirmDelete}
        accessibilityRole='button'
        accessibilityLabel={`${t('delete')} ${name}`}
        hitSlop={8}
      >
        <Ionicons name='trash-outline' size={20} color={colors.alert} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
