import { loadAdsModule, type AdsModule } from '@/ads/adsModule';
import { usePro } from '@/pro/ProProvider';
import { isRunningInExpoGo } from 'expo';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

/** Ads need the native Google Mobile Ads module, which Expo Go doesn't include. */
export const adsSupported = Platform.OS !== 'web' && !isRunningInExpoGo();

let adsModule: AdsModule | null = null;

export const getAdsModule = (): AdsModule | null => {
  if (!adsSupported) {
    return null;
  }
  if (!adsModule) {
    adsModule = loadAdsModule();
  }
  return adsModule;
};

type AdsContextValue = {
  /** True once consent is settled and the SDK is ready to load ads. */
  adsReady: boolean;
  /** Whether the person must be offered a way to change their consent (EEA, UK, Switzerland). */
  privacyOptionsRequired: boolean;
  showPrivacyOptions: () => Promise<void>;
};

const AdsContext = createContext<AdsContextValue | undefined>(undefined);

type AdsProviderProps = {
  /** Ads start only after onboarding, so the consent form doesn't interrupt setup. */
  enabled: boolean;
  children: ReactNode;
};

export function AdsProvider({ enabled, children }: AdsProviderProps) {
  const { isPro, ready: proReady } = usePro();
  const [adsReady, setAdsReady] = useState(false);
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!enabled || !proReady || isPro || started.current) {
      return;
    }
    const ads = getAdsModule();
    if (!ads) {
      return;
    }
    started.current = true;

    const start = async () => {
      try {
        // Google's consent form (UMP) shows only where the law requires it.
        const consent = await ads.AdsConsent.gatherConsent();
        setPrivacyOptionsRequired(
          consent.privacyOptionsRequirementStatus === ads.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
        );
        if (!consent.canRequestAds) {
          return;
        }

        if (Platform.OS === 'ios') {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const tracking = require('expo-tracking-transparency') as typeof import('expo-tracking-transparency');
          const { status } = await tracking.getTrackingPermissionsAsync();
          if (status === tracking.PermissionStatus.UNDETERMINED) {
            await tracking.requestTrackingPermissionsAsync();
          }
        }

        await ads.default().initialize();
        setAdsReady(true);
      } catch (error) {
        console.warn('Ads could not start', error);
      }
    };
    start();
  }, [enabled, proReady, isPro]);

  const showPrivacyOptions = useCallback(async () => {
    const ads = getAdsModule();
    if (!ads) {
      return;
    }
    const info = await ads.AdsConsent.showPrivacyOptionsForm();
    setPrivacyOptionsRequired(
      info.privacyOptionsRequirementStatus === ads.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    );
  }, []);

  const value = useMemo(
    () => ({ adsReady: adsReady && !isPro, privacyOptionsRequired, showPrivacyOptions }),
    [adsReady, isPro, privacyOptionsRequired, showPrivacyOptions],
  );

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function useAds() {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error('useAds must be used within AdsProvider');
  }
  return context;
}
