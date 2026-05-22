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

  const overlays = useMemo(() => sitesToMapOverlays(sites), [sites]);

  const userMarkers: MapUserMarker[] = useMemo(
    () =>
      workers.map((w) => ({
        id: w.id,
        lat: w.lat,
        lng: w.lng,
        name: w.name,
        role: w.role,
        color: w.color,
      })),
    [workers],
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
        <Text style={styles.legendTitle}>근무 위치 (10초마다 갱신)</Text>
        {workers.map((w) => (
          <View key={w.id} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: w.color }]} />
            <Text style={styles.legendText}>
              {w.name} ({w.role})
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
  legendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
