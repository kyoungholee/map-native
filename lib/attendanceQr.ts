import type { AttendanceQrPayload, EmployeeProfile } from '../types/employee';

const QR_PREFIX = 'DSNATT1:' as const;

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
  // 스캐너 앱에서 JSON이 그대로 노출되지 않도록 인코딩한 포맷을 사용합니다.
  // (앱 내부 스캐너는 parseAttendanceQrValue에서 디코딩/검증)
  return `${QR_PREFIX}${encodeURIComponent(JSON.stringify(buildAttendanceQrPayload(profile)))}`;
}

export type AttendanceScanResult = AttendanceQrPayload & {
  scannedAt: string;
};

/** 스캔한 QR 문자열 → 출근 페이로드 (유효하지 않으면 null) */
export function parseAttendanceQrValue(raw: string): AttendanceQrPayload | null {
  try {
    const trimmed = raw.trim();
    const json =
      trimmed.startsWith(QR_PREFIX)
        ? decodeURIComponent(trimmed.slice(QR_PREFIX.length))
        : trimmed;

    const parsed = JSON.parse(json) as Partial<AttendanceQrPayload>;
    if (parsed.v !== 1 || parsed.type !== 'dooson_attendance') return null;
    if (
      !parsed.employeeId ||
      !parsed.loginId ||
      !parsed.name ||
      !parsed.siteId ||
      !parsed.siteName
    ) {
      return null;
    }
    return {
      v: 1,
      type: 'dooson_attendance',
      employeeId: parsed.employeeId,
      loginId: parsed.loginId,
      name: parsed.name,
      roleLabel: parsed.roleLabel ?? '',
      position: parsed.position ?? '',
      siteId: parsed.siteId,
      siteName: parsed.siteName,
      issuedAt: parsed.issuedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function toAttendanceScanResult(payload: AttendanceQrPayload): AttendanceScanResult {
  return {
    ...payload,
    scannedAt: new Date().toISOString(),
  };
}

export function formatAttendanceDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
