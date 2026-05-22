import type { AttendanceQrPayload, EmployeeProfile } from '../types/employee';

export function buildAttendanceQrPayload(
  profile: EmployeeProfile,
): AttendanceQrPayload {
  return {
    v: 1,
    type: 'dooson_attendance',
    employeeId: profile.employeeId,
    loginId: profile.loginId,
    name: profile.name,
    roleLabel: profile.roleLabel,
    position: profile.position,
    siteId: profile.siteId,
    siteName: profile.siteName,
    issuedAt: new Date().toISOString(),
  };
}

/** QR 코드에 담을 문자열 (관리자 앱 스캔 → 추후 자동 출근) */
export function buildAttendanceQrValue(profile: EmployeeProfile): string {
  return JSON.stringify(buildAttendanceQrPayload(profile));
}
