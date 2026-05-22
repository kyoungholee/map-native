import type { SiteBoundary } from '../types/site';

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
