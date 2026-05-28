import { create } from 'zustand';

import {
  INITIAL_EQUIPMENT_LOCATIONS,
  INITIAL_WORKER_LOCATIONS,
  MOCK_WORK_SITE,
  type EquipmentKind,
} from '../data/mockWorkLocation';
import { SEED_SITES } from '../data/seedSites';
import { clampLatLngToBoundary } from '../lib/siteBoundary';

const SITE_BOUNDARY = SEED_SITES[0].boundary;

const STEP = 0.00012;
const SIM_INTERVAL_MS = 10_000;

export type WorkerLocation = {
  id: string;
  siteId: string;
  lat: number;
  lng: number;
  name: string;
  role: string;
  color: string;
  updatedAt: string;
};

export type EquipmentLocation = {
  id: string;
  siteId: string;
  kind: EquipmentKind;
  lat: number;
  lng: number;
  name: string;
  label: string;
  color: string;
  updatedAt: string;
};

type WorkLocationStore = {
  siteName: string;
  workers: WorkerLocation[];
  equipment: EquipmentLocation[];
  getWorker: (id: string) => WorkerLocation | undefined;
  getEquipment: (id: string) => EquipmentLocation | undefined;
};

function randomStep() {
  return (Math.random() - 0.5) * 2 * STEP;
}

function createInitialWorkers(): WorkerLocation[] {
  const now = new Date().toISOString();
  return INITIAL_WORKER_LOCATIONS.map((w) => ({
    ...w,
    siteId: MOCK_WORK_SITE.siteId,
    updatedAt: now,
  }));
}

function createInitialEquipment(): EquipmentLocation[] {
  const now = new Date().toISOString();
  return INITIAL_EQUIPMENT_LOCATIONS.map((e) => ({
    ...e,
    siteId: MOCK_WORK_SITE.siteId,
    updatedAt: now,
  }));
}

function moveWithinSite<T extends { lat: number; lng: number; updatedAt: string }>(
  items: T[],
  now: string,
): T[] {
  return items.map((item) => {
    const next = clampLatLngToBoundary(
      SITE_BOUNDARY,
      item.lat + randomStep(),
      item.lng + randomStep(),
    );
    return {
      ...item,
      lat: next.lat,
      lng: next.lng,
      updatedAt: now,
    };
  });
}

export const useWorkLocationStore = create<WorkLocationStore>((set, get) => ({
  siteName: MOCK_WORK_SITE.siteName,
  workers: createInitialWorkers(),
  equipment: createInitialEquipment(),

  getWorker: (id) => get().workers.find((w) => w.id === id),
  getEquipment: (id) => get().equipment.find((e) => e.id === id),
}));

let simulationTimer: ReturnType<typeof setInterval> | null = null;

function tickWorkLocations() {
  const now = new Date().toISOString();
  useWorkLocationStore.setState((state) => ({
    workers: moveWithinSite(state.workers, now),
    equipment: moveWithinSite(state.equipment, now),
  }));
}

export function startWorkLocationSimulation() {
  if (simulationTimer) return;
  simulationTimer = setInterval(tickWorkLocations, SIM_INTERVAL_MS);
}

export function stopWorkLocationSimulation() {
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
}

/** 마이정보(admin)용 — 하위 호환 */
export function useAdminWorkLocation() {
  const workers = useWorkLocationStore((s) => s.workers);
  const siteName = useWorkLocationStore((s) => s.siteName);
  const admin = workers.find((w) => w.id === 'EMP-0001') ?? workers[0];
  return {
    lat: admin.lat,
    lng: admin.lng,
    updatedAt: admin.updatedAt,
    siteName,
  };
}
