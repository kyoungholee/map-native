import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileInfoRow } from '../components/ProfileInfoRow';
import { MOCK_ADMIN } from '../data/mockWorkers';
import { useAdminWorkLocation } from '../store/workLocationStore';

function formatCoord(value: number) {
  return value.toFixed(8);
}

function formatUpdatedAt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MyInfoScreen() {
  const insets = useSafeAreaInsets();
  const user = MOCK_ADMIN;
  const { lat, lng, updatedAt, siteName } = useAdminWorkLocation();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.slice(0, 1)}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.loginId}>@{user.loginId}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user.position}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>현재 GPS 좌표</Text>
        <Text style={styles.gpsHint}>
          {siteName} 현장 안에서 10초마다 좌표가 자동 갱신됩니다. 홈 지도에서
          김도운·이준호 위치를 함께 볼 수 있습니다.
        </Text>

        <ProfileInfoRow label="위도 (Latitude)" value={formatCoord(lat)} />
        <ProfileInfoRow label="경도 (Longitude)" value={formatCoord(lng)} />
        <ProfileInfoRow label="소속 현장" value={siteName} />
        <ProfileInfoRow label="좌표 기준" value={formatUpdatedAt(updatedAt)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>근무 정보</Text>
        <ProfileInfoRow label="관리 구분" value={user.roleLabel} />
        <ProfileInfoRow label="직책" value={user.position} />
        <ProfileInfoRow label="소속" value={user.department} />
        <ProfileInfoRow label="담당 현장" value={user.siteName} />
        <ProfileInfoRow label="현장 주소" value={user.siteAddress} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정 정보</Text>
        <ProfileInfoRow label="사번" value={user.employeeId} />
        <ProfileInfoRow label="아이디" value={user.loginId} />
        <ProfileInfoRow label="연락처" value={user.phone} />
        <ProfileInfoRow label="이메일" value={user.email} />
        <ProfileInfoRow label="입사일" value={user.hiredAt} />
      </View>

      <Text style={styles.notice}>
        실제 GPS·로그인 연동은 추후 개발 예정입니다.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  loginId: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  badge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingTop: 16,
    paddingBottom: 4,
  },
  gpsHint: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 8,
    paddingBottom: 4,
  },
  notice: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
});
