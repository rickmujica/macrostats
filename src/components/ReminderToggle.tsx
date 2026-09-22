import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { getSettings, updateSettings } from '@/storage/settings';
import {
    cancelMealReminders,
    requestPermissions,
    scheduleMealReminders,
} from '@/utils/notifications';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

export default function ReminderToggle() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 30,
        },
        label: {
          color: colors.text,
          fontSize: 16,
        },
      }),
    [colors],
  );

  useEffect(() => {
    const load = async () => {
      const settings = await getSettings();
      setEnabled(settings.remindersEnabled);
    };
    load();
  }, []);

  const toggle = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) return;
      const settings = await getSettings();
      await scheduleMealReminders(settings.reminderSchedule);
    } else {
      await cancelMealReminders();
    }
    setEnabled(value);
    await updateSettings({ remindersEnabled: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('remindersLabel')}</Text>
      <Switch
        value={enabled}
        onValueChange={toggle}
        trackColor={{ false: colors.surface, true: colors.primary }}
      />
    </View>
  );
}
