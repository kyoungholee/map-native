import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  listTrackablesAll,
  updateTrackableLocation,
  type Trackable,
} from '../lib/supabaseApi';

import { TRACKABLES_QUERY_KEY } from '../lib/queryKeys';

export function useTrackablesQuery() {
  return useQuery({
    queryKey: [...TRACKABLES_QUERY_KEY],
    queryFn: listTrackablesAll,
    enabled: isSupabaseConfigured,
    // 주기 갱신은 useTrackableSimulation 이 simulate 후 refetch 로 처리
    staleTime: 5_000,
  });
}

export type TrackablesQueryResult = ReturnType<typeof useTrackablesQuery>;
export type Trackables = Trackable[];

export function useUpdateTrackableLocationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      lat,
      lng,
    }: {
      id: string;
      lat: number;
      lng: number;
    }) => updateTrackableLocation(id, { lat, lng }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...TRACKABLES_QUERY_KEY] });
    },
  });
}

