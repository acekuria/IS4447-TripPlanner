import { useTheme } from '@/contexts/theme';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  compact?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'teal' | 'danger' | 'success';
};

export default function PrimaryButton({
  label,
  onPress,
  compact = false,
  disabled = false,
  variant = 'primary',
}: Props) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    secondary: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
    teal: { backgroundColor: colors.teal },
    danger: { backgroundColor: colors.danger },
    success: { backgroundColor: '#DCFCE7', borderColor: '#16A34A', borderWidth: 1 },
    compact: { alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 12, paddingVertical: 8 },
    disabled: { backgroundColor: colors.border, borderColor: colors.border },
    pressed: { opacity: 0.85 },
    label: { color: colors.card, fontSize: 15, fontWeight: '600' },
    secondaryLabel: { color: colors.text },
    tealLabel: { color: '#FFFFFF' },
    successLabel: { color: '#15803D' },
    compactLabel: { fontSize: 13 },
    disabledLabel: { color: colors.textMuted },
  });

  return (
    <Pressable
      accessibilityLabel={`${label}, click to perform action`}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' ? styles.secondary : null,
        variant === 'teal' ? styles.teal : null,
        variant === 'danger' ? styles.danger : null,
        variant === 'success' ? styles.success : null,
        compact ? styles.compact : null,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'secondary' ? styles.secondaryLabel : null,
          variant === 'teal' ? styles.tealLabel : null,
          variant === 'success' ? styles.successLabel : null,
          compact ? styles.compactLabel : null,
          disabled ? styles.disabledLabel : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
