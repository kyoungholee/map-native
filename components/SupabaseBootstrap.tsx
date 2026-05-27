import { useSupabaseBootstrap } from '../hooks/useSupabaseBootstrap';
import { useTrackableSimulation } from '../hooks/useTrackableSimulation';

export function SupabaseBootstrap() {
  useSupabaseBootstrap();
  useTrackableSimulation();
  return null;
}
