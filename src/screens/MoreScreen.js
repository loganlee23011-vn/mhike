import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing, typography } from "../constants/theme";
import { useFirebase } from "../context/FirebaseContext";
import { signOutUser } from "../services/authService";
import { resetHikes } from "../services/hikeService";

export default function MoreScreen({ navigation }) {
  const { uid } = useFirebase();
  const [resetting, setResetting] = useState(false);

  const handleLogout = () => {
    Alert.alert("Log out?", "You'll need to sign in again to access your hikes.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => signOutUser().catch((err) => Alert.alert("Log out failed", err.message)),
      },
    ]);
  };

  const handleReset = () => {
    Alert.alert(
      "Reset database?",
      "This permanently deletes all your hikes and observations.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setResetting(true);
            try {
              await resetHikes(uid);
            } catch (err) {
              Alert.alert("Reset failed", err.message);
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  const rows = [
    { key: "search", label: "Search hikes", icon: "search", onPress: () => navigation.navigate("Search") },
    { key: "reset", label: "Reset database", icon: "delete-outline", onPress: handleReset },
    { key: "about", label: "About M-Hike", icon: "info-outline", onPress: () => {} },
    { key: "logout", label: "Log out", icon: "logout", onPress: handleLogout },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={[typography.h1, styles.title]}>More</Text>
      <View style={styles.list}>
        {rows.map((row) => (
          <TouchableOpacity key={row.key} style={styles.row} onPress={row.onPress} disabled={resetting}>
            {row.key === "reset" && resetting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialIcons name={row.icon} size={20} color={colors.primary} />
            )}
            <Text style={styles.rowLabel}>{row.label}</Text>
            <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  title: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.md },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rowLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: "600" },
});
