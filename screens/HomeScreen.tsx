import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NaverMapView } from '../components/NaverMapView';
import type { MapUserMarker } from '../lib/naverMapHtml';
import { sitesToMapOverlays } from '../lib/siteMapOverlays';
import { useSiteStore } from '../store/siteStore';
import { useWorkLocationStore } from '../store/workLocationStore';

export function HomeScreen() {
  const sites = useSiteStore((s) => s.sites);
  const workers = useWorkLocationStore((s) => s.workers);
  const equipment = useWorkLocationStore((s) => s.equipment);

  const overlays = useMemo(() => sitesToMapOverlays(sites), [sites]);

  const userMarkers: MapUserMarker[] = useMemo(
    () => [
      ...workers.map((w) => ({
        id: w.id,
        lat: w.lat,
        lng: w.lng,
        name: w.name,
        role: w.role,
        color: w.color,
        kind: 'person' as const,
      })),
      ...equipment.map((e) => ({
        id: e.id,
        lat: e.lat,
        lng: e.lng,
        name: e.name,
        role: e.label,
        color: e.color,
        kind: e.kind,
      })),
    ],
    [workers, equipment],
  );

  const mapKey = useMemo(() => sites.map((s) => s.id).join(','), [sites]);

  return (
    <View style={styles.container}>
      <NaverMapView
        style={styles.map}
        overlays={overlays}
        userMarkers={userMarkers}
        mapKey={mapKey}
      />

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>현장 위치 (10초마다 갱신)</Text>

        <Text style={styles.legendSection}>인력</Text>
        {workers.map((w) => (
          <View key={w.id} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: w.color }]} />
            <Text style={styles.legendText}>
              {w.name} ({w.role})
            </Text>
          </View>
        ))}

        <Text style={[styles.legendSection, styles.legendSectionSpaced]}>장비</Text>
        {equipment.map((e) => (
          <View key={e.id} style={styles.legendRow}>
            <View
              style={[
                e.kind === 'dump_truck' ? styles.legendTruck : styles.legendForklift,
                { backgroundColor: e.color },
              ]}
            />
            <Text style={styles.legendText}>
              {e.label} · {e.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  legendSection: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  legendSectionSpaced: {
    marginTop: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  legendTruck: {
    width: 16,
    height: 10,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#fff',
  },
  legendForklift: {
    width: 14,
    height: 10,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#fff',
    borderTopLeftRadius: 0,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
