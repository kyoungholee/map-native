-- Supabase SQL Editor에서 전체를 1회 실행하세요.
-- (이미 테이블이 있어도 함수·정책은 다시 적용됩니다)

-- ─── 테이블 ───
create table if not exists public.construction_sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  manager text not null,
  phone text not null,
  start_date text not null,
  end_date text not null,
  status text not null,
  boundary jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.trackables (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.construction_sites(id) on delete cascade,
  kind text not null check (kind in ('person', 'dump_truck', 'forklift')),
  name text not null,
  role text,
  label text,
  color text,
  lat double precision not null,
  lng double precision not null,
  updated_at timestamptz not null default now()
);

create index if not exists trackables_site_id_idx on public.trackables(site_id);

-- ─── RLS (내부 테스트: anon 읽기/쓰기 허용) ───
alter table public.construction_sites enable row level security;
alter table public.trackables enable row level security;

drop policy if exists "anon_all_construction_sites" on public.construction_sites;
create policy "anon_all_construction_sites"
  on public.construction_sites for all to anon using (true) with check (true);

drop policy if exists "anon_all_trackables" on public.trackables;
create policy "anon_all_trackables"
  on public.trackables for all to anon using (true) with check (true);

-- ─── 10초 GPS 시뮬레이션 (앱이 RPC로 호출) ───
drop function if exists public.simulate_trackables_tick(uuid);

create or replace function public.simulate_trackables_tick(p_site_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  step constant double precision := 0.00012;
begin
  update public.trackables t
  set
    lat = greatest(
      least(
        t.lat + (random() - 0.5) * 2 * step,
        greatest((s.boundary->>'northLat')::double precision, (s.boundary->>'southLat')::double precision)
      ),
      least((s.boundary->>'northLat')::double precision, (s.boundary->>'southLat')::double precision)
    ),
    lng = greatest(
      least(
        t.lng + (random() - 0.5) * 2 * step,
        greatest((s.boundary->>'eastLng')::double precision, (s.boundary->>'westLng')::double precision)
      ),
      least((s.boundary->>'eastLng')::double precision, (s.boundary->>'westLng')::double precision)
    ),
    updated_at = now()
  from public.construction_sites s
  where s.id = t.site_id
    and (p_site_id is null or t.site_id = p_site_id);
end;
$$;

grant execute on function public.simulate_trackables_tick(uuid) to anon, authenticated;

-- ─── 로그인 프로필 (auth.users 와 1:1) ───
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  login_id text not null unique,
  employee_id text not null,
  name text not null,
  role_label text not null,
  position text not null,
  department text not null,
  site_id text not null,
  site_name text not null,
  site_address text not null,
  phone text not null,
  email text not null,
  hired_at text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

notify pgrst, 'reload schema';
