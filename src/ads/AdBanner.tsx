import { getAdsModule, useAds } from '@/ads/AdsProvider';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

// Real ad units come from the environment so test builds never show live ads by accident.
const bannerUnitId = Platform.select({
  android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID,
  ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS,
});

/** An anchored banner for the bottom of a screen. Renders nothing for Pro users or when ads aren't ready. */
export default function AdBanner() {
  const { adsReady } = useAds();
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const ads = adsReady ? getAdsModule() : null;
  const unitId = __DEV__ ? ads?.TestIds.ADAPTIVE_BANNER : bannerUnitId;

  if (!ads || !unitId || failed) {
    return null;
  }

  const { BannerAd, BannerAdSize } = ads;
  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.surface }]}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
