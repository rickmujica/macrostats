import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

/** Crash and error reporting. Runs only in builds that have a DSN, and never sends personal data. */
export const initMonitoring = () => {
  if (!dsn || __DEV__) {
    return;
  }
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    environment: 'production',
    enableNative: !isRunningInExpoGo(),
  });
};

export const wrapRoot = Sentry.wrap;
