import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
} & Pick<TextInputProps, 'secureTextEntry' | 'keyboardType' | 'autoCapitalize' | 'multiline' | 'numberOfLines'>;

// wraps a label + TextInput together so every form field looks consistent
export default function FormField({ label, value, onChangeText, placeholder, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text accessibilityRole="text" style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={`${label}, enter text`}
        placeholder={placeholder ?? label}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, rest.multiline && { height: 80, textAlignVertical: 'top' }]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
