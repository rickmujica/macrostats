import { Alert } from 'react-native';

/** Native alert dialog. The web version (alert.web.ts) uses the browser's dialogs. */
export const alert: typeof Alert.alert = (...args) => Alert.alert(...args);
