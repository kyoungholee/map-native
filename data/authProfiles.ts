import type { EmployeeProfile } from '../types/employee';

/** Supabase construction_sites / trackables 에 저장하는 시스템용 현장명 */
export const AUTH_ACCOUNTS_SITE_NAME = '__AUTH_ACCOUNTS__';

/** 로그인 ID → Supabase Auth 이메일 (비밀번호 로그인용) */
export const AUTH_LOGIN_IDS = ['admin', 'test'] as const;
export type AuthLoginId = (typeof AUTH_LOGIN_IDS)[number];

export function loginIdToAuthEmail(loginId: string): string {
  return `${loginId.trim().toLowerCase()}@dooson.com`;
}

export function isAuthLoginId(loginId: string): loginId is AuthLoginId {
  return AUTH_LOGIN_IDS.includes(loginId.trim().toLowerCase() as AuthLoginId);
}

export const AUTH_PROFILES: Record<AuthLoginId, EmployeeProfile> = {
  admin: {
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
    email: 'admin@dooson.com',
    hiredAt: '2022-03-15',
  },
  test: {
    employeeId: 'EMP-TEST',
    loginId: 'test',
    name: '테스트',
    roleLabel: '현장 근무',
    position: '테스터',
    department: '건설사업본부',
    siteId: 'site-eco24bl',
    siteName: '에코24BL',
    siteAddress: '부산광역시 강서구 강동동 4680',
    phone: '010-0000-0000',
    email: 'test@dooson.com',
    hiredAt: '2024-01-01',
  },
};

export const AUTH_DEMO_PASSWORD = 'line1234!';
