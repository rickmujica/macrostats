import { useTheme } from '@/hooks/useTheme';
import { Switch, type SwitchProps } from 'react-native';

/**
 * A Switch in the app's colors, so every toggle looks the same (Android's default thumb is green).
 * The thumb stays white in both themes so it stands out from the dark background and from the track.
 */
export default function ThemedSwitch(props: SwitchProps) {
  const { colors } = useTheme();

  return (
    <Switch
      trackColor={{ false: colors.textSecondary, true: colors.primary }}
      thumbColor='#ffffff'
      {...props}
    />
  );
}
