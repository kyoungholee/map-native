import { boundaryCenter, boundaryToPaths } from './siteBoundary';
import type { MapPolygonOverlay } from './naverMapHtml';
import type { ConstructionSite } from '../types/site';

/** 홈 지도에 그릴 현장 경계 목록 */
export function sitesToMapOverlays(sites: ConstructionSite[]): MapPolygonOverlay[] {
  return sites.map((site) => ({
    paths: boundaryToPaths(site.boundary),
    strokeColor: '#2563eb',
    fillColor: 'rgba(37, 99, 235, 0.18)',
    name: site.name,
    center: boundaryCenter(site.boundary),
  }));
}
