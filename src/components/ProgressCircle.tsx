import { useTheme } from '@/hooks/useTheme';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type ProgressCircleProps = {
  progress: number;
  color: string;
};

export default function ProgressCircle({ progress, color }: ProgressCircleProps) {
  const { colors } = useTheme();
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const percent = Math.round(clampedProgress * 100);
  const radius = 20;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <View style={styles.container}>
      <Svg width={44} height={44} viewBox='0 0 44 44'>
        <Circle
          cx='22'
          cy='22'
          r={radius}
          stroke={colors.textSecondary}
          strokeOpacity={0.2}
          strokeWidth={strokeWidth}
          fill='none'
        />
        <Circle
          cx='22'
          cy='22'
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill='none'
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
          transform='rotate(-90 22 22)'
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.text, { color }]}>{percent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
