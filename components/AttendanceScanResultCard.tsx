import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AttendanceScanResult } from '../lib/attendanceQr';

type Props = {
  result: AttendanceScanResult;
  onScanAgain: () => void;
};

export function AttendanceScanResultCard({ result, onScanAgain }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={56} color="#16a34a" />
      </View>
      <Text style={styles.title}>출근이 완료되었습니다.</Text>
      <Text style={styles.subtitle}>{result.name} 님의 출근이 정상 처리되었습니다.</Text>

      <Pressable style={styles.scanAgainBtn} onPress={onScanAgain}>
        <Text style={styles.scanAgainText}>다른 QR 스캔하기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#16a34a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  scanAgainBtn: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
