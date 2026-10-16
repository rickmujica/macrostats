import { useToast } from '@/components/Toast';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { track } from '@/services/analytics';
import { toggleFavorite, useFavorites } from '@/storage/favorites';
import { deleteMeal, restoreMeal, sameDay, type Meal } from '@/storage/meals';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

const SWIPE_ACTION_WIDTH = 96;

type SwipeDeleteActionProps = {
  drag: SharedValue<number>;
  label: string;
  color: string;
};

// The swipeable only moves the row; the action has to follow the drag itself.
function SwipeDeleteAction({ drag, label, color }: SwipeDeleteActionProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.value + SWIPE_ACTION_WIDTH }],
  }));

  return (
    <Animated.View style={[actionStyles.action, { backgroundColor: color }, animatedStyle]}>
      <Ionicons name='trash-outline' size={20} color='#ffffff' />
      <Text style={actionStyles.label}>{label}</Text>
    </Animated.View>
  );
}

const actionStyles = StyleSheet.create({
  action: {
    width: SWIPE_ACTION_WIDTH,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 2,
  },
});

type MealItemProps = {
  meal: Meal;
  /** Called after the meal is deleted or a deletion is undone. */
  onChange: () => void;
};

export default function MealItem({ meal, onChange }: MealItemProps) {
  const { id, name, calories, protein, carbs, fat, createdAt } = meal;
  const { t, locale } = useTranslation();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { isFavorite } = useFavorites();
  const favorite = isFavorite(name);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        swipeable: {
          marginBottom: 10,
        },
        container: {
          backgroundColor: colors.surface,
          borderRadius: 10,
          padding: 16,
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
        iconButton: {
          padding: 8,
          marginLeft: 4,
        },
      }),
    [colors],
  );

  const created = new Date(createdAt);
  const time = created.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const loggedAt = sameDay(created, new Date())
    ? time
    : `${created.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}, ${time}`;

  const handleFavorite = async () => {
    const nowFavorite = await toggleFavorite(meal);
    Haptics.selectionAsync();
    track('favorite_toggled', { favorite: nowFavorite });
    showToast((nowFavorite ? t('addedToFavorites') : t('removedFromFavorites')).replace('{name}', name));
  };

  const handleDelete = async () => {
    const removed = await deleteMeal(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onChange();

    if (removed) {
      showToast(t('mealDeletedToast').replace('{name}', removed.name), {
        actionLabel: t('undo'),
        onAction: async () => {
          await restoreMeal(removed);
          onChange();
        },
      });
    }
  };

  return (
    <Swipeable
      containerStyle={styles.swipeable}
      friction={2}
      rightThreshold={60}
      overshootRight={false}
      onSwipeableOpen={handleDelete}
      renderRightActions={(_progress, drag) => (
        <SwipeDeleteAction drag={drag} label={t('delete')} color={colors.alert} />
      )}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={() => router.push({ pathname: '/meal/[id]', params: { id } })}
        accessibilityHint={t('editMealHint')}
      >
        <View style={styles.details}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.macros}>
            {calories} {t('calories').slice(0, 3).toLowerCase()} • {protein}g {t('protein').slice(0, 1)} • {carbs}g {t('carbs').slice(0, 1)} • {fat}g {t('fat').slice(0, 1)}
          </Text>
          <Text style={styles.time}>{loggedAt}</Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleFavorite}
          accessibilityRole='button'
          accessibilityLabel={favorite ? t('removeFromFavorites') : t('addToFavorites')}
          accessibilityState={{ selected: favorite }}
          hitSlop={8}
        >
          <Ionicons name={favorite ? 'star' : 'star-outline'} size={20} color={favorite ? '#ffd93d' : colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleDelete}
          accessibilityRole='button'
          accessibilityLabel={`${t('delete')} ${name}`}
          hitSlop={8}
        >
          <Ionicons name='trash-outline' size={20} color={colors.alert} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Swipeable>
  );
}
