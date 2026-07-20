import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
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
      if (user) {
        setUid(user.uid);
        setReady(true);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed", error);
          setReady(true);
        });
      }
    });
    return unsubscribe;
  }, []);

  // Screens subscribe to Firestore on mount; mounting them before anonymous
  // sign-in resolves attaches listeners while request.auth is still null,
  // which Firestore Security Rules reject with a permission-denied error
  // that the listener never recovers from. Gate rendering on `ready`.
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
