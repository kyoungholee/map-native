/**
 * Supabase DB에 admin/test 로그인 계정 행을 넣습니다 (앱 부트스트랩과 동일).
 *   node scripts/seed-auth-db.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadDotEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim();
  }
}

loadDotEnv();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
const AUTH_SITE = '__AUTH_ACCOUNTS__';
const PASSWORD = 'line1234!';

const PROFILES = {
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

if (!url || !key) {
  console.error('EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY 가 .env 에 필요합니다.');
  process.exit(1);
}

const supabase = createClient(url, key);

const { data: sites, error: sitesErr } = await supabase
  .from('construction_sites')
  .select('id,name')
  .order('created_at', { ascending: false });
if (sitesErr) throw sitesErr;

let authSite = sites?.find((s) => s.name === AUTH_SITE);
if (!authSite) {
  const { data, error } = await supabase
    .from('construction_sites')
    .insert({
      name: AUTH_SITE,
      address: '시스템',
      manager: 'system',
      phone: '-',
      start_date: '2024-01-01',
      end_date: '2099-12-31',
      status: '진행중',
      boundary: { northLat: 0, southLat: 0, eastLng: 0, westLng: 0 },
    })
    .select('id,name')
    .single();
  if (error) throw error;
  authSite = data;
  console.log('created auth site:', authSite.id);
}

const { data: trackables, error: trErr } = await supabase
  .from('trackables')
  .select('name')
  .eq('site_id', authSite.id);
if (trErr) throw trErr;

const existing = new Set((trackables ?? []).map((t) => t.name));
const toInsert = Object.entries(PROFILES)
  .filter(([loginId]) => !existing.has(loginId))
  .map(([loginId, profile]) => ({
    site_id: authSite.id,
    kind: 'person',
    name: loginId,
    role: JSON.stringify(profile),
    label: PASSWORD,
    color: loginId === 'admin' ? '#16a34a' : '#ea580c',
    lat: 0,
    lng: 0,
  }));

if (toInsert.length === 0) {
  console.log('auth accounts already exist in trackables');
} else {
  const { error } = await supabase.from('trackables').insert(toInsert);
  if (error) throw error;
  console.log('inserted accounts:', toInsert.map((r) => r.name).join(', '));
}

console.log('Done. Supabase Table Editor → trackables (site: __AUTH_ACCOUNTS__) 에서 확인하세요.');
