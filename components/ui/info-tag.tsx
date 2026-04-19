import { Colors, pastelTextColor } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  accentColor?: string;
};

export default function InfoTag({ label, value, accentColor }: Props) {
  const bg = accentColor ?? Colors.tealLight;
  const textColor = pastelTextColor(bg);

  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <Text style={[styles.value, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 999,
    flexDirection: 'row',
    marginBottom: 6,
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
  },
});
