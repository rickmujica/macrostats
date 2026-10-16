import { isRunningInExpoGo } from 'expo';
import PostHog from 'posthog-react-native';

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

/** Events MacroStats sends. Properties never include food names, weights or other personal data. */
export type AnalyticsEvent =
  | 'meal_added'
  | 'meal_edited'
  | 'day_copied'
  | 'favorite_toggled'
  | 'water_added'
  | 'weight_logged'
  | 'backup_exported'
  | 'backup_imported'
  | 'csv_exported'
  | 'barcode_scanned'
  | 'paywall_viewed'
  | 'pro_purchased'
  | 'pro_restored';

let client: PostHog | null = null;

/** Starts analytics when a key is configured. Off in development so testing doesn't skew the numbers. */
export const initAnalytics = (enabled: boolean) => {
  if (client || !apiKey || __DEV__ || isRunningInExpoGo()) {
    return;
  }
  client = new PostHog(apiKey, {
    host,
    defaultOptIn: enabled,
    captureAppLifecycleEvents: true,
  });
};

export const setAnalyticsEnabled = async (enabled: boolean) => {
  if (!client) {
    return;
  }
  await (enabled ? client.optIn() : client.optOut());
};

export const track = (event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) => {
  client?.capture(event, properties);
};

export const trackScreen = (pathname: string) => {
  client?.screen(pathname);
};
