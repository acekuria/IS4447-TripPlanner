import { useTheme } from '@/contexts/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onBack?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    label?: string;
  };
};

export default function ScreenHeader({ title, subtitle, icon, onBack, rightAction }: Props) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    backButton: { alignItems: 'center', flexDirection: 'row', marginBottom: 12 },
    backButtonPressed: { opacity: 0.6 },
    backArrow: { color: colors.primary, fontSize: 18, marginRight: 4 },
    backLabel: { color: colors.primary, fontSize: 15, fontWeight: '600' },
    titleRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
    titleContent: { flex: 1 },
    titleLine: { alignItems: 'center', flexDirection: 'row', gap: 10 },
    iconBadge: {
      alignItems: 'center',
      backgroundColor: colors.primaryLight,
      borderRadius: 10,
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
    title: { color: colors.text, fontSize: 28, fontWeight: '700' },
    subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
    rightActionBtn: { marginTop: 4, padding: 4 },
    rightActionBtnPressed: { opacity: 0.6 },
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
      <View style={styles.titleRow}>
        <View style={styles.titleContent}>
          <View style={styles.titleLine}>
            {icon ? (
              <View style={styles.iconBadge}>
                <Ionicons name={icon} size={20} color={colors.primary} />
              </View>
            ) : null}
            <Text style={styles.title}>{title}</Text>
          </View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightAction ? (
          <Pressable
            onPress={rightAction.onPress}
            accessibilityRole="button"
            accessibilityLabel={rightAction.label ?? 'Action'}
            style={({ pressed }) => [styles.rightActionBtn, pressed && styles.rightActionBtnPressed]}
          >
            <Ionicons name={rightAction.icon} size={22} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
