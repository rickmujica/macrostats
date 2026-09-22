// import * as Notifications from 'expo-notifications';
// import type { ReminderScheduleItem } from '@/storage/settings';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldShowBanner: true,
//     shouldShowList: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

// export const requestPermissions = async (): Promise<boolean> => {
//   const { status } = await Notifications.requestPermissionsAsync();
//   return status === 'granted';
// };

// export const scheduleMealReminders = async (
//   schedule: ReminderScheduleItem[],
// ) => {
//   await Notifications.cancelAllScheduledNotificationsAsync();

//   await Promise.all(
//     schedule.map((item) =>
//       Notifications.scheduleNotificationAsync({
//         content: {
//           title: 'MacroZone',
//           body: item.body,
//         },
//         trigger: {
//           type: Notifications.SchedulableTriggerInputTypes.DAILY,
//           hour: item.hour,
//           minute: item.minute,
//         },
//       }),
//     ),
//   );
// };

// export const cancelMealReminders = async () => {
//   await Notifications.cancelAllScheduledNotificationsAsync();
// };
