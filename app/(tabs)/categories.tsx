import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { deleteCategory, getCategoriesWithCount } from '@/db/queries';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

type CategoryWithCount = {
  id: number;
  name: string;
  color: string;
  habitCount: number;
};

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);

  const load = useCallback(async () => {
    const rows = await getCategoriesWithCount();
    setCategories(rows);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const handleDelete = (cat: CategoryWithCount) => {
    if (cat.habitCount > 0) {
      Alert.alert(
        'Cannot delete',
        `${cat.name} has ${cat.habitCount} habit${cat.habitCount === 1 ? '' : 's'} assigned. Reassign or delete them first.`
      );
      return;
    }
    Alert.alert('Delete category', `Delete "${cat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCategory(cat.id);
          void load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Categories" subtitle={`${categories.length} categories`} />
      <PrimaryButton label="Add Category" onPress={() => router.push('/category/add')} />
      <ScrollView contentContainerStyle={styles.list}>
        {categories.length === 0 ? (
          <Text style={styles.empty}>No categories yet. Add one to get started.</Text>
        ) : (
          categories.map((cat) => (
            <View key={cat.id} style={styles.card}>
              <View style={styles.left}>
                <View style={[styles.swatch, { backgroundColor: cat.color }]} />
                <View>
                  <Text style={styles.name}>{cat.name}</Text>
                  <Text style={styles.count}>
                    {cat.habitCount} habit{cat.habitCount === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => router.push({ pathname: '/category/[id]', params: { id: cat.id.toString() } })}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${cat.name}`}
                  style={styles.actionButton}
                >
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${cat.name}`}
                  style={styles.actionButton}
                >
                  <Text style={[styles.deleteText, cat.habitCount > 0 && styles.deleteDisabled]}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  list: {
    paddingTop: 14,
    paddingBottom: 24,
  },
  empty: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 24,
    textAlign: 'center',
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 14,
  },
  left: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  swatch: {
    borderRadius: 999,
    height: 36,
    width: 36,
  },
  name: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  count: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  editText: {
    color: '#0F766E',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteDisabled: {
    color: '#CBD5E1',
  },
});
