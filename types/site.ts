export type SiteStatus = '진행중' | '준공' | '중단';

/** 현장 경계 — 북·동·남·서 (위도/경도) */
export type SiteBoundary = {
  northLat: number;
  eastLng: number;
  southLat: number;
  westLng: number;
};

export type ConstructionSite = {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  startDate: string;
  endDate: string;
  status: SiteStatus;
  boundary: SiteBoundary;
  createdAt: string;
};

export type SiteFormInput = Omit<ConstructionSite, 'id' | 'createdAt'>;
