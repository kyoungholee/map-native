import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { CONSTRUCTION_SITES_QUERY_KEY, TRACKABLES_QUERY_KEY } from '../lib/queryKeys';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { seedAuthAccountsInDbIfEmpty } from '../lib/supabaseAuthSeed';
import { reclampOutOfBoundaryTrackables } from '../lib/supabaseApi';
import { seedSupabaseFromMocksIfEmpty } from '../lib/supabaseSeed';

/** 앱 시작 시 DB가 비어 있으면 mock 데이터를 Supabase에 시드합니다. */
export function useSupabaseBootstrap() {
  const queryClient = useQueryClient();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured || ranRef.current) return;
    ranRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        await seedAuthAccountsInDbIfEmpty();
        const seeded = await seedSupabaseFromMocksIfEmpty();
        const reclamped = await reclampOutOfBoundaryTrackables();
        if (reclamped > 0) {
          await queryClient.invalidateQueries({ queryKey: [...TRACKABLES_QUERY_KEY] });
        }
        if (cancelled) return;
        if (seeded) {
          await queryClient.invalidateQueries({ queryKey: [...CONSTRUCTION_SITES_QUERY_KEY] });
          await queryClient.invalidateQueries({ queryKey: [...TRACKABLES_QUERY_KEY] });
          await queryClient.refetchQueries({ queryKey: [...TRACKABLES_QUERY_KEY], type: 'active' });
        }
      } catch (e) {
        console.warn('[Supabase bootstrap]', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryClient]);
}
