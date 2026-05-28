import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthBootstrap } from "./components/AuthBootstrap";
import { SupabaseBootstrap } from "./components/SupabaseBootstrap";
import { RootNavigator } from "./navigation/RootNavigator";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import {
  startWorkLocationSimulation,
  stopWorkLocationSimulation,
} from "./store/workLocationStore";

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (!isSupabaseConfigured) {
      startWorkLocationSimulation();
      return () => stopWorkLocationSimulation();
    }
    return undefined;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <SupabaseBootstrap />
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
