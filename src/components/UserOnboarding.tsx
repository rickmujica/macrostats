import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { UserProfile } from '@/storage/settings';
import { useGlobalStyles } from '@/styles/global';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type UserOnboardingProps = {
  onComplete: (profile: UserProfile) => void;
};

export default function UserOnboarding({ onComplete }: UserOnboardingProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const themeStyles = useGlobalStyles();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        subtitle: {
          fontSize: 16,
          color: colors.textSecondary,
          marginTop: 24,
          marginBottom: 12,
        },
        input: {
          backgroundColor: colors.surface,
          color: colors.text,
          padding: 16,
          borderRadius: 10,
          fontSize: 16,
          marginTop: 12,
        },
        optionRow: {
          flexDirection: 'row',
          gap: 10,
          flexWrap: 'wrap',
        },
        option: {
          borderWidth: 1,
          borderColor: colors.surface,
          borderRadius: 10,
          paddingVertical: 12,
          paddingHorizontal: 14,
          backgroundColor: colors.surface,
        },
        optionSelected: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        optionText: {
          color: colors.text,
        },
        selectedOptionText: {
          color: colors.background,
          fontWeight: '700',
        },
        button: {
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 10,
          alignItems: 'center',
          marginTop: 30,
          marginBottom: 40,
        },
        buttonText: {
          color: colors.background,
          fontSize: 16,
          fontWeight: 'bold',
        },
      }),
    [colors],
  );

  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [gender, setGender] = useState<UserProfile['gender']>('male');
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>('moderate');
  const [goal, setGoal] = useState<UserProfile['goal']>('maintain');

  const handleSubmit = () => {
    const profile: UserProfile = {
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      gender,
      activityLevel,
      goal,
    };

    if (
      !profile.age ||
      !profile.height ||
      !profile.weight ||
      profile.age <= 0 ||
      profile.height <= 0 ||
      profile.weight <= 0
    ) {
      Alert.alert(t('invalidProfile'));
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(profile);
  };

  return (
    <ScrollView style={themeStyles.container}>
      <Text style={themeStyles.title}>{t('onboardingTitle')}</Text>
      <Text style={styles.subtitle}>{t('goal')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('age')}
        placeholderTextColor={colors.textSecondary}
        value={age}
        keyboardType='numeric'
        onChangeText={setAge}
      />
      <TextInput
        style={styles.input}
        placeholder={t('height')}
        placeholderTextColor={colors.textSecondary}
        value={height}
        keyboardType='numeric'
        onChangeText={setHeight}
      />
      <TextInput
        style={styles.input}
        placeholder={t('weight')}
        placeholderTextColor={colors.textSecondary}
        value={weight}
        keyboardType='numeric'
        onChangeText={setWeight}
      />

      <Text style={styles.subtitle}>{t('gender')}</Text>
      <View style={styles.optionRow}>
        {['male', 'female', 'other'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              gender === option && styles.optionSelected,
            ]}
            onPress={() => setGender(option as UserProfile['gender'])}
          >
            <Text
              style={
                gender === option
                  ? styles.selectedOptionText
                  : styles.optionText
              }
            >
              {t(option === 'male' ? 'genderMale' : option === 'female' ? 'genderFemale' : 'genderOther')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>{t('activityLevel')}</Text>
      <View style={styles.optionRow}>
        {(['low', 'moderate', 'high'] as UserProfile['activityLevel'][]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              activityLevel === option && styles.optionSelected,
            ]}
            onPress={() => setActivityLevel(option)}
          >
            <Text
              style={
                activityLevel === option
                  ? styles.selectedOptionText
                  : styles.optionText
              }
            >
              {t(option === 'low' ? 'activityLow' : option === 'moderate' ? 'activityModerate' : 'activityHigh')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>{t('goal')}</Text>
      <View style={styles.optionRow}>
        {(['maintain', 'lose', 'gain'] as UserProfile['goal'][]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              goal === option && styles.optionSelected,
            ]}
            onPress={() => setGoal(option)}
          >
            <Text
              style={
                goal === option
                  ? styles.selectedOptionText
                  : styles.optionText
              }
            >
              {t(option === 'maintain' ? 'goalMaintain' : option === 'lose' ? 'goalLose' : 'goalGain')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{t('saveProfile')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
