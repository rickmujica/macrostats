export type AdsModule = typeof import('react-native-google-mobile-ads');

// Required lazily so Expo Go, which lacks the native module, never loads it.
export const loadAdsModule = (): AdsModule =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('react-native-google-mobile-ads') as AdsModule;
