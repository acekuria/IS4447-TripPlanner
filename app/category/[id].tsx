import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { midtoneColor, PASTEL_BG_LIST } from '@/constants/theme';
import { useTheme } from '@/contexts/theme';
import { deleteCategory, getCategories, updateCategory } from '@/db/queries';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRESET_COLORS = PASTEL_BG_LIST;

export default function EditCategory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [habitCount, setHabitCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const cats = await getCategories();
      const cat = cats.find((c) => c.id === Number(id));
      if (cat) {
        setName(cat.name);
        setColor(cat.color);
      }
    };
    void load();
  }, [id]);

  const save = async () => {
    if (!name.trim()) return;
    await updateCategory(Number(id), name.trim(), color);
    router.back();
  };

  const handleDelete = () => {
    if (habitCount > 0) {
      Alert.alert('Cannot delete', `${name} has ${habitCount} habit${habitCount === 1 ? '' : 's'} assigned. Reassign or delete them first.`);
      return;
    }
    Alert.alert('Delete category', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteCategory(Number(id));
          if (result.success) {
            router.back();
          } else {
            Alert.alert('Cannot delete', result.reason ?? 'This category is in use.');
          }
        },
      },
    ]);
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
    dangerZone: { borderTopColor: colors.divider, borderTopWidth: 1, marginTop: 24, paddingTop: 20 },
    dangerTitle: {
      color: colors.danger,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Edit Category" onBack={() => router.back()} />
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

        <PrimaryButton label="Save Changes" onPress={save} />
        <View style={styles.cancel}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger zone</Text>
          <PrimaryButton label="Delete category" variant="danger" onPress={handleDelete} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
