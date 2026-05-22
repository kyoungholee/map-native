import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ConstructionSite, SiteFormInput, SiteStatus } from '../../types/site';

const STATUS_OPTIONS: SiteStatus[] = ['진행중', '준공', '중단'];

const EMPTY_FORM: SiteFormInput = {
  name: '',
  address: '',
  manager: '',
  phone: '',
  startDate: '',
  endDate: '',
  status: '진행중',
  boundary: {
    northLat: 0,
    eastLng: 0,
    southLat: 0,
    westLng: 0,
  },
};

type Props = {
  visible: boolean;
  editingSite?: ConstructionSite | null;
  onClose: () => void;
  onSave: (input: SiteFormInput) => void;
};

export function SiteFormModal({ visible, editingSite, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<SiteFormInput>(EMPTY_FORM);

  useEffect(() => {
    if (visible && editingSite) {
      setForm({
        name: editingSite.name,
        address: editingSite.address,
        manager: editingSite.manager,
        phone: editingSite.phone,
        startDate: editingSite.startDate,
        endDate: editingSite.endDate,
        status: editingSite.status,
        boundary: { ...editingSite.boundary },
      });
    } else if (visible) {
      setForm(EMPTY_FORM);
    }
  }, [visible, editingSite]);

  const setField = <K extends keyof SiteFormInput>(key: K, value: SiteFormInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setBoundary = (key: keyof SiteFormInput['boundary'], value: string) => {
    const num = parseFloat(value) || 0;
    setForm((prev) => ({
      ...prev,
      boundary: { ...prev.boundary, [key]: num },
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      Alert.alert('입력 확인', '현장명을 입력해 주세요.');
      return;
    }
    if (!form.address.trim()) {
      Alert.alert('입력 확인', '주소를 입력해 주세요.');
      return;
    }
    const { northLat, eastLng, southLat, westLng } = form.boundary;
    if (!northLat || !eastLng || !southLat || !westLng) {
      Alert.alert('입력 확인', '현장 경계 좌표 4개를 모두 입력해 주세요.');
      return;
    }
    onSave(form);
    onClose();
  };

  const isEdit = Boolean(editingSite);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={28} color="#374151" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{isEdit ? '현장 수정' : '현장 등록'}</Text>
            <Text style={styles.subtitle}>건설현장 정보를 입력해 주세요.</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Field label="현장명" required>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => setField('name', v)}
              placeholder="예: 에코24BL"
              placeholderTextColor="#9ca3af"
            />
          </Field>

          <Field label="주소" required>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.address}
              onChangeText={(v) => setField('address', v)}
              placeholder="부산광역시 강서구 ..."
              placeholderTextColor="#9ca3af"
              multiline
            />
          </Field>

          <View style={styles.row2}>
            <Field label="현장 책임자" style={styles.half}>
              <TextInput
                style={styles.input}
                value={form.manager}
                onChangeText={(v) => setField('manager', v)}
                placeholder="홍길동"
                placeholderTextColor="#9ca3af"
              />
            </Field>
            <Field label="연락처" style={styles.half}>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(v) => setField('phone', v)}
                placeholder="010-1234-1234"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </Field>
          </View>

          <View style={styles.row2}>
            <Field label="착공일" style={styles.half}>
              <TextInput
                style={styles.input}
                value={form.startDate}
                onChangeText={(v) => setField('startDate', v)}
                placeholder="2026. 01. 01."
                placeholderTextColor="#9ca3af"
              />
            </Field>
            <Field label="준공예정일" style={styles.half}>
              <TextInput
                style={styles.input}
                value={form.endDate}
                onChangeText={(v) => setField('endDate', v)}
                placeholder="2026. 12. 31."
                placeholderTextColor="#9ca3af"
              />
            </Field>
          </View>

          <Field label="상태">
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((s) => (
                <Pressable
                  key={s}
                  style={[
                    styles.statusChip,
                    form.status === s && styles.statusChipActive,
                  ]}
                  onPress={() => setField('status', s)}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      form.status === s && styles.statusChipTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <View style={styles.boundaryBox}>
            <Text style={styles.boundaryTitle}>현장 경계 좌표</Text>
            <View style={styles.row2}>
              <Field label="북쪽 (위도)" style={styles.half}>
                <TextInput
                  style={styles.input}
                  value={String(form.boundary.northLat || '')}
                  onChangeText={(v) => setBoundary('northLat', v)}
                  placeholder="35.151..."
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </Field>
              <Field label="동쪽 (경도)" style={styles.half}>
                <TextInput
                  style={styles.input}
                  value={String(form.boundary.eastLng || '')}
                  onChangeText={(v) => setBoundary('eastLng', v)}
                  placeholder="128.918..."
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </Field>
            </View>
            <View style={styles.row2}>
              <Field label="남쪽 (위도)" style={styles.half}>
                <TextInput
                  style={styles.input}
                  value={String(form.boundary.southLat || '')}
                  onChangeText={(v) => setBoundary('southLat', v)}
                  placeholder="35.148..."
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </Field>
              <Field label="서쪽 (경도)" style={styles.half}>
                <TextInput
                  style={styles.input}
                  value={String(form.boundary.westLng || '')}
                  onChangeText={(v) => setBoundary('westLng', v)}
                  placeholder="128.921..."
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </Field>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>{isEdit ? '수정' : '등록'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({
  label,
  required,
  children,
  style,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  scroll: { flex: 1 },
  form: { padding: 16, paddingBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  required: { color: '#ef4444' },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  row2: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  statusChipActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  statusChipText: { fontSize: 14, color: '#6b7280' },
  statusChipTextActive: { color: '#2563eb', fontWeight: '600' },
  boundaryBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fafafa',
  },
  boundaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  saveText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
