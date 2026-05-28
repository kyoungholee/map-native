/**
 * Supabase Auth admin/test 계정 시드 (비밀번호: line1234!)
 *
 * 사용법:
 *   SUPABASE_SERVICE_ROLE_KEY=<service_role> node scripts/seed-auth-users.mjs
 *
 * .env 에 SUPABASE_SERVICE_ROLE_KEY 가 있으면 자동으로 읽습니다.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadDotEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ??
  process.env.SUPABASE_URL?.trim() ??
  '';
const serviceRole =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.trim() ??
  '';

if (!url || !serviceRole) {
  console.error(
    'EXPO_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.\n' +
      '또는 Supabase SQL Editor에서 docs/supabase-auth-seed.sql 을 실행하세요.',
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  {
    email: 'admin@dooson.com',
    password: 'line1234!',
    loginId: 'admin',
    profile: {
      login_id: 'admin',
      employee_id: 'EMP-0001',
      name: '김도운',
      role_label: '현장 관리',
      position: '현장소장',
      department: '건설사업본부',
      site_id: 'site-eco24bl',
      site_name: '에코24BL',
      site_address: '부산광역시 강서구 강동동 4680',
      phone: '010-1234-5678',
      email: 'admin@dooson.com',
      hired_at: '2022-03-15',
    },
  },
  {
    email: 'test@dooson.com',
    password: 'line1234!',
    loginId: 'test',
    profile: {
      login_id: 'test',
      employee_id: 'EMP-TEST',
      name: '테스트',
      role_label: '현장 근무',
      position: '테스터',
      department: '건설사업본부',
      site_id: 'site-eco24bl',
      site_name: '에코24BL',
      site_address: '부산광역시 강서구 강동동 4680',
      phone: '010-0000-0000',
      email: 'test@dooson.com',
      hired_at: '2024-01-01',
    },
  },
];

async function ensureUser({ email, password, loginId, profile }) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw listError;

  const existing = listed.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  let userId = existing?.id;

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { login_id: loginId },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`created auth user: ${email}`);
  } else {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password,
      user_metadata: { login_id: loginId },
    });
    if (error) throw error;
    console.log(`updated auth user: ${email}`);
  }

  const { error: profileError } = await supabase.from('profiles').upsert(
    { id: userId, ...profile },
    { onConflict: 'id' },
  );
  if (profileError) throw profileError;
  console.log(`upserted profile: ${loginId}`);
}

for (const user of USERS) {
  await ensureUser(user);
}

console.log('Done. Login with admin / test and password line1234!');
