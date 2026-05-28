import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AUTH_LOGIN_IDS } from "../data/authProfiles";
import { useAuthStore } from "../store/authStore";

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((s) => s.signIn);
  const isSigningIn = useAuthStore((s) => s.isSigningIn);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    const trimmedId = loginId.trim();
    if (!trimmedId || !password) {
      Alert.alert("로그인", "아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      await signIn(trimmedId, password);
    } catch (e) {
      const message = e instanceof Error ? e.message : "로그인에 실패했습니다.";
      Alert.alert("로그인 실패", message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Text style={styles.brand}>건설현장</Text>
        <Text style={styles.subtitle}>현장 관리 앱에 로그인하세요</Text>

        <View style={styles.form}>
          <Text style={styles.label}>아이디</Text>
          <TextInput
            style={styles.input}
            value={loginId}
            onChangeText={setLoginId}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="admin 또는 test"
            placeholderTextColor="#9ca3af"
            editable={!isSigningIn}
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="비밀번호"
            placeholderTextColor="#9ca3af"
            editable={!isSigningIn}
            onSubmitEditing={onSubmit}
          />

          <Pressable
            style={[styles.submitBtn, isSigningIn && styles.submitBtnDisabled]}
            onPress={onSubmit}
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>로그인</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.hint}>
          테스트 계정: {AUTH_LOGIN_IDS.join(", ")}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#fff",
  },
  submitBtn: {
    marginTop: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  hint: {
    marginTop: 20,
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 18,
  },
});
