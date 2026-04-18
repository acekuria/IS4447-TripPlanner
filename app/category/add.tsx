import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { createCategory } from '@/db/queries';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRESET_COLORS = [
  '#22C55E', '#3B82F6', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#F97316', '#14B8A6',
  '#6366F1', '#64748B', '#0EA5E9', '#84CC16',
];

export default function AddCategory() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const save = async () => {
    if (!name.trim()) return;
    await createCategory(name.trim(), color);
    router.back();
  };

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
                { backgroundColor: c },
                color === c && styles.colorSwatchSelected,
              ]}
            />
          ))}
        </View>

        <View style={styles.preview}>
          <View style={[styles.previewSwatch, { backgroundColor: color }]} />
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

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    padding: 20,
  },
  content: {
    paddingBottom: 32,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorSwatch: {
    borderRadius: 999,
    height: 40,
    width: 40,
  },
  colorSwatchSelected: {
    borderColor: '#0F172A',
    borderWidth: 3,
  },
  preview: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    padding: 14,
  },
  previewSwatch: {
    borderRadius: 999,
    height: 32,
    width: 32,
  },
  previewName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  cancel: {
    marginTop: 10,
  },
});
