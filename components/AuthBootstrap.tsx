import { useEffect } from 'react';

import { attachAuthListener, useAuthStore } from '../store/authStore';

export function AuthBootstrap() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    attachAuthListener();
    void initialize();
  }, [initialize]);

  return null;
}
