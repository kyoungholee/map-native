import { create } from 'zustand';

import { SEED_SITES } from '../data/seedSites';
import type { ConstructionSite, SiteFormInput } from '../types/site';

type SiteStore = {
  sites: ConstructionSite[];
  addSite: (input: SiteFormInput) => ConstructionSite;
  updateSite: (id: string, input: SiteFormInput) => void;
  getSite: (id: string) => ConstructionSite | undefined;
};

export const useSiteStore = create<SiteStore>((set, get) => ({
  sites: SEED_SITES,

  addSite: (input) => {
    const site: ConstructionSite = {
      ...input,
      id: `site-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ sites: [site, ...state.sites] }));
    return site;
  },

  updateSite: (id, input) => {
    set((state) => ({
      sites: state.sites.map((s) =>
        s.id === id ? { ...s, ...input } : s,
      ),
    }));
  },

  getSite: (id) => get().sites.find((s) => s.id === id),
}));
