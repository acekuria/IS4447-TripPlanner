import { useTheme } from '@/contexts/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export default function ScreenHeader({ title, subtitle, onBack }: Props) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    backButton: { alignItems: 'center', flexDirection: 'row', marginBottom: 12 },
    backButtonPressed: { opacity: 0.6 },
    backArrow: { color: colors.primary, fontSize: 18, marginRight: 4 },
    backLabel: { color: colors.primary, fontSize: 15, fontWeight: '600' },
    title: { color: colors.text, fontSize: 28, fontWeight: '700' },
    subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  });

  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}
