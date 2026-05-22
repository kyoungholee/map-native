import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ConstructionSite } from '../../types/site';

const STATUS_COLORS: Record<ConstructionSite['status'], { bg: string; text: string }> = {
  진행중: { bg: '#dbeafe', text: '#1d4ed8' },
  준공: { bg: '#d1fae5', text: '#047857' },
  중단: { bg: '#fee2e2', text: '#b91c1c' },
};

type Props = {
  site: ConstructionSite;
  onPress: () => void;
};

export function SiteCard({ site, onPress }: Props) {
  const statusStyle = STATUS_COLORS[site.status];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={1}>
          {site.name}
        </Text>
        <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.badgeText, { color: statusStyle.text }]}>
            {site.status}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <Ionicons name="location-outline" size={16} color="#6b7280" />
        <Text style={styles.address} numberOfLines={2}>
          {site.address}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          책임자 {site.manager} · {site.phone}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
      </View>

      <Text style={styles.period}>
        {site.startDate} ~ {site.endDate}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
  },
  period: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
});
