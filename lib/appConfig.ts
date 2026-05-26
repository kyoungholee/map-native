import { Platform } from 'react-native';

/** Play 스토어·개인정보 링크 등 앱 공통 설정 */
export const APP_DISPLAY_NAME = '건설현장 베타';

export const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim() ?? '';

/**
 * 네이버 지도 WebView Referer (인증용).
 * - 개발: 비우면 Metro(127.0.0.1 / localhost)
 * - 스토어 빌드: HTTPS 공개 도메인 필수 (예: 웹 ERP 도메인)
 */
export function getNaverMapWebViewBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_NAVER_MAP_WEBVIEW_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (__DEV__) {
    return Platform.OS === 'android'
      ? 'http://127.0.0.1:8081'
      : 'http://localhost:8081';
  }

  return 'https://enterprise-beta-construction.dooson.it';
}
