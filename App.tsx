import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MainTabs } from './navigation/MainTabs';
import {
  startWorkLocationSimulation,
  stopWorkLocationSimulation,
} from './store/workLocationStore';

export default function App() {
  useEffect(() => {
    startWorkLocationSimulation();
    return () => stopWorkLocationSimulation();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MainTabs />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
