import { SEED_SITES } from '../data/seedSites';
import {
  INITIAL_EQUIPMENT_LOCATIONS,
  INITIAL_WORKER_LOCATIONS,
} from '../data/mockWorkLocation';
import type { SiteFormInput } from '../types/site';
import {
  createConstructionSite,
  listConstructionSites,
  listTrackablesAll,
} from './supabaseApi';
import { isSupabaseConfigured, supabaseClient } from './supabaseClient';

function siteToFormInput(site: (typeof SEED_SITES)[number]): SiteFormInput {
  return {
    name: site.name,
    address: site.address,
    manager: site.manager,
    phone: site.phone,
    startDate: site.startDate,
    endDate: site.endDate,
    status: site.status,
    boundary: site.boundary,
  };
}

/**
 * DB가 비어 있을 때 앱에 보이던 mock 현장·인력·장비를 Supabase에 1회 시드합니다.
 */
export async function seedSupabaseFromMocksIfEmpty(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabaseClient) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  const supabase = supabaseClient;

  const existingSites = await listConstructionSites();
  if (existingSites.length > 0) {
    const trackables = await listTrackablesAll();
    if (trackables.length > 0) return false;
  }

  let siteId =
    existingSites.find((s) => s.name === SEED_SITES[0]?.name)?.id ?? existingSites[0]?.id;

  if (existingSites.length === 0) {
    for (const seed of SEED_SITES) {
      const created = await createConstructionSite(siteToFormInput(seed));
      siteId = created.id;
    }
  }

  if (!siteId) {
    const sites = await listConstructionSites();
    siteId = sites.find((s) => s.name === SEED_SITES[0]?.name)?.id ?? sites[0]?.id;
  }

  if (!siteId) {
    throw new Error('시드용 현장을 만들지 못했습니다.');
  }

  const workerRows = INITIAL_WORKER_LOCATIONS.map((w) => ({
    site_id: siteId,
    kind: 'person' as const,
    name: w.name,
    role: w.role,
    label: null,
    color: w.color,
    lat: w.lat,
    lng: w.lng,
  }));

  const equipmentRows = INITIAL_EQUIPMENT_LOCATIONS.map((e) => ({
    site_id: siteId,
    kind: e.kind,
    name: e.name,
    role: null,
    label: e.label,
    color: e.color,
    lat: e.lat,
    lng: e.lng,
  }));

  const { error } = await supabase.from('trackables').insert([...workerRows, ...equipmentRows]);

  if (error) throw error;
  return true;
}
