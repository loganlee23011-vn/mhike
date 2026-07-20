import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing, typography } from "../constants/theme";

const ROWS = [
  { key: "search", label: "Search hikes", icon: "search-outline", screen: "Search" },
  { key: "reset", label: "Reset database", icon: "trash-outline" },
  { key: "about", label: "About M-Hike", icon: "information-circle-outline" },
];

export default function MoreScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={[typography.h1, styles.title]}>More</Text>
      <View style={styles.list}>
        {ROWS.map((row) => (
          <TouchableOpacity
            key={row.key}
            style={styles.row}
            onPress={() => row.screen && navigation.navigate(row.screen)}
          >
            <Ionicons name={row.icon} size={20} color={colors.primary} />
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
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
