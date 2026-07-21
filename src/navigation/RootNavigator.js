import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useFirebase } from "../context/FirebaseContext";
import ConfirmScreen from "../screens/ConfirmScreen";
import DetailScreen from "../screens/DetailScreen";
import EntryBasicScreen from "../screens/EntryBasicScreen";
import EntryLocationScreen from "../screens/EntryLocationScreen";
import EntryRouteScreen from "../screens/EntryRouteScreen";
import ObservationScreen from "../screens/ObservationScreen";
import SearchScreen from "../screens/SearchScreen";
import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { uid } = useFirebase();

  if (!uid) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="EntryBasic" component={EntryBasicScreen} />
      <Stack.Screen name="EntryRoute" component={EntryRouteScreen} />
      <Stack.Screen name="EntryLocation" component={EntryLocationScreen} />
      <Stack.Screen name="Confirm" component={ConfirmScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Observations" component={ObservationScreen} />
    </Stack.Navigator>
  );
}
