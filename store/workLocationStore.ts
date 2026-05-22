import { create } from 'zustand';

import {
  INITIAL_WORKER_LOCATIONS,
  MOCK_WORK_SITE,
} from '../data/mockWorkLocation';
import { SEED_SITES } from '../data/seedSites';

const SITE_BOUNDARY = SEED_SITES[0].boundary;

const LAT_MIN = Math.min(SITE_BOUNDARY.southLat, SITE_BOUNDARY.northLat);
const LAT_MAX = Math.max(SITE_BOUNDARY.southLat, SITE_BOUNDARY.northLat);
const LNG_MIN = Math.min(SITE_BOUNDARY.westLng, SITE_BOUNDARY.eastLng);
const LNG_MAX = Math.max(SITE_BOUNDARY.westLng, SITE_BOUNDARY.eastLng);

const STEP = 0.00012;
const SIM_INTERVAL_MS = 10_000;

export type WorkerLocation = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  role: string;
  color: string;
  updatedAt: string;
};

type WorkLocationStore = {
  siteName: string;
  workers: WorkerLocation[];
  getWorker: (id: string) => WorkerLocation | undefined;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function randomStep() {
  return (Math.random() - 0.5) * 2 * STEP;
}

function createInitialWorkers(): WorkerLocation[] {
  const now = new Date().toISOString();
  return INITIAL_WORKER_LOCATIONS.map((w) => ({
    ...w,
    updatedAt: now,
  }));
}

export const useWorkLocationStore = create<WorkLocationStore>((set, get) => ({
  siteName: MOCK_WORK_SITE.siteName,
  workers: createInitialWorkers(),

  getWorker: (id) => get().workers.find((w) => w.id === id),
}));

let simulationTimer: ReturnType<typeof setInterval> | null = null;

function tickWorkLocations() {
  const now = new Date().toISOString();
  useWorkLocationStore.setState((state) => ({
    workers: state.workers.map((w) => ({
      ...w,
      lat: clamp(w.lat + randomStep(), LAT_MIN, LAT_MAX),
      lng: clamp(w.lng + randomStep(), LNG_MIN, LNG_MAX),
      updatedAt: now,
    })),
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
