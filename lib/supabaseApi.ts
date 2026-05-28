import type { SupabaseClient } from '@supabase/supabase-js';

import type { ConstructionSite, SiteFormInput } from '../types/site';
import type { MapMarkerKind } from './naverMapHtml';
import type { MapUserMarker } from './naverMapHtml';
import { AUTH_ACCOUNTS_SITE_NAME } from '../data/authProfiles';
import { clampLatLngToBoundary } from './siteBoundary';
import { isSupabaseConfigured, supabaseClient } from './supabaseClient';

type ConstructionSiteRow = {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  start_date: string;
  end_date: string;
  status: ConstructionSite['status'];
  boundary: ConstructionSite['boundary'];
  created_at: string;
};

type TrackableRow = {
  id: string;
  site_id: string;
  kind: MapMarkerKind;
  name: string;
  role: string | null;
  label: string | null;
  color: string | null;
  lat: number;
  lng: number;
  updated_at: string;
};

export type Trackable = {
  id: string;
  siteId: string;
  kind: MapMarkerKind;
  name: string;
  role: string | null;
  label: string | null;
  color: string | null;
  lat: number;
  lng: number;
  updatedAt: string;
};

const SIM_STEP = 0.00012;

function assertSupabaseConfigured(): SupabaseClient {
  if (!isSupabaseConfigured || !supabaseClient) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return supabaseClient;
}

function randomStep() {
  return (Math.random() - 0.5) * 2 * SIM_STEP;
}

function mapSiteRow(row: ConstructionSiteRow): ConstructionSite {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    manager: row.manager,
    phone: row.phone,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    boundary: row.boundary,
    createdAt: row.created_at,
  };
}

function mapTrackableRowToMarker(row: TrackableRow): MapUserMarker {
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    name: row.name,
    role: row.kind === 'person' ? (row.role ?? '') : (row.label ?? ''),
    color: row.color ?? undefined,
    kind: row.kind,
    updatedAt: row.updated_at,
  };
}

function mapTrackableRow(row: TrackableRow): Trackable {
  return {
    id: row.id,
    siteId: row.site_id,
    kind: row.kind,
    name: row.name,
    role: row.role,
    label: row.label,
    color: row.color,
    lat: row.lat,
    lng: row.lng,
    updatedAt: row.updated_at,
  };
}

export async function listConstructionSites(): Promise<ConstructionSite[]> {
  const supabase = assertSupabaseConfigured();

  const { data, error } = await supabase
    .from('construction_sites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ConstructionSiteRow[])
    .map(mapSiteRow)
    .filter((site) => site.name !== AUTH_ACCOUNTS_SITE_NAME);
}

export async function createConstructionSite(input: SiteFormInput): Promise<ConstructionSite> {
  const supabase = assertSupabaseConfigured();

  const { data, error } = await supabase
    .from('construction_sites')
    .insert({
      name: input.name,
      address: input.address,
      manager: input.manager,
      phone: input.phone,
      start_date: input.startDate,
      end_date: input.endDate,
      status: input.status,
      boundary: input.boundary,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapSiteRow(data as ConstructionSiteRow);
}

export async function updateConstructionSite(id: string, input: SiteFormInput): Promise<void> {
  const supabase = assertSupabaseConfigured();

  const { error } = await supabase
    .from('construction_sites')
    .update({
      name: input.name,
      address: input.address,
      manager: input.manager,
      phone: input.phone,
      start_date: input.startDate,
      end_date: input.endDate,
      status: input.status,
      boundary: input.boundary,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function listTrackablesAll(): Promise<Trackable[]> {
  const supabase = assertSupabaseConfigured();

  const [
    { data, error },
    { data: authSites, error: authSiteError },
    { data: siteRows, error: sitesError },
  ] = await Promise.all([
    supabase.from('trackables').select('*').order('updated_at', { ascending: false }),
    supabase.from('construction_sites').select('id').eq('name', AUTH_ACCOUNTS_SITE_NAME),
    supabase.from('construction_sites').select('id, boundary'),
  ]);

  if (error) throw error;
  if (authSiteError) throw authSiteError;
  if (sitesError) throw sitesError;

  const authSiteIds = new Set((authSites ?? []).map((s) => s.id));
  const boundaryBySiteId = new Map(
    (siteRows ?? []).map((s) => [s.id as string, s.boundary as ConstructionSite['boundary']]),
  );

  return (data as TrackableRow[])
    .map(mapTrackableRow)
    .filter((t) => !authSiteIds.has(t.siteId))
    .map((t) => {
      const boundary = boundaryBySiteId.get(t.siteId);
      if (!boundary) return t;
      const clamped = clampLatLngToBoundary(boundary, t.lat, t.lng);
      return { ...t, lat: clamped.lat, lng: clamped.lng };
    });
}

export function mapTrackablesToUserMarkers(trackables: Trackable[]): MapUserMarker[] {
  return trackables.map((t) => ({
    id: t.id,
    lat: t.lat,
    lng: t.lng,
    name: t.name,
    role: t.kind === 'person' ? (t.role ?? '') : (t.label ?? ''),
    color: t.color ?? undefined,
    kind: t.kind,
    updatedAt: t.updatedAt,
  }));
}

let useAppSimulationOnly = false;

/** RPC 없을 때 앱에서 trackables 좌표를 현장 경계 안으로 이동 */
async function simulateTrackablesTickInApp(siteId?: string): Promise<void> {
  const [trackables, sites] = await Promise.all([
    listTrackablesAll(),
    listConstructionSites(),
  ]);
  const siteById = new Map(sites.map((s) => [s.id, s]));

  const updates = trackables
    .filter((t) => !siteId || t.siteId === siteId)
    .map((t) => {
      const site = siteById.get(t.siteId);
      if (!site) return null;

      const next = clampLatLngToBoundary(site.boundary, t.lat + randomStep(), t.lng + randomStep());
      return updateTrackableLocation(t.id, next, site.boundary);
    })
    .filter(Boolean);

  await Promise.all(updates);
}

/**
 * 10초 데모용 좌표 이동.
 * Supabase에 `simulate_trackables_tick` 함수가 있으면 RPC, 없으면 앱에서 직접 update.
 */
export async function simulateTrackablesTick(siteId?: string): Promise<'rpc' | 'app'> {
  if (!useAppSimulationOnly) {
    const supabase = assertSupabaseConfigured();
    const rpcArgs = siteId ? { p_site_id: siteId } : {};

    const { error } = await supabase.rpc('simulate_trackables_tick', rpcArgs);

    if (!error) return 'rpc';

    if (error.code === 'PGRST202') {
      useAppSimulationOnly = true;
    } else {
      throw error;
    }
  }

  await simulateTrackablesTickInApp(siteId);
  return 'app';
}

export async function updateTrackableLocation(
  id: string,
  input: { lat: number; lng: number },
  boundaryHint?: ConstructionSite['boundary'],
): Promise<void> {
  const supabase = assertSupabaseConfigured();

  let boundary = boundaryHint;
  if (!boundary) {
    const { data: trackable, error: trackableError } = await supabase
      .from('trackables')
      .select('site_id')
      .eq('id', id)
      .single();
    if (trackableError) throw trackableError;

    const { data: site, error: siteError } = await supabase
      .from('construction_sites')
      .select('boundary')
      .eq('id', trackable.site_id)
      .single();
    if (siteError) throw siteError;
    boundary = site.boundary as ConstructionSite['boundary'];
  }

  const clamped = clampLatLngToBoundary(boundary, input.lat, input.lng);

  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from('trackables')
    .update({
      lat: clamped.lat,
      lng: clamped.lng,
      updated_at: nowIso,
    })
    .eq('id', id);

  if (error) throw error;
}

/** DB에 경계 밖으로 저장된 trackables 좌표를 현장 경계 안으로 맞춥니다. */
export async function reclampOutOfBoundaryTrackables(): Promise<number> {
  const supabase = assertSupabaseConfigured();

  const [{ data: rows, error }, { data: siteRows, error: sitesError }] = await Promise.all([
    supabase.from('trackables').select('id, site_id, lat, lng'),
    supabase.from('construction_sites').select('id, boundary, name'),
  ]);
  if (error) throw error;
  if (sitesError) throw sitesError;

  const boundaryBySiteId = new Map(
    (siteRows ?? [])
      .filter((s) => s.name !== AUTH_ACCOUNTS_SITE_NAME)
      .map((s) => [s.id as string, s.boundary as ConstructionSite['boundary']]),
  );

  let fixed = 0;
  for (const row of rows ?? []) {
    const boundary = boundaryBySiteId.get(row.site_id as string);
    if (!boundary) continue;

    const clamped = clampLatLngToBoundary(boundary, row.lat as number, row.lng as number);
    if (clamped.lat === row.lat && clamped.lng === row.lng) continue;

    await updateTrackableLocation(row.id as string, clamped, boundary);
    fixed += 1;
  }

  return fixed;
}

