import type { Session } from '@supabase/supabase-js';

import {
  AUTH_DEMO_PASSWORD,
  AUTH_PROFILES,
  isAuthLoginId,
  loginIdToAuthEmail,
  type AuthLoginId,
} from '../data/authProfiles';
import type { EmployeeProfile } from '../types/employee';
import { findAuthAccountInDb } from './supabaseAuthSeed';
import { isSupabaseConfigured, supabaseClient } from './supabaseClient';

type ProfileRow = {
  id: string;
  login_id: string;
  employee_id: string;
  name: string;
  role_label: string;
  position: string;
  department: string;
  site_id: string;
  site_name: string;
  site_address: string;
  phone: string;
  email: string;
  hired_at: string;
};

function mapProfileRow(row: ProfileRow): EmployeeProfile {
  return {
    employeeId: row.employee_id,
    loginId: row.login_id,
    name: row.name,
    roleLabel: row.role_label,
    position: row.position,
    department: row.department,
    siteId: row.site_id,
    siteName: row.site_name,
    siteAddress: row.site_address,
    phone: row.phone,
    email: row.email,
    hiredAt: row.hired_at,
  };
}

export function profileFromLoginId(loginId: string): EmployeeProfile | null {
  const normalized = loginId.trim().toLowerCase();
  if (!isAuthLoginId(normalized)) return null;
  return AUTH_PROFILES[normalized];
}

export async function signInWithCredentials(
  loginId: string,
  password: string,
): Promise<{ session: Session | null; profile: EmployeeProfile }> {
  const normalizedLoginId = loginId.trim().toLowerCase();
  const fallbackProfile = profileFromLoginId(normalizedLoginId);

  if (!fallbackProfile) {
    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  if (password !== AUTH_DEMO_PASSWORD) {
    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  if (!isSupabaseConfigured || !supabaseClient) {
    return { session: null, profile: fallbackProfile };
  }

  const dbProfile = await findAuthAccountInDb(normalizedLoginId, password);
  if (dbProfile) {
    return { session: null, profile: dbProfile };
  }

  const email = loginIdToAuthEmail(normalizedLoginId);
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  const profile = await fetchProfileForUser(data.session?.user.id, normalizedLoginId);
  return { session: data.session, profile };
}

export async function fetchProfileForUser(
  userId: string | undefined,
  loginIdFallback: AuthLoginId | string,
): Promise<EmployeeProfile> {
  const fallback = profileFromLoginId(loginIdFallback);
  if (!fallback) {
    throw new Error('프로필을 찾을 수 없습니다.');
  }

  if (!isSupabaseConfigured || !supabaseClient || !userId) {
    return fallback;
  }

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return fallback;
  return mapProfileRow(data as ProfileRow);
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured || !supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured || !supabaseClient) return null;
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  return data.session;
}
