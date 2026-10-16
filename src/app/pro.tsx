import { useToast } from '@/components/Toast';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { usePro, type ProPackage } from '@/pro/ProProvider';
import { track } from '@/services/analytics';
import { useGlobalStyles } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const KIND_ORDER = { annual: 0, lifetime: 1, monthly: 2, other: 3 };

export default function ProScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const themeStyles = useGlobalStyles();
  const { showToast } = useToast();
  const { isPro, purchasesAvailable, packages, loadPackages, purchase, restore, devPro, setDevPro } = usePro();
  const [loading, setLoading] = useState(purchasesAvailable);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    track('paywall_viewed');
    if (!purchasesAvailable) {
      return;
    }
    loadPackages()
      .catch(() => Alert.alert(t('error'), t('storeUnavailable')))
      .finally(() => setLoading(false));
  }, [purchasesAvailable, loadPackages, t]);

  const sortedPackages = [...packages].sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);

  const packageLabel = (pkg: ProPackage) =>
    pkg.kind === 'lifetime'
      ? t('proLifetime')
      : pkg.kind === 'annual'
        ? t('proAnnual')
        : pkg.kind === 'monthly'
          ? t('proMonthly')
          : pkg.title;

  const packageNote = (pkg: ProPackage) =>
    pkg.kind === 'lifetime' ? t('proLifetimeNote') : t('proSubscriptionNote');

  const handlePurchase = async (pkg: ProPackage) => {
    setBusy(true);
    try {
      if (await purchase(pkg)) {
        track('pro_purchased', { kind: pkg.kind });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(t('proThanks'));
        router.back();
      }
    } catch {
      Alert.alert(t('error'), t('purchaseError'));
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    try {
      const restored = await restore();
      if (restored) {
        track('pro_restored');
      }
      Alert.alert(t('restorePurchases'), restored ? t('restoreSuccess') : t('restoreNothing'));
    } catch {
      Alert.alert(t('error'), t('purchaseError'));
    } finally {
      setBusy(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        content: { paddingBottom: 48 },
        hero: { alignItems: 'center', marginTop: 24 },
        heroTitle: { color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 12 },
        heroText: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 8 },
        benefit: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
        benefitText: { color: colors.text, fontSize: 16, flex: 1 },
        packages: { marginTop: 28, gap: 12 },
        package: {
          borderWidth: 1.5,
          borderColor: colors.primary,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
        },
        packageText: { flex: 1 },
        packageTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
        packageNote: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
        packagePrice: { color: colors.primary, fontSize: 17, fontWeight: '800' },
        active: {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginTop: 28,
        },
        activeText: { color: colors.text, fontSize: 16, flex: 1 },
        notice: { color: colors.textSecondary, fontSize: 14, marginTop: 28, lineHeight: 20 },
        restore: { alignItems: 'center', marginTop: 24 },
        restoreText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
        legal: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 20 },
        devRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
        devText: { color: colors.textSecondary, fontSize: 14, flex: 1 },
      }),
    [colors],
  );

  const benefits: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
    { icon: 'eye-off-outline', text: t('proBenefitNoAds') },
    { icon: 'barcode-outline', text: t('proBenefitScanner') },
    { icon: 'document-text-outline', text: t('proBenefitCsv') },
  ];

  return (
    <ScrollView style={themeStyles.container} contentContainerStyle={styles.content}>
      <View style={themeStyles.header}>
        <View />
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>{t('close')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Ionicons name='star' size={44} color='#ffd93d' />
        <Text style={styles.heroTitle}>MacroStats Pro</Text>
        <Text style={styles.heroText}>{t('proSubtitle')}</Text>
      </View>

      {benefits.map((benefit) => (
        <View key={benefit.icon} style={styles.benefit}>
          <Ionicons name={benefit.icon} size={24} color={colors.primary} />
          <Text style={styles.benefitText}>{benefit.text}</Text>
        </View>
      ))}

      {isPro ? (
        <View style={styles.active}>
          <Ionicons name='checkmark-circle' size={24} color='#6bcb77' />
          <Text style={styles.activeText}>{t('proActive')}</Text>
        </View>
      ) : !purchasesAvailable ? (
        <Text style={styles.notice}>{t('purchasesUnavailable')}</Text>
      ) : loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.primary} />
      ) : sortedPackages.length === 0 ? (
        <Text style={styles.notice}>{t('storeUnavailable')}</Text>
      ) : (
        <View style={styles.packages}>
          {sortedPackages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={styles.package}
              onPress={() => handlePurchase(pkg)}
              disabled={busy}
              accessibilityRole='button'
            >
              <View style={styles.packageText}>
                <Text style={styles.packageTitle}>{packageLabel(pkg)}</Text>
                <Text style={styles.packageNote}>{packageNote(pkg)}</Text>
              </View>
              <Text style={styles.packagePrice}>{pkg.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {purchasesAvailable && (
        <TouchableOpacity style={styles.restore} onPress={handleRestore} disabled={busy}>
          <Text style={styles.restoreText}>{t('restorePurchases')}</Text>
        </TouchableOpacity>
      )}

      {purchasesAvailable && !isPro && <Text style={styles.legal}>{t('proLegal')}</Text>}

      {__DEV__ && (
        <View style={styles.devRow}>
          <Text style={styles.devText}>{t('devProToggle')}</Text>
          <Switch
            value={devPro}
            onValueChange={setDevPro}
            trackColor={{ false: colors.surface, true: colors.primary }}
          />
        </View>
      )}
    </ScrollView>
  );
}
