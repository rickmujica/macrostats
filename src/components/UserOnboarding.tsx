import LabeledTextInput from '@/components/LabeledTextInput';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { UserProfile } from '@/storage/settings';
import { useGlobalStyles } from '@/styles/global';
import { parseAmount } from '@/utils/numbers';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type UserOnboardingProps = {
  onComplete: (profile: UserProfile) => void;
};

type OptionRowStyles = {
  optionRow: object;
  option: object;
  optionSelected: object;
  optionText: object;
  selectedOptionText: object;
};

type OptionRowProps<T extends string> = {
  options: { key: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
  styles: OptionRowStyles;
};

function OptionRow<T extends string>({ options, selected, onSelect, styles }: OptionRowProps<T>) {
  return (
    <View style={styles.optionRow}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[styles.option, selected === option.key && styles.optionSelected]}
          onPress={() => onSelect(option.key)}
          accessibilityRole='button'
          accessibilityState={{ selected: selected === option.key }}
        >
          <Text style={selected === option.key ? styles.selectedOptionText : styles.optionText}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function UserOnboarding({ onComplete }: UserOnboardingProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const themeStyles = useGlobalStyles();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          paddingBottom: 40,
        },
        intro: {
          fontSize: 15,
          lineHeight: 21,
          color: colors.textSecondary,
          marginTop: 12,
        },
        subtitle: {
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 24,
          marginBottom: 12,
        },
        row: {
          flexDirection: 'row',
          gap: 10,
        },
        rowInput: {
          flex: 1,
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
        },
        buttonText: {
          color: colors.background,
          fontSize: 16,
          fontWeight: 'bold',
        },
      }),
    [colors],
  );

  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<UserProfile['gender']>('male');
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>('moderate');
  const [goal, setGoal] = useState<UserProfile['goal']>('maintain');

  const handleSubmit = () => {
    const parsedAge = parseAmount(age);
    const parsedHeight = parseAmount(height);
    const parsedWeight = parseAmount(weight);

    if (!parsedAge || !parsedHeight || !parsedWeight) {
      Alert.alert(t('error'), t('invalidProfile'));
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({
      age: parsedAge,
      height: parsedHeight,
      weight: parsedWeight,
      gender,
      activityLevel,
      goal,
    });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={themeStyles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps='handled'
      >
        <Text style={themeStyles.title}>{t('onboardingTitle')}</Text>
        <Text style={styles.intro}>{t('onboardingIntro')}</Text>

        <View style={styles.row}>
          <LabeledTextInput
            label={t('age')}
            keyboardType='decimal-pad'
            value={age}
            onChangeText={setAge}
            containerStyle={styles.rowInput}
          />
          <LabeledTextInput
            label={t('height')}
            keyboardType='decimal-pad'
            value={height}
            onChangeText={setHeight}
            containerStyle={styles.rowInput}
          />
        </View>
        <LabeledTextInput
          label={t('weight')}
          keyboardType='decimal-pad'
          value={weight}
          onChangeText={setWeight}
        />

        <Text style={styles.subtitle}>{t('gender')}</Text>
        <OptionRow
          options={[
            { key: 'male', label: t('genderMale') },
            { key: 'female', label: t('genderFemale') },
            { key: 'other', label: t('genderOther') },
          ]}
          selected={gender}
          onSelect={setGender}
          styles={styles}
        />

        <Text style={styles.subtitle}>{t('activityLevel')}</Text>
        <OptionRow
          options={[
            { key: 'low', label: t('activityLow') },
            { key: 'moderate', label: t('activityModerate') },
            { key: 'high', label: t('activityHigh') },
          ]}
          selected={activityLevel}
          onSelect={setActivityLevel}
          styles={styles}
        />

        <Text style={styles.subtitle}>{t('goal')}</Text>
        <OptionRow
          options={[
            { key: 'maintain', label: t('goalMaintain') },
            { key: 'lose', label: t('goalLose') },
            { key: 'gain', label: t('goalGain') },
          ]}
          selected={goal}
          onSelect={setGoal}
          styles={styles}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{t('getStarted')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
