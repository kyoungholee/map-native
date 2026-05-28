import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NaverMapView } from '../components/NaverMapView';
import { MOCK_WORK_SITE } from '../data/mockWorkLocation';
import type { MapMarkerKind, MapUserMarker } from '../lib/naverMapHtml';
import { clampLatLngToBoundary, isLatLngInsideBoundary } from '../lib/siteBoundary';
import { sitesToMapOverlays } from '../lib/siteMapOverlays';
import { useSiteStore } from '../store/siteStore';
import {
  useWorkLocationStore,
} from '../store/workLocationStore';
import type { ConstructionSite } from '../types/site';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { useConstructionSitesQuery } from '../hooks/useConstructionSites';
import { useTrackablesQuery, useUpdateTrackableLocationMutation } from '../hooks/useTrackables';

function formatUpdatedAt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function kindLabel(kind: MapMarkerKind) {
  if (kind === 'dump_truck') return '덤프트럭';
  if (kind === 'forklift') return '포크레인';
  return '인력';
}

type TrackableDetail = {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  updatedAt: string;
  kind: MapMarkerKind;
  lat: number;
  lng: number;
};

type Worker = {
  id: string;
  siteId: string;
  name: string;
  role: string;
  color: string;
  updatedAt: string;
  lat: number;
  lng: number;
};

type Equipment = {
  id: string;
  siteId: string;
  kind: MapMarkerKind;
  name: string;
  label: string;
  color: string;
  updatedAt: string;
  lat: number;
  lng: number;
};

function workerToDetail(w: Worker): TrackableDetail {
  return {
    id: w.id,
    name: w.name,
    subtitle: w.role,
    color: w.color,
    updatedAt: w.updatedAt,
    kind: 'person',
    lat: w.lat,
    lng: w.lng,
  };
}

function equipmentToDetail(e: Equipment): TrackableDetail {
  return {
    id: e.id,
    name: e.name,
    subtitle: e.label,
    color: e.color,
    updatedAt: e.updatedAt,
    kind: e.kind,
    lat: e.lat,
    lng: e.lng,
  };
}

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const localSites = useSiteStore((s) => s.sites);
  const localWorkers = useWorkLocationStore((s) => s.workers);
  const localEquipment = useWorkLocationStore((s) => s.equipment);

  const sitesQuery = useConstructionSitesQuery();
  const trackablesQuery = useTrackablesQuery();
  const updateTrackableLocationMutation = useUpdateTrackableLocationMutation();

  const sites = isSupabaseConfigured ? (sitesQuery.data ?? []) : localSites;
  const trackables = trackablesQuery.data ?? [];

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(
    isSupabaseConfigured ? null : MOCK_WORK_SITE.siteId,
  );
  const [sitePickerOpen, setSitePickerOpen] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const [gpsEditVisible, setGpsEditVisible] = useState(false);
  const [gpsEditMarkerId, setGpsEditMarkerId] = useState<string | null>(null);
  const [gpsLatText, setGpsLatText] = useState('');
  const [gpsLngText, setGpsLngText] = useState('');

  useEffect(() => {
    if (sites.length === 0) return;
    if (!selectedSiteId || !sites.some((s) => s.id === selectedSiteId)) {
      setSelectedSiteId(sites[0].id);
    }
  }, [sites, selectedSiteId]);

  const selectedSite = useMemo(
    () => (selectedSiteId ? sites.find((s) => s.id === selectedSiteId) : undefined) ?? sites[0],
    [sites, selectedSiteId],
  );

  const siteWorkers = useMemo<Worker[]>(
    () => {
      if (!selectedSite?.id) return [];
      if (!isSupabaseConfigured) {
        return localWorkers
          .filter((w) => w.siteId === selectedSite.id)
          .map((w) => {
            const next = clampLatLngToBoundary(selectedSite.boundary, w.lat, w.lng);
            return { ...w, lat: next.lat, lng: next.lng };
          });
      }

      const DEFAULT_PERSON_COLOR = '#16a34a';
      return trackables
        .filter((t) => t.siteId === selectedSite.id && t.kind === 'person')
        .map<Worker>((t) => ({
          id: t.id,
          siteId: t.siteId,
          lat: t.lat,
          lng: t.lng,
          name: t.name,
          role: t.role ?? '',
          color: t.color ?? DEFAULT_PERSON_COLOR,
          updatedAt: t.updatedAt,
        }));
    },
    [selectedSite?.id, localWorkers, trackables],
  );

  const siteEquipment = useMemo<Equipment[]>(
    () => {
      if (!selectedSite?.id) return [];
      if (!isSupabaseConfigured) {
        return localEquipment
          .filter((e) => e.siteId === selectedSite.id)
          .map((e) => {
            const next = clampLatLngToBoundary(selectedSite.boundary, e.lat, e.lng);
            return { ...e, lat: next.lat, lng: next.lng };
          });
      }

      const DEFAULT_DUMP_COLOR = '#d97706';
      const DEFAULT_FORK_COLOR = '#eab308';

      return trackables
        .filter(
          (t) =>
            t.siteId === selectedSite.id &&
            (t.kind === 'dump_truck' || t.kind === 'forklift'),
        )
        .map<Equipment>((t) => ({
          id: t.id,
          siteId: t.siteId,
          kind: t.kind,
          lat: t.lat,
          lng: t.lng,
          name: t.name,
          label: t.label ?? '',
          color:
            t.kind === 'dump_truck' ? t.color ?? DEFAULT_DUMP_COLOR : t.color ?? DEFAULT_FORK_COLOR,
          updatedAt: t.updatedAt,
        }));
    },
    [selectedSite?.id, localEquipment, trackables],
  );

  const overlays = useMemo(
    () => (selectedSite ? sitesToMapOverlays([selectedSite]) : []),
    [selectedSite],
  );

  const userMarkers: MapUserMarker[] = useMemo(
    () => [
      ...siteWorkers.map((w) => ({
        id: w.id,
        lat: w.lat,
        lng: w.lng,
        name: w.name,
        role: w.role,
        color: w.color,
        kind: 'person' as const,
        updatedAt: w.updatedAt,
      })),
      ...siteEquipment.map((e) => ({
        id: e.id,
        lat: e.lat,
        lng: e.lng,
        name: e.name,
        role: e.label,
        color: e.color,
        kind: e.kind,
        updatedAt: e.updatedAt,
      })),
    ],
    [siteWorkers, siteEquipment],
  );

  const trackableDetails = useMemo(() => {
    const map = new Map<string, TrackableDetail>();
    siteWorkers.forEach((w) => map.set(w.id, workerToDetail(w)));
    siteEquipment.forEach((e) => map.set(e.id, equipmentToDetail(e)));
    return map;
  }, [siteWorkers, siteEquipment]);

  const selectedDetail = selectedMarkerId
    ? trackableDetails.get(selectedMarkerId)
    : undefined;

  const mapKey = selectedSite?.id ?? 'no-site';

  const handleSiteSelect = (site: ConstructionSite) => {
    setSelectedSiteId(site.id);
    setSitePickerOpen(false);
    setSelectedMarkerId(null);
  };

  const handleMarkerPress = useCallback((markerId: string) => {
    setSelectedMarkerId(markerId);
    setLegendExpanded(false);
  }, []);

  const closeGpsEdit = () => {
    setGpsEditVisible(false);
    setGpsEditMarkerId(null);
    setGpsLatText('');
    setGpsLngText('');
  };

  const openGpsEdit = useCallback((detail: TrackableDetail) => {
    setGpsEditVisible(true);
    setGpsEditMarkerId(detail.id);
    setGpsLatText(String(detail.lat));
    setGpsLngText(String(detail.lng));
  }, []);

  const handleGpsSave = () => {
    if (!gpsEditMarkerId || !selectedSite) return;
    const lat = parseFloat(gpsLatText);
    const lng = parseFloat(gpsLngText);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      Alert.alert('입력 확인', '위도/경도를 숫자로 입력해 주세요.');
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('입력 범위', '위도(-90~90), 경도(-180~180) 범위를 확인해 주세요.');
      return;
    }

    const boundary = selectedSite.boundary;
    const clamped = clampLatLngToBoundary(boundary, lat, lng);
    if (!isLatLngInsideBoundary(boundary, lat, lng)) {
      Alert.alert(
        '현장 경계',
        '입력한 좌표가 현장 경계(파란 폴리곤) 밖입니다. 경계 안 좌표로 저장합니다.',
      );
    }

    updateTrackableLocationMutation.mutate(
      { id: gpsEditMarkerId, lat: clamped.lat, lng: clamped.lng },
      {
        onError: (e) => {
          Alert.alert('저장 실패', e instanceof Error ? e.message : '알 수 없는 오류');
        },
        onSuccess: () => closeGpsEdit(),
      },
    );
  };

  const totalCount = siteWorkers.length + siteEquipment.length;

  return (
    <View style={styles.container}>
      <NaverMapView
        style={styles.map}
        overlays={overlays}
        userMarkers={userMarkers}
        mapKey={mapKey}
        onMarkerPress={handleMarkerPress}
      />

      <Pressable
        style={[styles.sitePicker, { top: insets.top + 8 }]}
        onPress={() => setSitePickerOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="현장 선택"
      >
        <View style={styles.sitePickerInner}>
          <Ionicons name="business-outline" size={18} color="#2563eb" />
          <View style={styles.sitePickerText}>
            <Text style={styles.sitePickerLabel}>담당 현장</Text>
            <Text style={styles.sitePickerName} numberOfLines={1}>
              {selectedSite?.name ?? '현장 없음'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color="#6b7280" />
        </View>
      </Pressable>

      {selectedDetail ? (
        <View style={[styles.markerDetail, { bottom: legendExpanded ? 200 : 72 }]}>
          <View style={styles.markerDetailHeader}>
            <View
              style={[styles.markerDetailDot, { backgroundColor: selectedDetail.color }]}
            />
            <View style={styles.markerDetailTitles}>
              <Text style={styles.markerDetailKind}>
                {kindLabel(selectedDetail.kind)}
              </Text>
              <Text style={styles.markerDetailName}>{selectedDetail.name}</Text>
              <Text style={styles.markerDetailRole}>{selectedDetail.subtitle}</Text>
            </View>
            <Pressable
              hitSlop={12}
              onPress={() => setSelectedMarkerId(null)}
              accessibilityLabel="상세 닫기"
            >
              <Ionicons name="close" size={22} color="#6b7280" />
            </Pressable>
          </View>
          <Text style={styles.markerDetailUpdated}>
            마지막 갱신 · {formatUpdatedAt(selectedDetail.updatedAt)}
          </Text>
          {isSupabaseConfigured ? (
            <Pressable
              onPress={() => openGpsEdit(selectedDetail)}
              style={styles.gpsEditLink}
              accessibilityRole="button"
              accessibilityLabel="GPS 수정"
            >
              <Text style={styles.gpsEditLinkText}>GPS 수정</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.legend}>
        <Pressable
          style={styles.legendHeader}
          onPress={() => setLegendExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: legendExpanded }}
        >
          <View style={styles.legendHeaderLeft}>
            <Text style={styles.legendTitle}>현장 위치</Text>
            {!legendExpanded ? (
              <Text style={styles.legendSummary}>
                인력 {siteWorkers.length} · 장비 {siteEquipment.length}
                {totalCount === 0 ? ' · 표시 없음' : ''}
              </Text>
            ) : (
              <Text style={styles.legendSummary}>10초마다 갱신 · 마커 탭 시 상세</Text>
            )}
          </View>
          <Ionicons
            name={legendExpanded ? 'chevron-down' : 'chevron-up'}
            size={20}
            color="#6b7280"
          />
        </Pressable>

        {legendExpanded ? (
          <View style={styles.legendBody}>
            {siteWorkers.length > 0 ? (
              <>
                <Text style={styles.legendSection}>인력</Text>
                {siteWorkers.map((w) => (
                  <Pressable
                    key={w.id}
                    style={styles.legendRow}
                    onPress={() => setSelectedMarkerId(w.id)}
                  >
                    <View style={[styles.legendDot, { backgroundColor: w.color }]} />
                    <Text style={styles.legendText}>
                      {w.name} ({w.role})
                    </Text>
                  </Pressable>
                ))}
              </>
            ) : null}

            {siteEquipment.length > 0 ? (
              <>
                <Text
                  style={[
                    styles.legendSection,
                    siteWorkers.length > 0 && styles.legendSectionSpaced,
                  ]}
                >
                  장비
                </Text>
                {siteEquipment.map((e) => (
                  <Pressable
                    key={e.id}
                    style={styles.legendRow}
                    onPress={() => setSelectedMarkerId(e.id)}
                  >
                    <View
                      style={[
                        e.kind === 'dump_truck'
                          ? styles.legendTruck
                          : styles.legendForklift,
                        { backgroundColor: e.color },
                      ]}
                    />
                    <Text style={styles.legendText}>
                      {e.label} · {e.name}
                    </Text>
                  </Pressable>
                ))}
              </>
            ) : null}

            {totalCount === 0 ? (
              <Text style={styles.legendEmpty}>
                이 현장에 표시할 인력·장비가 없습니다.
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <Modal
        visible={sitePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSitePickerOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSitePickerOpen(false)}
        >
          <Pressable
            style={[styles.modalSheet, { marginTop: insets.top + 56 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>현장 선택</Text>
            <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
              {sites.map((site) => {
                const isSelected = site.id === selectedSiteId;
                const workerCount = isSupabaseConfigured
                  ? trackables.filter(
                      (t) => t.siteId === site.id && t.kind === 'person',
                    ).length
                  : localWorkers.filter((w) => w.siteId === site.id).length;
                const equipCount = isSupabaseConfigured
                  ? trackables.filter(
                      (t) =>
                        t.siteId === site.id &&
                        (t.kind === 'dump_truck' || t.kind === 'forklift'),
                    ).length
                  : localEquipment.filter((e) => e.siteId === site.id).length;
                return (
                  <Pressable
                    key={site.id}
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => handleSiteSelect(site)}
                  >
                    <View style={styles.modalItemText}>
                      <Text
                        style={[
                          styles.modalItemName,
                          isSelected && styles.modalItemNameSelected,
                        ]}
                      >
                        {site.name}
                      </Text>
                      <Text style={styles.modalItemMeta}>
                        {site.address}
                        {'\n'}
                        인력 {workerCount} · 장비 {equipCount}
                      </Text>
                    </View>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={22} color="#2563eb" />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={gpsEditVisible}
        transparent
        animationType="fade"
        onRequestClose={closeGpsEdit}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeGpsEdit}>
          <Pressable
            style={[styles.modalSheet, { marginTop: insets.top + 56 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>GPS 수정</Text>

            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.gpsFields}>
                <Text style={styles.gpsLabel}>위도 (lat)</Text>
                <TextInput
                  style={styles.gpsInput}
                  value={gpsLatText}
                  onChangeText={setGpsLatText}
                  keyboardType="decimal-pad"
                />

                <Text style={styles.gpsLabel}>경도 (lng)</Text>
                <TextInput
                  style={styles.gpsInput}
                  value={gpsLngText}
                  onChangeText={setGpsLngText}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.gpsActions}>
                <Pressable style={styles.gpsCancelBtn} onPress={closeGpsEdit}>
                  <Text style={styles.gpsCancelText}>취소</Text>
                </Pressable>
                <Pressable style={styles.gpsSaveBtn} onPress={handleGpsSave}>
                  <Text style={styles.gpsSaveText}>저장</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  sitePicker: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
  },
  sitePickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sitePickerText: {
    flex: 1,
  },
  sitePickerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  sitePickerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 1,
  },
  markerDetail: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 15,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  markerDetailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  markerDetailDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerDetailTitles: {
    flex: 1,
  },
  markerDetailKind: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
  },
  markerDetailName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 2,
  },
  markerDetailRole: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
  markerDetailUpdated: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 10,
    fontWeight: '500',
  },
  legend: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  legendHeaderLeft: {
    flex: 1,
    gap: 2,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  legendSummary: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  legendBody: {
    marginTop: 10,
    gap: 8,
  },
  legendSection: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  legendSectionSpaced: {
    marginTop: 4,
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
  legendEmpty: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    marginHorizontal: 16,
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  modalList: {
    maxHeight: 360,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  modalItemSelected: {
    backgroundColor: '#eff6ff',
  },
  modalItemText: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalItemNameSelected: {
    color: '#2563eb',
  },
  modalItemMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 17,
  },
  gpsEditLink: {
    marginTop: 10,
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  gpsEditLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },
  gpsFields: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 10,
  },
  gpsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 6,
  },
  gpsInput: {
    marginTop: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    fontSize: 14,
  },
  gpsActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  gpsCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  gpsCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  gpsSaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  gpsSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
