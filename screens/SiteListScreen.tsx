import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SiteCard } from '../components/sites/SiteCard';
import { SiteDetailModal } from '../components/sites/SiteDetailModal';
import { SiteFormModal } from '../components/sites/SiteFormModal';
import { useSiteStore } from '../store/siteStore';
import type { ConstructionSite, SiteFormInput } from '../types/site';

export function SiteListScreen() {
  const insets = useSafeAreaInsets();
  const sites = useSiteStore((s) => s.sites);
  const addSite = useSiteStore((s) => s.addSite);
  const updateSite = useSiteStore((s) => s.updateSite);

  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedSite, setSelectedSite] = useState<ConstructionSite | null>(null);
  const [editingSite, setEditingSite] = useState<ConstructionSite | null>(null);

  const openCreate = () => {
    setEditingSite(null);
    setFormVisible(true);
  };

  const openDetail = (site: ConstructionSite) => {
    setSelectedSite(site);
    setDetailVisible(true);
  };

  const openEdit = (site: ConstructionSite) => {
    setDetailVisible(false);
    setEditingSite(site);
    setFormVisible(true);
  };

  const handleSave = (input: SiteFormInput) => {
    if (editingSite) {
      updateSite(editingSite.id, input);
    } else {
      addSite(input);
    }
    setEditingSite(null);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.title}>현장 목록</Text>
          <Text style={styles.count}>총 {sites.length}개 현장</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>등록</Text>
        </Pressable>
      </View>

      <FlatList
        data={sites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SiteCard site={item} onPress={() => openDetail(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>등록된 현장이 없습니다</Text>
            <Text style={styles.emptyText}>등록 버튼으로 현장을 추가해 보세요.</Text>
          </View>
        }
      />

      <SiteFormModal
        visible={formVisible}
        editingSite={editingSite}
        onClose={() => {
          setFormVisible(false);
          setEditingSite(null);
        }}
        onSave={handleSave}
      />

      <SiteDetailModal
        visible={detailVisible}
        site={selectedSite}
        onClose={() => setDetailVisible(false)}
        onEdit={openEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  count: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
