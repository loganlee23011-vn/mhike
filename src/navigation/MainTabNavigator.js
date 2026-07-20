import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { colors } from "../constants/theme";
import HikesScreen from "../screens/HikesScreen";
import HomeScreen from "../screens/HomeScreen";
import MapScreen from "../screens/MapScreen";
import MoreScreen from "../screens/MoreScreen";

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: ["home", "home-outline"],
  Hikes: ["bag-handle", "bag-handle-outline"],
  Map: ["map", "map-outline"],
  More: ["ellipsis-horizontal", "ellipsis-horizontal-outline"],
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Hikes" component={HikesScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
