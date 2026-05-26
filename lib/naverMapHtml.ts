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

export type MapMarkerKind = 'person' | 'dump_truck' | 'forklift';

/** GPS — 인력·장비 현재 위치 */
export type MapUserMarker = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  role?: string;
  color?: string;
  kind?: MapMarkerKind;
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
      kind: m.kind ?? 'person',
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

      function markerLabelStyle(c) {
        return 'margin-top:4px;padding:5px 10px;background:' + c + ';color:#fff;font-size:11px;font-weight:800;border-radius:8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3);letter-spacing:-0.2px;';
      }

      function markerHtml(m) {
        var c = m.color || '#16a34a';
        var kind = m.kind || 'person';
        var name = m.name || '';
        var role = m.role || '';

        if (kind === 'dump_truck') {
          return (
            '<div style="display:flex;flex-direction:column;align-items:center;">' +
            '<div style="width:34px;height:22px;background:' + c + ';border:3px solid #fff;border-radius:5px 8px 4px 4px;box-shadow:0 2px 8px rgba(0,0,0,.4);position:relative;">' +
            '<div style="position:absolute;right:3px;top:3px;width:10px;height:8px;background:rgba(255,255,255,.35);border-radius:2px;"></div>' +
            '</div>' +
            '<div style="' + markerLabelStyle(c) + '">🚛 덤프트럭 · ' + name + '</div>' +
            '</div>'
          );
        }

        if (kind === 'forklift') {
          return (
            '<div style="display:flex;flex-direction:column;align-items:center;">' +
            '<svg width="40" height="34" viewBox="0 0 40 34" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.35));">' +
            '<rect x="14" y="2" width="5" height="16" rx="1" fill="#4b5563"/>' +
            '<rect x="4" y="18" width="16" height="3" rx="1" fill="#fbbf24"/>' +
            '<rect x="4" y="23" width="16" height="3" rx="1" fill="#fbbf24"/>' +
            '<rect x="22" y="10" width="14" height="16" rx="2" fill="' + c + '" stroke="#fff" stroke-width="2"/>' +
            '<rect x="24" y="12" width="8" height="6" rx="1" fill="rgba(255,255,255,.35)"/>' +
            '<circle cx="30" cy="28" r="4" fill="#1f2937" stroke="#fff" stroke-width="1.5"/>' +
            '<circle cx="12" cy="28" r="3.5" fill="#1f2937" stroke="#fff" stroke-width="1.5"/>' +
            '</svg>' +
            '<div style="' + markerLabelStyle(c) + '">포크레인 · ' + name + '</div>' +
            '</div>'
          );
        }

        return (
          '<div style="display:flex;flex-direction:column;align-items:center;">' +
          '<div style="width:16px;height:16px;background:' + c + ';border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.35);"></div>' +
          '<div style="' + markerLabelStyle(c) + '">👤 ' + name + (role ? ' · ' + role : '') + '</div>' +
          '</div>'
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
            var zIndex = m.kind === 'person' ? 2000 : 2100;
            window.__userMarkers[m.id] = new naver.maps.Marker({
              map: window.__naverMap,
              position: pos,
              zIndex: zIndex,
              icon: {
                content: markerHtml(m),
                anchor: new naver.maps.Point(
                  m.kind === 'forklift' ? 20 : m.kind === 'dump_truck' ? 17 : 8,
                  m.kind === 'forklift' ? 30 : m.kind === 'dump_truck' ? 22 : 8
                ),
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

