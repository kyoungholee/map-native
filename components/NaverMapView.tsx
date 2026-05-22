import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import {
  buildNaverMapHtml,
  getNaverMapWebViewBaseUrl,
  type MapPolygonOverlay,
  type MapUserMarker,
} from '../lib/naverMapHtml';

const CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID ?? '';

type Props = {
  style?: object;
  overlays?: MapPolygonOverlay[];
  userMarkers?: MapUserMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  mapKey?: string;
};

export function NaverMapView({
  style,
  overlays,
  userMarkers = [],
  center,
  zoom,
  mapKey,
}: Props) {
  const webRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);

  const html = CLIENT_ID
    ? buildNaverMapHtml(CLIENT_ID, { overlays, userMarkers, center, zoom })
    : '';
  const baseUrl = getNaverMapWebViewBaseUrl();

  const markersKey = userMarkers
    .map((m) => `${m.id}:${m.lat.toFixed(6)},${m.lng.toFixed(6)}`)
    .join('|');

  useEffect(() => {
    setMapReady(false);
  }, [mapKey]);

  useEffect(() => {
    if (!mapReady || userMarkers.length === 0) return;

    const payload = JSON.stringify(userMarkers);
    webRef.current?.injectJavaScript(`
      if (typeof updateUserMarkers === 'function') {
        updateUserMarkers(${payload});
      }
      true;
    `);
  }, [mapReady, markersKey, userMarkers]);

  if (!CLIENT_ID) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackTitle}>지도를 불러올 수 없습니다</Text>
        <Text style={styles.fallbackText}>
          프로젝트 루트에 .env 파일을 만들고{'\n'}
          EXPO_PUBLIC_NAVER_MAP_CLIENT_ID 를 설정해 주세요.{'\n'}
          (.env.example 참고)
        </Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webRef}
      key={mapKey}
      style={[styles.map, style]}
      source={{ html, baseUrl }}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      startInLoadingState
      renderLoading={() => (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#03C75A" />
        </View>
      )}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'ready') setMapReady(true);
        } catch {
          /* ignore */
        }
        if (__DEV__) {
          console.warn('[NaverMap WebView]', event.nativeEvent.data);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
});
