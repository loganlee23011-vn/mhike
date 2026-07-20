import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, spacing, typography } from "../constants/theme";

const DIFFICULTIES = ["All", "Easy", "Moderate", "Difficult"];

export default function SearchScreen({ navigation }) {
  const [difficulty, setDifficulty] = useState("All");
  const [query, setQuery] = useState("");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Search & Filters" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hikes..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.sectionRow}>
          <Text style={typography.h2}>Filters</Text>
          <TouchableOpacity>
            <Text style={styles.link}>Reset</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.chipRow}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, difficulty === d && styles.chipActive]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={difficulty === d ? styles.chipTextActive : styles.chipText}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Date</Text>
        <View style={styles.rowGap}>
          <View style={styles.fieldHalf}>
            <Text style={typography.caption}>From</Text>
          </View>
          <View style={styles.fieldHalf}>
            <Text style={typography.caption}>To</Text>
          </View>
        </View>

        <Text style={styles.label}>Location</Text>
        <View style={styles.field}>
          <Text style={typography.caption}>Select location</Text>
        </View>

        <Text style={styles.label}>Length (km)</Text>
        <View style={styles.rowGap}>
          <View style={styles.fieldHalf}>
            <Text style={typography.caption}>Min</Text>
          </View>
          <View style={styles.fieldHalf}>
            <Text style={typography.caption}>Max</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => navigation.navigate("MainTabs", { screen: "Hikes" })}
        >
          <Text style={styles.applyText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: spacing.sm, color: colors.text },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  link: { color: colors.primary, fontWeight: "600" },
  label: { fontSize: 13, fontWeight: "600", color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextActive: { color: colors.surface, fontWeight: "600" },
  rowGap: { flexDirection: "row", gap: spacing.sm },
  fieldHalf: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  field: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  footer: { padding: spacing.md },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  applyText: { color: colors.surface, fontWeight: "700", fontSize: 15 },
});
