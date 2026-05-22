import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ConstructionSite } from '../../types/site';
import { ProfileInfoRow } from '../ProfileInfoRow';

type Props = {
  visible: boolean;
  site: ConstructionSite | null;
  onClose: () => void;
  onEdit: (site: ConstructionSite) => void;
};

export function SiteDetailModal({ visible, site, onClose, onEdit }: Props) {
  const insets = useSafeAreaInsets();

  if (!site) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={28} color="#374151" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>{site.name}</Text>
          <Text style={styles.subtitle}>{site.status}</Text>
        </View>
        <Pressable onPress={() => onEdit(site)} hitSlop={8}>
          <Text style={styles.editLink}>수정</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.hint}>
          현장 경계는 홈 탭 지도에서 파란색 선으로 확인할 수 있습니다.
        </Text>

        <View style={styles.section}>
          <ProfileInfoRow label="주소" value={site.address} />
          <ProfileInfoRow label="현장 책임자" value={site.manager} />
          <ProfileInfoRow label="연락처" value={site.phone} />
          <ProfileInfoRow label="착공일" value={site.startDate} />
          <ProfileInfoRow label="준공예정일" value={site.endDate} />
          <ProfileInfoRow label="북쪽 (위도)" value={String(site.boundary.northLat)} />
          <ProfileInfoRow label="동쪽 (경도)" value={String(site.boundary.eastLng)} />
          <ProfileInfoRow label="남쪽 (위도)" value={String(site.boundary.southLat)} />
          <ProfileInfoRow label="서쪽 (경도)" value={String(site.boundary.westLng)} />
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 12,
  },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#2563eb', marginTop: 2, fontWeight: '500' },
  editLink: { fontSize: 16, fontWeight: '600', color: '#2563eb' },
  scroll: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  hint: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 10,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
});
