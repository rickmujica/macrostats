import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { localizeTypedNumber } from '@/utils/numbers';
import { useMemo } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';

type LabeledTextInputProps = TextInputProps & {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export default function LabeledTextInput({
  label,
  style,
  wrapperStyle,
  labelStyle,
  containerStyle,
  ...props
}: LabeledTextInputProps) {
  const { colors } = useTheme();
  const { locale } = useTranslation();
  const { keyboardType, onChangeText } = props;
  // Number fields show the app language's decimal separator whichever key the user pressed.
  // Not on web, where rewriting the text moves the caret to the end; parseAmount reads either separator.
  const handleChangeText =
    keyboardType === 'decimal-pad' && onChangeText && Platform.OS !== 'web'
      ? (text: string) => onChangeText(localizeTypedNumber(text, locale))
      : onChangeText;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginTop: 16,
        },
        label: {
          color: colors.textSecondary,
          fontSize: 12,
          marginBottom: 6,
          marginLeft: 4,
          fontWeight: '600',
        },
        inputWrapper: {
          borderWidth: 1,
          borderColor: colors.textSecondary,
          borderRadius: 10,
          backgroundColor: colors.surface,
        },
        input: {
          color: colors.text,
          fontSize: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
        },
      }),
    [colors],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <View style={[styles.inputWrapper, wrapperStyle]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textSecondary}
          {...props}
          onChangeText={handleChangeText}
        />
      </View>
    </View>
  );
}
