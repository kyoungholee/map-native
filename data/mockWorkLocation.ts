import { boundaryCenter } from '../lib/siteBoundary';
import { MARKER_COLORS } from './mockWorkers';
import { SEED_SITES } from './seedSites';

const ECO_SITE = SEED_SITES[0];
const center = boundaryCenter(ECO_SITE.boundary);

export type WorkerLocationSeed = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  role: string;
  color: string;
};

/** 현장 안 서로 다른 시작 위치 */
export const INITIAL_WORKER_LOCATIONS: WorkerLocationSeed[] = [
  {
    id: 'EMP-0001',
    lat: center.lat,
    lng: center.lng,
    name: '김도운',
    role: '현장소장',
    color: MARKER_COLORS.admin,
  },
  {
    id: 'EMP-0002',
    lat: center.lat + 0.00035,
    lng: center.lng - 0.00025,
    name: '이준호',
    role: '현장기사',
    color: MARKER_COLORS.worker2,
  },
];

export const MOCK_WORK_SITE = {
  siteId: ECO_SITE.id,
  siteName: ECO_SITE.name,
};
