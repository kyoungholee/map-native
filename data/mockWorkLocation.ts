import { boundaryBottomLeft, boundaryPointInside } from '../lib/siteBoundary';
import { MARKER_COLORS } from './mockWorkers';
import { SEED_SITES } from './seedSites';

const ECO_SITE = SEED_SITES[0];
const boundary = ECO_SITE.boundary;

export type WorkerLocationSeed = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  role: string;
  color: string;
};

export type EquipmentKind = 'dump_truck' | 'forklift';

export type EquipmentLocationSeed = {
  id: string;
  kind: EquipmentKind;
  lat: number;
  lng: number;
  name: string;
  label: string;
  color: string;
};

/** 현장 네 구역에 분산된 시작 위치 */
export const INITIAL_WORKER_LOCATIONS: WorkerLocationSeed[] = [
  {
    id: 'EMP-0001',
    ...boundaryPointInside(boundary, 0.78, 0.22),
    name: '김도운',
    role: '현장소장',
    color: MARKER_COLORS.admin,
  },
  {
    id: 'EMP-0002',
    ...boundaryPointInside(boundary, 0.38, 0.72),
    name: '이준호',
    role: '현장기사',
    color: MARKER_COLORS.worker2,
  },
];

/** 현장 장비 — 덤프트럭·포크레인 각 1대 */
export const INITIAL_EQUIPMENT_LOCATIONS: EquipmentLocationSeed[] = [
  {
    id: 'EQ-DUMP-01',
    kind: 'dump_truck',
    ...boundaryBottomLeft(boundary),
    name: '덤프트럭 01',
    label: '덤프트럭',
    color: '#d97706',
  },
  {
    id: 'EQ-FORK-01',
    kind: 'forklift',
    ...boundaryPointInside(boundary, 0.22, 0.28),
    name: '포크레인 01',
    label: '포크레인',
    color: '#eab308',
  },
];

export const MOCK_WORK_SITE = {
  siteId: ECO_SITE.id,
  siteName: ECO_SITE.name,
};
