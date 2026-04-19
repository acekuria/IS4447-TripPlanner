import { useTheme } from '@/contexts/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from './primary-button';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: Props) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
    iconWrap: {
      alignItems: 'center',
      backgroundColor: colors.bg,
      borderRadius: 999,
      height: 72,
      justifyContent: 'center',
      marginBottom: 16,
      width: 72,
    },
    title: { color: colors.text, fontSize: 17, fontWeight: '600', textAlign: 'center' },
    subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: 6, textAlign: 'center' },
    action: { marginTop: 20 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={36} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} compact />
        </View>
      ) : null}
    </View>
  );
}
