import { ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { buildAttendanceQrValue } from '../lib/attendanceQr';
import { useAuthStore } from '../store/authStore';

const QR_SIZE = 220;

export function AttendanceQrScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.profile);
  const qrValue = user ? buildAttendanceQrValue(user) : '';

  if (!user) return null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <Text style={styles.title}>출근 QR</Text>
      <Text style={styles.subtitle}>
        현장 관리자가 이 QR을 스캔하면 출근 처리됩니다.{'\n'}
        (자동 출근 연동은 추후 개발 예정)
      </Text>

      <View style={styles.qrCard}>
        <View style={styles.qrWrap}>
          <QRCode value={qrValue} size={QR_SIZE} />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userMeta}>
          {user.position} · {user.siteName}
        </Text>
        <Text style={styles.userId}>@{user.loginId}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>QR에 포함된 정보</Text>
        <InfoLine label="이름" value={user.name} />
        <InfoLine label="아이디" value={user.loginId} />
        <InfoLine label="사번" value={user.employeeId} />
        <InfoLine label="직책" value={user.position} />
        <InfoLine label="관리 구분" value={user.roleLabel} />
        <InfoLine label="담당 현장" value={user.siteName} />
      </View>
    </ScrollView>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  qrCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  qrWrap: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 20,
  },
  userMeta: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 6,
    textAlign: 'center',
  },
  userId: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
});
