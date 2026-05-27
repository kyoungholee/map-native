import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { simulateTrackablesTick } from '../lib/supabaseApi';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { TRACKABLES_QUERY_KEY } from '../lib/queryKeys';

const TICK_MS = 10_000;

/**
 * 10초마다 DB 좌표를 갱신(simulate)한 뒤 trackables 쿼리를 즉시 refetch.
 * 지도는 polling 타이밍과 어긋나지 않도록 여기서만 주기를 맞춥니다.
 */
export function useTrackableSimulation() {
  const queryClient = useQueryClient();
  const rpcHintLogged = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;

    const tick = async () => {
      try {
        const mode = await simulateTrackablesTick();
        if (cancelled) return;

        if (mode === 'app' && !rpcHintLogged.current) {
          rpcHintLogged.current = true;
          console.warn(
            '[Supabase] DB 함수 simulate_trackables_tick 이 없습니다. ' +
              '앱 fallback으로 좌표를 갱신합니다. ' +
              'docs/supabase-setup.sql 을 SQL Editor에서 실행하면 RPC로 더 안정적으로 동작합니다.',
          );
        }

        await queryClient.refetchQueries({
          queryKey: [...TRACKABLES_QUERY_KEY],
          type: 'active',
        });
      } catch (e) {
        console.warn('[trackable simulation]', e);
      }
    };

    void tick();
    const timer = setInterval(() => void tick(), TICK_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [queryClient]);
}
