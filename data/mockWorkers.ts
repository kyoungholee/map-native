import type { EmployeeProfile } from '../types/employee';

export const MARKER_COLORS = {
  admin: '#16a34a',
  worker2: '#ea580c',
} as const;

/** 목업 직원 2명 — 홈 지도에 각각 표시 */
export const MOCK_WORKERS: EmployeeProfile[] = [
  {
    employeeId: 'EMP-0001',
    loginId: 'admin',
    name: '김도운',
    roleLabel: '현장 관리',
    position: '현장소장',
    department: '건설사업본부',
    siteId: 'site-eco24bl',
    siteName: '에코24BL',
    siteAddress: '부산광역시 강서구 강동동 4680',
    phone: '010-1234-5678',
    email: 'admin@dooson.co.kr',
    hiredAt: '2022-03-15',
  },
  {
    employeeId: 'EMP-0002',
    loginId: 'worker01',
    name: '이준호',
    roleLabel: '현장 근무',
    position: '현장기사',
    department: '건설사업본부',
    siteId: 'site-eco24bl',
    siteName: '에코24BL',
    siteAddress: '부산광역시 강서구 강동동 4680',
    phone: '010-9876-5432',
    email: 'worker01@dooson.co.kr',
    hiredAt: '2023-06-01',
  },
];

export const MOCK_ADMIN = MOCK_WORKERS[0];
