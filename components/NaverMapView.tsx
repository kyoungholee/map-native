import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import {
  buildNaverMapHtml,
  getNaverMapWebViewBaseUrl,
} from '../lib/naverMapHtml';

const CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID ?? '';

type Props = {
  style?: object;
};

export function NaverMapView({ style }: Props) {
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

  const html = buildNaverMapHtml(CLIENT_ID);
  const baseUrl = getNaverMapWebViewBaseUrl();

  return (
    <WebView
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
