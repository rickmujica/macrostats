import { t } from '@/i18n';
import type { ReminderScheduleItem } from '@/storage/settings';
import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

const REMINDER_CHANNEL_ID = 'meal-reminders';

/**
 * Expo Go on Android throws as soon as expo-notifications is imported, so
 * reminders there need a development build. Everywhere else they work.
 */
export const remindersSupported = !(Platform.OS === 'android' && isRunningInExpoGo());

let notificationsModule: NotificationsModule | null = null;

const getNotifications = (): NotificationsModule | null => {
  if (!remindersSupported) {
    return null;
  }

  if (!notificationsModule) {
    // A static import would crash Expo Go on Android, so load it on demand.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    notificationsModule = require('expo-notifications') as NotificationsModule;
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }

  return notificationsModule;
};

export const requestPermissions = async (): Promise<boolean> => {
  const Notifications = getNotifications();
  if (!Notifications) {
    return false;
  }

  // Android 13+ only shows the permission prompt once a channel exists.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: t('remindersLabel'),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
};

const reminderText = (item: ReminderScheduleItem) => {
  if (item.id === 'lunch') {
    return { title: t('lunchReminderLabel'), body: t('lunchReminderBody') };
  }
  if (item.id === 'dinner') {
    return { title: t('dinnerReminderLabel'), body: t('dinnerReminderBody') };
  }
  return { title: item.label, body: item.body };
};

export const scheduleMealReminders = async (schedule: ReminderScheduleItem[]) => {
  const Notifications = getNotifications();
  if (!Notifications) {
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Promise.all(
    schedule.map((item) =>
      Notifications.scheduleNotificationAsync({
        content: reminderText(item),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: item.hour,
          minute: item.minute,
          channelId: REMINDER_CHANNEL_ID,
        },
      }),
    ),
  );
};

export const cancelMealReminders = async () => {
  await getNotifications()?.cancelAllScheduledNotificationsAsync();
};
