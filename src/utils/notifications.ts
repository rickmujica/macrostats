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

export type PermissionResult = 'granted' | 'denied' | 'blocked';

const isGranted = (
  permissions: Awaited<ReturnType<NotificationsModule['getPermissionsAsync']>>,
  Notifications: NotificationsModule,
) =>
  permissions.granted ||
  permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

export const hasReminderPermission = async (): Promise<boolean> => {
  const Notifications = getNotifications();
  if (!Notifications) {
    return false;
  }

  return isGranted(await Notifications.getPermissionsAsync(), Notifications);
};

/**
 * Asks for notification permission. Returns 'blocked' when the system won't
 * show the prompt again (the user denied it before), so the only way back is
 * the device's Settings app.
 */
export const requestPermissions = async (): Promise<PermissionResult> => {
  const Notifications = getNotifications();
  if (!Notifications) {
    return 'denied';
  }

  // Android 13+ only shows the permission prompt once a channel exists.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: t('remindersLabel'),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (isGranted(current, Notifications)) {
    return 'granted';
  }
  if (!current.canAskAgain) {
    return 'blocked';
  }

  const requested = await Notifications.requestPermissionsAsync();
  if (isGranted(requested, Notifications)) {
    return 'granted';
  }
  return requested.canAskAgain ? 'denied' : 'blocked';
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

/** Schedules the daily reminders. Returns false if they couldn't be scheduled. */
export const scheduleMealReminders = async (schedule: ReminderScheduleItem[]): Promise<boolean> => {
  const Notifications = getNotifications();
  if (!Notifications || !(await hasReminderPermission())) {
    return false;
  }

  try {
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
    return true;
  } catch {
    await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
    return false;
  }
};

export const cancelMealReminders = async () => {
  await getNotifications()?.cancelAllScheduledNotificationsAsync();
};
