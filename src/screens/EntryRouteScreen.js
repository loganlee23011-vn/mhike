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
import StepIndicator from "../components/StepIndicator";
import { colors, radius, spacing } from "../constants/theme";

const DIFFICULTIES = ["Easy", "Moderate", "Hard", "Expert"];
const TERRAINS = ["Mountain", "Forest", "Coastal", "Valley", "Other"];

export default function EntryRouteScreen({ navigation }) {
  const [difficulty, setDifficulty] = useState("Moderate");
  const [terrain, setTerrain] = useState("Mountain");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title="Add Hike"
        onBack={() => navigation.goBack()}
        rightIcon="close"
        onRightPress={() => navigation.popToTop()}
      />
      <StepIndicator step={2} label="Trail Details" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Length *</Text>
        <TextInput
          style={styles.input}
          placeholder="9.2"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Difficulty *</Text>
        <View style={styles.chipRow}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, difficulty === d && styles.chipActive]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={difficulty === d ? styles.chipTextActive : styles.chipText}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Estimated Duration *</Text>
        <TextInput style={styles.input} placeholder="3 - 5 hours" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Terrain Type *</Text>
        <View style={styles.chipRow}>
          {TERRAINS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, terrain === t && styles.chipActive]}
              onPress={() => setTerrain(t)}
            >
              <Text style={terrain === t ? styles.chipTextActive : styles.chipText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate("EntryLocation")}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  label: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextActive: { color: colors.primary, fontWeight: "700" },
  footer: { flexDirection: "row", gap: spacing.sm, padding: spacing.md },
  backBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  backText: { color: colors.text, fontWeight: "700" },
  continueBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  continueText: { color: colors.surface, fontWeight: "700", fontSize: 15 },
});
