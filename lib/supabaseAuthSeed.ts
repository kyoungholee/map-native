import {
  AUTH_ACCOUNTS_SITE_NAME,
  AUTH_DEMO_PASSWORD,
  AUTH_PROFILES,
  type AuthLoginId,
} from '../data/authProfiles';
import type { EmployeeProfile } from '../types/employee';
import { createConstructionSite } from './supabaseApi';
import { isSupabaseConfigured, supabaseClient } from './supabaseClient';

const AUTH_LOGIN_IDS: AuthLoginId[] = ['admin', 'test'];

function profileToTrackableRow(siteId: string, loginId: AuthLoginId) {
  const p = AUTH_PROFILES[loginId];
  return {
    site_id: siteId,
    kind: 'person' as const,
    name: loginId,
    role: JSON.stringify(p),
    label: AUTH_DEMO_PASSWORD,
    color: loginId === 'admin' ? '#16a34a' : '#ea580c',
    lat: 0,
    lng: 0,
  };
}

export function parseProfileFromTrackableRole(role: string | null): EmployeeProfile | null {
  if (!role) return null;
  try {
    return JSON.parse(role) as EmployeeProfile;
  } catch {
    return null;
  }
}

/**
 * 로그인 계정을 Supabase public 테이블에 시드합니다.
 * (profiles / auth.users 미설정 프로젝트에서도 anon 키만으로 동작)
 */
export async function seedAuthAccountsInDbIfEmpty(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabaseClient) return false;

  const { data: siteRows, error: siteLookupError } = await supabaseClient
    .from('construction_sites')
    .select('*')
    .eq('name', AUTH_ACCOUNTS_SITE_NAME)
    .limit(1);
  if (siteLookupError) throw siteLookupError;

  let authSite = siteRows?.[0]
    ? {
        id: siteRows[0].id as string,
        name: siteRows[0].name as string,
      }
    : undefined;

  if (!authSite) {
    authSite = await createConstructionSite({
      name: AUTH_ACCOUNTS_SITE_NAME,
      address: '시스템',
      manager: 'system',
      phone: '-',
      startDate: '2024-01-01',
      endDate: '2099-12-31',
      status: '진행중',
      boundary: { northLat: 0, southLat: 0, eastLng: 0, westLng: 0 },
    });
  }

  const { data: existingRows, error: existingError } = await supabaseClient
    .from('trackables')
    .select('name')
    .eq('site_id', authSite!.id);
  if (existingError) throw existingError;
  const existing = new Set((existingRows ?? []).map((r) => r.name as string));

  const missing = AUTH_LOGIN_IDS.filter((id) => !existing.has(id));
  if (missing.length === 0) return false;

  const rows = missing.map((loginId) => profileToTrackableRow(authSite!.id, loginId));
  const { error } = await supabaseClient.from('trackables').insert(rows);
  if (error) throw error;
  return true;
}

export async function findAuthAccountInDb(
  loginId: string,
  password: string,
): Promise<EmployeeProfile | null> {
  if (!isSupabaseConfigured || !supabaseClient) return null;

  const normalized = loginId.trim().toLowerCase();
  const { data: siteRows, error: siteLookupError } = await supabaseClient
    .from('construction_sites')
    .select('id')
    .eq('name', AUTH_ACCOUNTS_SITE_NAME)
    .limit(1);
  if (siteLookupError) throw siteLookupError;
  const authSite = siteRows?.[0];
  if (!authSite) return null;

  const { data: rows, error: trackableError } = await supabaseClient
    .from('trackables')
    .select('role, name, label')
    .eq('site_id', authSite.id)
    .eq('name', normalized)
    .eq('label', password)
    .limit(1);
  if (trackableError) throw trackableError;

  const row = rows?.[0];
  if (!row) return null;
  return parseProfileFromTrackableRole(row.role as string | null);
}
