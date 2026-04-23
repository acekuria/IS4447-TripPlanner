import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { midtoneColor, PASTEL_BG_LIST } from '@/constants/theme';
import { useTheme } from '@/contexts/theme';
import { createCategory } from '@/db/queries';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRESET_COLORS = PASTEL_BG_LIST;

export default function AddCategory() {
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const save = async () => {
    if (!name.trim()) return;
    const result = await createCategory(name.trim(), color);
    if (!result.success) {
      Alert.alert('Cannot save', result.error);
      return;
    }
    router.back();
  };

  const styles = StyleSheet.create({
    safeArea: { backgroundColor: colors.bg, flex: 1, padding: 20 },
    content: { paddingBottom: 32 },
    label: { color: colors.textLabel, fontSize: 13, fontWeight: '600', marginBottom: 10, marginTop: 4 },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    colorSwatch: { borderRadius: 999, height: 40, width: 40 },
    colorSwatchSelected: { borderColor: colors.swatchBorder, borderWidth: 3 },
    preview: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
      padding: 14,
    },
    previewSwatch: { borderRadius: 999, height: 32, width: 32 },
    previewName: { color: colors.textStrong, fontSize: 16, fontWeight: '600' },
    cancel: { marginTop: 10 },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Add Category" onBack={() => router.back()} />
        <FormField label="Category Name" value={name} onChangeText={setName} />

        <Text style={styles.label}>Colour</Text>
        <View style={styles.colorGrid}>
          {PRESET_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              accessibilityRole="button"
              accessibilityLabel={`Select colour ${c}`}
              style={[
                styles.colorSwatch,
                { backgroundColor: midtoneColor(c) },
                color === c && styles.colorSwatchSelected,
              ]}
            />
          ))}
        </View>

        <View style={styles.preview}>
          <View style={[styles.previewSwatch, { backgroundColor: midtoneColor(color) }]} />
          <Text style={styles.previewName}>{name || 'Category name'}</Text>
        </View>

        <PrimaryButton label="Save Category" onPress={save} />
        <View style={styles.cancel}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
