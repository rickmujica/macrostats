import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { track } from '@/services/analytics';
import { addWater, GLASS_ML } from '@/storage/body';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const WATER_COLOR = '#4fc3f7';

type WaterCardProps = {
  date: Date;
  ml: number;
  goal: number;
  onChange: (ml: number) => void;
};

/** Water for the selected day, with buttons to add or remove a glass. */
export default function WaterCard({ date, ml, goal, onChange }: WaterCardProps) {
  const { t, locale } = useTranslation();
  const { colors } = useTheme();
  const progress = goal > 0 ? Math.min(ml / goal, 1) : 0;
  const format = (value: number) => value.toLocaleString(locale);

  const change = async (delta: number) => {
    Haptics.selectionAsync();
    onChange(await addWater(date, delta));
    if (delta > 0) {
      track('water_added');
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        <Ionicons name='water' size={22} color={WATER_COLOR} />
        <View style={styles.text}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('water')}</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {format(ml)} / {format(goal)} ml
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, { borderColor: colors.textSecondary }]}
          onPress={() => change(-GLASS_ML)}
          disabled={ml === 0}
          accessibilityRole='button'
          accessibilityLabel={t('removeGlass')}
        >
          <Ionicons name='remove' size={20} color={ml === 0 ? colors.textSecondary : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: WATER_COLOR }]}
          onPress={() => change(GLASS_ML)}
          accessibilityRole='button'
          accessibilityLabel={t('addGlass')}
        >
          <Ionicons name='add' size={18} color='#0b2540' />
          <Text style={styles.addText}>{GLASS_ML} ml</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.track, { backgroundColor: colors.background }]}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: WATER_COLOR }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    flex: 1,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 36,
  },
  addText: {
    color: '#0b2540',
    fontWeight: '700',
    fontSize: 14,
  },
  track: {
    height: 6,
    borderRadius: 3,
    marginTop: 14,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
});
