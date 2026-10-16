import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRunningInExpoGo } from 'expo';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

type PurchasesModule = typeof import('react-native-purchases').default;

/** RevenueCat entitlement that both the subscription and the one-time purchase unlock. */
export const PRO_ENTITLEMENT = 'pro';

const PRO_CACHE_KEY = 'proStatus';
const DEV_PRO_KEY = 'devPro';

const apiKey = Platform.select({
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
});

/**
 * Purchases need the native RevenueCat module (a development or store build) and an API key.
 * In Expo Go, or before the keys are set up, Pro can only be simulated in development.
 */
export const purchasesSupported = Platform.OS !== 'web' && !isRunningInExpoGo() && !!apiKey;

let purchasesModule: PurchasesModule | null = null;

const getPurchases = (): PurchasesModule | null => {
  if (!purchasesSupported) {
    return null;
  }
  if (!purchasesModule) {
    // Loaded on demand so Expo Go never touches the native module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    purchasesModule = (require('react-native-purchases') as typeof import('react-native-purchases')).default;
    purchasesModule.configure({ apiKey: apiKey! });
  }
  return purchasesModule;
};

export type ProPackageKind = 'lifetime' | 'annual' | 'monthly' | 'other';

export type ProPackage = {
  id: string;
  kind: ProPackageKind;
  price: string;
  title: string;
  raw: PurchasesPackage;
};

type ProContextValue = {
  isPro: boolean;
  /** True once the saved Pro status has loaded, so ads never flash for Pro users. */
  ready: boolean;
  purchasesAvailable: boolean;
  packages: ProPackage[];
  loadPackages: () => Promise<void>;
  /** Resolves true when the purchase unlocked Pro, false if the person cancelled. */
  purchase: (pkg: ProPackage) => Promise<boolean>;
  /** Resolves true when a previous purchase was found. */
  restore: () => Promise<boolean>;
  /** Development only: turns Pro on or off without a purchase. */
  setDevPro: (value: boolean) => Promise<void>;
  devPro: boolean;
};

const ProContext = createContext<ProContextValue | undefined>(undefined);

const hasPro = (info: CustomerInfo) => info.entitlements.active[PRO_ENTITLEMENT] !== undefined;

const packageKind = (pkg: PurchasesPackage): ProPackageKind => {
  switch (pkg.packageType) {
    case 'LIFETIME':
      return 'lifetime';
    case 'ANNUAL':
      return 'annual';
    case 'MONTHLY':
      return 'monthly';
    default:
      return 'other';
  }
};

export function ProProvider({ children }: { children: ReactNode }) {
  const [entitled, setEntitled] = useState(false);
  const [devPro, setDevProState] = useState(false);
  const [ready, setReady] = useState(false);
  const [packages, setPackages] = useState<ProPackage[]>([]);

  const applyCustomerInfo = useCallback((info: CustomerInfo) => {
    const active = hasPro(info);
    setEntitled(active);
    AsyncStorage.setItem(PRO_CACHE_KEY, JSON.stringify(active));
  }, []);

  useEffect(() => {
    const load = async () => {
      const [cached, dev] = await AsyncStorage.multiGet([PRO_CACHE_KEY, DEV_PRO_KEY]);
      setEntitled(cached[1] === 'true');
      setDevProState(__DEV__ && dev[1] === 'true');
      setReady(true);

      const purchases = getPurchases();
      if (!purchases) {
        return;
      }
      purchases.addCustomerInfoUpdateListener(applyCustomerInfo);
      try {
        applyCustomerInfo(await purchases.getCustomerInfo());
      } catch {
        // Offline: keep the saved status.
      }
    };
    load();
  }, [applyCustomerInfo]);

  const loadPackages = useCallback(async () => {
    const purchases = getPurchases();
    if (!purchases) {
      return;
    }
    const offerings = await purchases.getOfferings();
    const available = offerings.current?.availablePackages ?? [];
    setPackages(
      available.map((pkg) => ({
        id: pkg.identifier,
        kind: packageKind(pkg),
        price: pkg.product.priceString,
        title: pkg.product.title,
        raw: pkg,
      })),
    );
  }, []);

  const purchase = useCallback(
    async (pkg: ProPackage) => {
      const purchases = getPurchases();
      if (!purchases) {
        return false;
      }
      try {
        const { customerInfo } = await purchases.purchasePackage(pkg.raw);
        applyCustomerInfo(customerInfo);
        return hasPro(customerInfo);
      } catch (error) {
        if ((error as { userCancelled?: boolean }).userCancelled) {
          return false;
        }
        throw error;
      }
    },
    [applyCustomerInfo],
  );

  const restore = useCallback(async () => {
    const purchases = getPurchases();
    if (!purchases) {
      return false;
    }
    const info = await purchases.restorePurchases();
    applyCustomerInfo(info);
    return hasPro(info);
  }, [applyCustomerInfo]);

  const setDevPro = useCallback(async (value: boolean) => {
    if (!__DEV__) {
      return;
    }
    setDevProState(value);
    await AsyncStorage.setItem(DEV_PRO_KEY, String(value));
  }, []);

  const value = useMemo(
    () => ({
      isPro: entitled || devPro,
      ready,
      purchasesAvailable: purchasesSupported,
      packages,
      loadPackages,
      purchase,
      restore,
      setDevPro,
      devPro,
    }),
    [entitled, devPro, ready, packages, loadPackages, purchase, restore, setDevPro],
  );

  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}

export function usePro() {
  const context = useContext(ProContext);
  if (!context) {
    throw new Error('usePro must be used within ProProvider');
  }
  return context;
}
