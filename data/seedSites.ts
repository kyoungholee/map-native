import type { ConstructionSite } from '../types/site';

/** 웹 ERP 현장 수정 화면과 동일한 테스트 데이터 */
export const SEED_SITES: ConstructionSite[] = [
  {
    id: 'site-eco24bl',
    name: '에코24BL',
    address: '부산광역시 강서구 강동동 4680',
    manager: '홍길동',
    phone: '010-1234-1234',
    startDate: '2026. 01. 01.',
    endDate: '2026. 12. 31.',
    status: '진행중',
    boundary: {
      northLat: 35.15126126995675,
      eastLng: 128.91810661345355,
      southLat: 35.14810755234198,
      westLng: 128.92103243805627,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];
