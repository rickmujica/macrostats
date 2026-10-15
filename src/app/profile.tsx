import ProfileForm from '@/components/ProfileForm';
import { useToast } from '@/components/Toast';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { calculateGoals, getSettings, updateSettings, type UserProfile } from '@/storage/settings';
import { useGlobalStyles } from '@/styles/global';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const themeStyles = useGlobalStyles();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    getSettings().then((settings) => setProfile(settings.profile));
  }, []);

  if (!profile) {
    return <View style={themeStyles.container} />;
  }

  return (
    <ProfileForm
      title={t('yourProfile')}
      submitLabel={t('saveProfile')}
      initialProfile={profile}
      showRecalculateOption
      headerAction={
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>{t('cancel')}</Text>
        </TouchableOpacity>
      }
      onSubmit={async (nextProfile, { recalculateGoals }) => {
        await updateSettings({
          profile: nextProfile,
          ...(recalculateGoals ? { goals: calculateGoals(nextProfile) } : {}),
        });
        showToast(recalculateGoals ? t('profileAndGoalsSaved') : t('profileSaved'));
        router.back();
      }}
    />
  );
}
