import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ConstructionSite, SiteFormInput } from '../types/site';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  createConstructionSite,
  listConstructionSites,
  updateConstructionSite,
} from '../lib/supabaseApi';

export function useConstructionSitesQuery() {
  return useQuery({
    queryKey: ['construction_sites'] as const,
    queryFn: listConstructionSites,
    enabled: isSupabaseConfigured,
    staleTime: 5000,
  });
}

export function useCreateConstructionSiteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createConstructionSite,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['construction_sites'] });
    },
  });
}

export function useUpdateConstructionSiteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SiteFormInput }) =>
      updateConstructionSite(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['construction_sites'] });
    },
  });
}

export type ConstructionSitesQueryResult = ReturnType<typeof useConstructionSitesQuery>;
export type ConstructionSites = ConstructionSite[];

