import { useTranslation } from '@/i18n';
import { usePro } from '@/pro/ProProvider';
import { track } from '@/services/analytics';
import { lookupBarcode } from '@/utils/openFoodFacts';
import { setPendingScan } from '@/utils/scanResult';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router, useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e'] as const;

export default function ScanScreen() {
  const { t, locale } = useTranslation();
  const { isPro } = usePro();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [looking, setLooking] = useState(false);
  // The camera reports the same code many times per second; handle one at a time.
  const handling = useRef(false);

  useEffect(() => {
    if (!isPro) {
      router.replace('/pro');
    }
  }, [isPro]);

  const resume = () => {
    handling.current = false;
    setLooking(false);
  };

  const handleScan = async ({ data }: BarcodeScanningResult) => {
    if (handling.current) {
      return;
    }
    handling.current = true;
    setLooking(true);
    Haptics.selectionAsync();

    try {
      const food = await lookupBarcode(data, locale);
      if (!food) {
        track('barcode_scanned', { found: false });
        Alert.alert(t('productNotFoundTitle'), t('productNotFound'), [
          { text: t('enterManually'), onPress: () => router.back() },
          { text: t('scanAgain'), onPress: resume },
        ]);
        return;
      }
      track('barcode_scanned', { found: true });
      setPendingScan(food);
      router.back();
    } catch {
      Alert.alert(t('error'), t('lookupFailed'), [
        { text: t('cancel'), style: 'cancel', onPress: () => router.back() },
        { text: t('scanAgain'), onPress: resume },
      ]);
    }
  };

  const closeButton = (
    <TouchableOpacity
      style={[styles.close, { top: insets.top + 12 }]}
      onPress={() => router.back()}
      hitSlop={10}
      accessibilityRole='button'
      accessibilityLabel={t('close')}
    >
      <Ionicons name='close' size={28} color='#ffffff' />
    </TouchableOpacity>
  );

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.screen, styles.center]}>
        {closeButton}
        <Ionicons name='camera-outline' size={48} color='#ffffff' />
        <Text style={styles.message}>{t('cameraPermission')}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
        >
          <Text style={styles.buttonText}>{permission.canAskAgain ? t('allowCamera') : t('openSettings')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing='back'
          barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
          onBarcodeScanned={looking ? undefined : handleScan}
        />
      )}
      {closeButton}
      <View style={styles.frame} pointerEvents='none' />
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {looking ? (
          <ActivityIndicator color='#ffffff' />
        ) : (
          <Text style={styles.hint}>{t('scanHint')}</Text>
        )}
        <Text style={styles.credit}>{t('offCredit')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  close: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  frame: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    top: '36%',
    height: 140,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    gap: 10,
  },
  hint: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  credit: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  message: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#1766ff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
