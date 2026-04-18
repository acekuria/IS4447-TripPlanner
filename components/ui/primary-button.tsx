import { Colors } from '@/constants/theme';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  compact?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'teal' | 'danger';
};

export default function PrimaryButton({
  label,
  onPress,
  compact = false,
  disabled = false,
  variant = 'primary',
}: Props) {
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
          compact ? styles.compactLabel : null,
          disabled ? styles.disabledLabel : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  secondary: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  teal: {
    backgroundColor: Colors.teal,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  compact: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  disabled: {
    backgroundColor: Colors.border,
    borderColor: Colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryLabel: {
    color: Colors.text,
  },
  tealLabel: {
    color: Colors.white,
  },
  compactLabel: {
    fontSize: 13,
  },
  disabledLabel: {
    color: Colors.muted,
  },
});
