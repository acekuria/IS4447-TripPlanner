import { useTheme } from '@/contexts/theme';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
} & Pick<TextInputProps, 'secureTextEntry' | 'keyboardType' | 'autoCapitalize' | 'multiline' | 'numberOfLines'>;

export default function FormField({ label, value, onChangeText, placeholder, ...rest }: Props) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    wrapper: { marginBottom: 12 },
    label: { color: colors.textLabel, fontSize: 13, fontWeight: '600', marginBottom: 6 },
    input: {
      backgroundColor: colors.inputBg,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      borderWidth: 1,
      color: colors.text,
      fontSize: 15,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
  });

  return (
    <View style={styles.wrapper}>
      <Text accessibilityRole="text" style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={`${label}, enter text`}
        placeholder={placeholder ?? label}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, rest.multiline && { height: 80, textAlignVertical: 'top' }]}
        {...rest}
      />
    </View>
  );
}
