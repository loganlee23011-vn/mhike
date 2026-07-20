import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { FirebaseProvider } from "./src/context/FirebaseContext";
import { HikeFormProvider } from "./src/context/HikeFormContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <FirebaseProvider>
        <HikeFormProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </HikeFormProvider>
      </FirebaseProvider>
    </SafeAreaProvider>
  );
}
