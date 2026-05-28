import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { parseAttendanceQrValue, type AttendanceScanResult, toAttendanceScanResult } from '../lib/attendanceQr';

type Props = {
  onScanned: (result: AttendanceScanResult) => void;
  onInvalidQr: () => void;
};

const SCAN_COOLDOWN_MS = 2500;

export function AttendanceQrScanner({ onScanned, onInvalidQr }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const lastScanRef = useRef(0);

  const handleBarcode = useCallback(
    ({ data }: { data: string }) => {
      const now = Date.now();
      if (now - lastScanRef.current < SCAN_COOLDOWN_MS) return;
      lastScanRef.current = now;

      const payload = parseAttendanceQrValue(data);
      if (!payload) {
        onInvalidQr();
        return;
      }

      onScanned(toAttendanceScanResult(payload));
    },
    [onInvalidQr, onScanned],
  );

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionBox}>
        <Text style={styles.permissionTitle}>카메라 권한이 필요합니다</Text>
        <Text style={styles.permissionText}>
          근무자의 출근 QR을 스캔하려면 카메라 접근을 허용해 주세요.
        </Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>권한 허용</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.scannerWrap}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarcode}
      />
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>출근 QR을 사각형 안에 맞춰 주세요</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionBtn: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permissionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  scannerWrap: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  hint: {
    position: 'absolute',
    bottom: 16,
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
