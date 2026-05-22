import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { NaverMapView } from './components/NaverMapView';

export default function App() {
  return (
    <View style={styles.container}>
      <NaverMapView style={styles.map} />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
});
