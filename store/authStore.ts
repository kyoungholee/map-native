import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { isAuthLoginId } from '../data/authProfiles';
import {
  fetchProfileForUser,
  getCurrentSession,
  signInWithCredentials,
  signOut as signOutApi,
} from '../lib/authApi';
import { isSupabaseConfigured, supabaseClient } from '../lib/supabaseClient';
import type { EmployeeProfile } from '../types/employee';

type AuthStore = {
  session: Session | null;
  profile: EmployeeProfile | null;
  isReady: boolean;
  isSigningIn: boolean;
  initialize: () => Promise<void>;
  signIn: (loginId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  profile: null,
  isReady: false,
  isSigningIn: false,

  initialize: async () => {
    try {
      if (!isSupabaseConfigured || !supabaseClient) {
        set({ session: null, profile: null, isReady: true });
        return;
      }

      const session = await getCurrentSession();
      if (!session?.user) {
        set({ session: null, profile: null, isReady: true });
        return;
      }

      const loginId =
        (typeof session.user.user_metadata?.login_id === 'string' &&
          session.user.user_metadata.login_id) ||
        session.user.email?.split('@')[0] ||
        '';

      const profile = await fetchProfileForUser(
        session.user.id,
        isAuthLoginId(loginId) ? loginId : 'admin',
      );

      set({ session, profile, isReady: true });
    } catch (e) {
      console.warn('[auth initialize]', e);
      set({ session: null, profile: null, isReady: true });
    }
  },

  signIn: async (loginId, password) => {
    set({ isSigningIn: true });
    try {
      const { session, profile } = await signInWithCredentials(loginId, password);
      set({ session, profile, isSigningIn: false });
    } catch (e) {
      set({ isSigningIn: false });
      throw e;
    }
  },

  signOut: async () => {
    await signOutApi();
    set({ session: null, profile: null });
  },
}));

let authListenerAttached = false;

/** Supabase 세션 변경(만료·갱신)을 스토어에 반영 */
export function attachAuthListener(): void {
  if (authListenerAttached || !isSupabaseConfigured || !supabaseClient) return;
  authListenerAttached = true;

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      setAuthFromListener(null, null);
      return;
    }

    if (!session?.user) {
      setAuthFromListener(null, null);
      return;
    }

    const loginId =
      (typeof session.user.user_metadata?.login_id === 'string' &&
        session.user.user_metadata.login_id) ||
      session.user.email?.split('@')[0] ||
      'admin';

    try {
      const profile = await fetchProfileForUser(
        session.user.id,
        isAuthLoginId(loginId) ? loginId : 'admin',
      );
      setAuthFromListener(session, profile);
    } catch (e) {
      console.warn('[auth listener]', e);
      setAuthFromListener(null, null);
    }
  });
}

function setAuthFromListener(session: Session | null, profile: EmployeeProfile | null) {
  const { session: currentSession, profile: currentProfile } = useAuthStore.getState();
  if (currentSession?.access_token === session?.access_token && currentProfile === profile) {
    return;
  }
  useAuthStore.setState({ session, profile, isReady: true });
}
