/** WebView용 네이버 지도 v3 HTML (Expo Go / Web Dynamic Map) */
export function buildNaverMapHtml(clientId: string): string {
  const safeId = clientId.replace(/[^a-zA-Z0-9_-]/g, '');
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
  </style>
  <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${safeId}&amp;callback=initMap"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    function initMap() {
      new naver.maps.Map('map', {
        center: new naver.maps.LatLng(37.5665, 126.9780),
        zoom: 14,
        zoomControl: true,
        zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
      });
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready', href: location.href }));
      }
    }
    window.onerror = function (msg) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: String(msg) }));
      }
    };
  </script>
</body>
</html>`;
}

import { Platform } from 'react-native';

/**
 * WebView baseUrl — 네이버가 Referer로 인증합니다.
 * Android 에뮬레이터/Expo는 Metro를 127.0.0.1:8081 로 열어 localhost 와 다를 수 있습니다.
 */
export function getNaverMapWebViewBaseUrl(): string {
  if (Platform.OS === 'android') {
    return 'http://127.0.0.1:8081';
  }
  return 'http://localhost:8081';
}
