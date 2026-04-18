import { Colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  accentColor?: string;
};

function withAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

export default function InfoTag({ label, value, accentColor }: Props) {
  const accent = accentColor ?? null;

  return (
    <View
      style={[
        styles.tag,
        accent && {
          backgroundColor: withAlpha(accent, '2E'),
          borderColor: withAlpha(accent, 'A6'),
        },
      ]}
    >
      <Text style={[styles.label, accent && { color: accent }]}>{label}</Text>
      <Text style={[styles.value, accent && { color: Colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: Colors.tealLight,
    borderColor: 'transparent',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    color: Colors.tealDark,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  value: {
    color: Colors.teal,
    fontSize: 12,
    fontWeight: '600',
  },
});
