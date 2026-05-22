import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AttendanceQrScreen } from '../screens/AttendanceQrScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MyInfoScreen } from '../screens/MyInfoScreen';
import { SiteListScreen } from '../screens/SiteListScreen';

export type MainTabParamList = {
  Home: undefined;
  SiteList: undefined;
  AttendanceQr: undefined;
  MyInfo: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_BAR_HEIGHT = 56;

const TAB_ICONS: Record<
  keyof MainTabParamList,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  SiteList: { active: 'list', inactive: 'list-outline' },
  AttendanceQr: { active: 'qr-code', inactive: 'qr-code-outline' },
  MyInfo: { active: 'person', inactive: 'person-outline' },
};

export function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1a1a1a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#fff',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: '홈' }}
      />
      <Tab.Screen
        name="SiteList"
        component={SiteListScreen}
        options={{ tabBarLabel: '현장 목록' }}
      />
      <Tab.Screen
        name="AttendanceQr"
        component={AttendanceQrScreen}
        options={{ tabBarLabel: '출근 QR' }}
      />
      <Tab.Screen
        name="MyInfo"
        component={MyInfoScreen}
        options={{ tabBarLabel: '마이정보' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
