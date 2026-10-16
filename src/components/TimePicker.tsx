import { useTranslation } from '@/i18n';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Button, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

type TimePickerProps = {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  buttonTitle?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
};

export default function TimePicker({
  label,
  value,
  onChange,
  buttonTitle,
  containerStyle,
  labelStyle,
  valueStyle,
}: TimePickerProps) {
  const { t, locale } = useTranslation();
  const [show, setShow] = useState(false);
  const resolvedButtonTitle = buttonTitle ?? t('pickTime');
  const formattedTime = value.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  // Match the dialog's clock to the label's (en-US uses 12-hour, most other locales 24-hour).
  const is24Hour = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle !== 'h12';

  return (
    <View style={containerStyle}>
      {label ? <Text style={labelStyle}>{label}</Text> : null}
      <Text style={valueStyle}>{t('selectedTime')} {formattedTime}</Text>
      <Button title={resolvedButtonTitle} onPress={() => setShow(true)} />

      {show && (
        <DateTimePicker
          value={value}
          mode="time"
          is24Hour={is24Hour}
          presentation="dialog"
          onValueChange={(_, selectedDate) => {
            setShow(false);
            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
          onDismiss={() => setShow(false)}
        />
      )}
    </View>
  );
}
