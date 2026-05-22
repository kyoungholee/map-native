/** 출근 QR / 마이정보용 직원 프로필 (로그인 연동 전 목업) */
export type EmployeeProfile = {
  employeeId: string;
  loginId: string;
  name: string;
  roleLabel: string;
  position: string;
  department: string;
  siteId: string;
  siteName: string;
  siteAddress: string;
  phone: string;
  email: string;
  hiredAt: string;
};

/** 관리자 스캔 시 자동 출근 처리용 QR 페이로드 (향후 API 연동) */
export type AttendanceQrPayload = {
  v: 1;
  type: 'dooson_attendance';
  employeeId: string;
  loginId: string;
  name: string;
  roleLabel: string;
  position: string;
  siteId: string;
  siteName: string;
  issuedAt: string;
};
