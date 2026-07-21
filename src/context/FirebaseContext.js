import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "../constants/theme";
import { auth } from "../services/firebaseConfig";

const FirebaseContext = createContext({ uid: null, ready: false });

export function FirebaseProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
      setReady(true);
    });
    return unsubscribe;
  }, []);

  // Wait for the initial auth check before rendering Login vs. the main app,
  // otherwise every launch flashes the login screen for a signed-in user.
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FirebaseContext.Provider value={{ uid, ready }}>
      {children}
    </FirebaseContext.Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});

export function useFirebase() {
  return useContext(FirebaseContext);
}
