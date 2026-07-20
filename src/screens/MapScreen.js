import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography } from "../constants/theme";

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={[typography.h1, styles.title]}>Map</Text>
      <View style={styles.placeholder}>
        <Ionicons name="map-outline" size={40} color={colors.textMuted} />
        <Text style={typography.caption}>Map view coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  title: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
});
