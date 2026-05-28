import type { SiteBoundary } from '../types/site';

export type LatLngRanges = {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
};

/** 경계 사각형의 위·경도 min/max (남북·동서 순서와 무관하게 정규화) */
export function boundaryLatLngRanges(boundary: SiteBoundary): LatLngRanges {
  return {
    latMin: Math.min(boundary.southLat, boundary.northLat),
    latMax: Math.max(boundary.southLat, boundary.northLat),
    lngMin: Math.min(boundary.westLng, boundary.eastLng),
    lngMax: Math.max(boundary.westLng, boundary.eastLng),
  };
}

/** 인력·장비 좌표를 현장 경계(폴리곤) 안으로 제한 */
export function clampLatLngToBoundary(
  boundary: SiteBoundary,
  lat: number,
  lng: number,
): { lat: number; lng: number } {
  const { latMin, latMax, lngMin, lngMax } = boundaryLatLngRanges(boundary);
  return {
    lat: Math.min(latMax, Math.max(latMin, lat)),
    lng: Math.min(lngMax, Math.max(lngMin, lng)),
  };
}

export function isLatLngInsideBoundary(
  boundary: SiteBoundary,
  lat: number,
  lng: number,
): boolean {
  const clamped = clampLatLngToBoundary(boundary, lat, lng);
  return clamped.lat === lat && clamped.lng === lng;
}

/**
 * 경계 사각형 안 비율 좌표 (0~1).
 * latRatio 0 = 남(아래), lngRatio 0 = 서(왼쪽)
 */
export function boundaryPointInside(
  boundary: SiteBoundary,
  latRatio: number,
  lngRatio: number,
): { lat: number; lng: number } {
  const { latMin, latMax, lngMin, lngMax } = boundaryLatLngRanges(boundary);
  return {
    lat: latMin + (latMax - latMin) * latRatio,
    lng: lngMin + (lngMax - lngMin) * lngRatio,
  };
}

/** 경계 왼쪽 아래(남서) — 모서리에서 살짝 안쪽 */
export function boundaryBottomLeft(
  boundary: SiteBoundary,
  insetRatio = 0.06,
): { lat: number; lng: number } {
  return boundaryPointInside(boundary, insetRatio, insetRatio);
}

/** 경계 4꼭짓점 (시계 방향, 파란 선으로 연결) */
export function boundaryToPaths(boundary: SiteBoundary) {
  return [
    { lat: boundary.northLat, lng: boundary.eastLng },
    { lat: boundary.southLat, lng: boundary.eastLng },
    { lat: boundary.southLat, lng: boundary.westLng },
    { lat: boundary.northLat, lng: boundary.westLng },
  ];
}

export function boundaryCenter(boundary: SiteBoundary) {
  return {
    lat: (boundary.northLat + boundary.southLat) / 2,
    lng: (boundary.eastLng + boundary.westLng) / 2,
  };
}
