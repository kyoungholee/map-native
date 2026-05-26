import { getNaverMapWebViewBaseUrl } from './appConfig';

export { getNaverMapWebViewBaseUrl };

export type MapPathPoint = { lat: number; lng: number };

export type MapPolygonOverlay = {
  paths: MapPathPoint[];
  strokeColor?: string;
  fillColor?: string;
  name?: string;
  center?: MapPathPoint;
};

/** GPS — 근무자 현재 위치 */
export type MapUserMarker = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  role?: string;
  color?: string;
};

type MapOptions = {
  center?: MapPathPoint;
  zoom?: number;
  overlays?: MapPolygonOverlay[];
  userMarkers?: MapUserMarker[];
};

/** WebView용 네이버 지도 v3 HTML (Expo Go / Web Dynamic Map) */
export function buildNaverMapHtml(
  clientId: string,
  options: MapOptions = {},
): string {
  const safeId = clientId.replace(/[^a-zA-Z0-9_-]/g, '');
  const center = options.center ?? { lat: 37.5665, lng: 126.9780 };
  const zoom = options.zoom ?? 14;
  const overlaysJson = JSON.stringify(
    (options.overlays ?? []).map((o) => ({
      paths: o.paths,
      strokeColor: o.strokeColor ?? '#2563eb',
      fillColor: o.fillColor ?? 'rgba(37, 99, 235, 0.18)',
      name: o.name ?? '',
      center: o.center ?? null,
    })),
  );
  const userMarkersJson = JSON.stringify(
    (options.userMarkers ?? []).map((m) => ({
      id: m.id,
      lat: m.lat,
      lng: m.lng,
      name: m.name,
      role: m.role ?? '',
      color: m.color ?? '#16a34a',
    })),
  );

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
    var OVERLAYS = ${overlaysJson};
    var USER_MARKERS = ${userMarkersJson};
    var DEFAULT_CENTER = { lat: ${center.lat}, lng: ${center.lng} };
    var DEFAULT_ZOOM = ${zoom};

    function initMap() {
      var map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
      });

      var bounds = new naver.maps.LatLngBounds();
      var hasBounds = false;

      if (OVERLAYS && OVERLAYS.length > 0) {
        OVERLAYS.forEach(function (overlay) {
          if (!overlay.paths || overlay.paths.length < 3) return;

          var pathCoords = overlay.paths.map(function (p) {
            return new naver.maps.LatLng(p.lat, p.lng);
          });

          new naver.maps.Polygon({
            map: map,
            paths: pathCoords,
            strokeColor: overlay.strokeColor || '#2563eb',
            strokeWeight: 3,
            strokeOpacity: 1,
            fillColor: overlay.fillColor || 'rgba(37, 99, 235, 0.18)',
            fillOpacity: 0.35,
          });

          pathCoords.forEach(function (coord) {
            bounds.extend(coord);
            hasBounds = true;
          });

          if (overlay.center) {
            var label = overlay.name
              ? '<div style="padding:4px 8px;background:#2563eb;color:#fff;font-size:11px;font-weight:600;border-radius:4px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.25);">' + overlay.name + '</div>'
              : '';
            new naver.maps.Marker({
              map: map,
              position: new naver.maps.LatLng(overlay.center.lat, overlay.center.lng),
              icon: {
                content: label,
                anchor: new naver.maps.Point(0, 0),
              },
            });
          }
        });

      }

      window.__naverMap = map;

      function userMarkerHtml(name, role, color) {
        var c = color || '#16a34a';
        return (
          '<div style="display:flex;flex-direction:column;align-items:center;">' +
          '<div style="width:16px;height:16px;background:' + c + ';border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.35);"></div>' +
          '<div style="margin-top:4px;padding:4px 8px;background:' + c + ';color:#fff;font-size:11px;font-weight:700;border-radius:6px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.25);">' +
          name + (role ? ' · ' + role : '') +
          '</div></div>'
        );
      }

      window.__userMarkers = {};

      window.updateUserMarkers = function (markers) {
        if (!window.__naverMap || !markers) return;
        markers.forEach(function (m) {
          if (!m.lat || !m.lng) return;
          var pos = new naver.maps.LatLng(m.lat, m.lng);
          if (window.__userMarkers[m.id]) {
            window.__userMarkers[m.id].setPosition(pos);
          } else {
            window.__userMarkers[m.id] = new naver.maps.Marker({
              map: window.__naverMap,
              position: pos,
              zIndex: 2000,
              icon: {
                content: userMarkerHtml(m.name || '', m.role || '', m.color),
                anchor: new naver.maps.Point(8, 8),
              },
            });
          }
        });
      };

      if (USER_MARKERS && USER_MARKERS.length > 0) {
        USER_MARKERS.forEach(function (m) {
          if (m.lat && m.lng) {
            bounds.extend(new naver.maps.LatLng(m.lat, m.lng));
            hasBounds = true;
          }
        });
        window.updateUserMarkers(USER_MARKERS);
      }

      if (hasBounds) {
        map.fitBounds(bounds, { top: 56, right: 48, bottom: 80, left: 48 });
      }

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

