import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { LoginScreen } from '../screens/LoginScreen';
import { useAuthStore } from '../store/authStore';
import { MainTabs } from './MainTabs';

export function RootNavigator() {
  const isReady = useAuthStore((s) => s.isReady);
  const profile = useAuthStore((s) => s.profile);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  if (!profile) {
    return <LoginScreen />;
  }

  return <MainTabs />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
});
