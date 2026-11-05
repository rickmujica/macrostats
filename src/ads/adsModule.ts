export type AdsModule = typeof import('react-native-google-mobile-ads');

// Google Mobile Ads has no web version; the web build shows no ads.
export const loadAdsModule = (): AdsModule | null => null;
