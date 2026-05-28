-- Supabase SQL Editor에서 1회 실행 (supabase-setup.sql 실행 후)
-- admin / test 계정 생성 · 비밀번호: line1234!
-- 이미 동일 이메일 사용자가 있으면 프로필만 upsert 합니다.

create extension if not exists pgcrypto;

do $$
declare
  admin_id uuid;
  test_id uuid;
  instance uuid := '00000000-0000-0000-0000-000000000000';
begin
  select id into admin_id from auth.users where email = 'admin@dooson.com' limit 1;
  if admin_id is null then
    admin_id := gen_random_uuid();
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      instance,
      admin_id,
      'authenticated',
      'authenticated',
      'admin@dooson.com',
      crypt('line1234!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"login_id":"admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      admin_id,
      format('{"sub":"%s","email":"admin@dooson.com"}', admin_id)::jsonb,
      'email',
      admin_id::text,
      now(),
      now(),
      now()
    );
  end if;

  select id into test_id from auth.users where email = 'test@dooson.com' limit 1;
  if test_id is null then
    test_id := gen_random_uuid();
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      instance,
      test_id,
      'authenticated',
      'authenticated',
      'test@dooson.com',
      crypt('line1234!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"login_id":"test"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      test_id,
      format('{"sub":"%s","email":"test@dooson.com"}', test_id)::jsonb,
      'email',
      test_id::text,
      now(),
      now(),
      now()
    );
  end if;

  insert into public.profiles (
    id, login_id, employee_id, name, role_label, position, department,
    site_id, site_name, site_address, phone, email, hired_at
  ) values
    (
      admin_id, 'admin', 'EMP-0001', '김도운', '현장 관리', '현장소장', '건설사업본부',
      'site-eco24bl', '에코24BL', '부산광역시 강서구 강동동 4680',
      '010-1234-5678', 'admin@dooson.com', '2022-03-15'
    ),
    (
      test_id, 'test', 'EMP-TEST', '테스트', '현장 근무', '테스터', '건설사업본부',
      'site-eco24bl', '에코24BL', '부산광역시 강서구 강동동 4680',
      '010-0000-0000', 'test@dooson.com', '2024-01-01'
    )
  on conflict (id) do update set
    login_id = excluded.login_id,
    employee_id = excluded.employee_id,
    name = excluded.name,
    role_label = excluded.role_label,
    position = excluded.position,
    department = excluded.department,
    site_id = excluded.site_id,
    site_name = excluded.site_name,
    site_address = excluded.site_address,
    phone = excluded.phone,
    email = excluded.email,
    hired_at = excluded.hired_at;
end $$;

notify pgrst, 'reload schema';
