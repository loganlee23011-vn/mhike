import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ScreenHeader from "../components/ScreenHeader";
import StepIndicator from "../components/StepIndicator";
import { colors, radius, spacing, typography } from "../constants/theme";

export default function EntryLocationScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title="Add Hike"
        onBack={() => navigation.goBack()}
        rightIcon="close"
        onRightPress={() => navigation.popToTop()}
      />
      <StepIndicator step={3} label="Location & Safety" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.caption}>Set your hike location and check weather and safety conditions.</Text>

        <View style={styles.mapPlaceholder}>
          <Ionicons name="location" size={28} color={colors.primary} />
        </View>

        <View style={styles.rowGap}>
          <TouchableOpacity style={styles.pillBtn}>
            <Ionicons name="locate-outline" size={16} color={colors.primary} />
            <Text style={styles.pillText}>Use current location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pillBtn}>
            <Ionicons name="search-outline" size={16} color={colors.primary} />
            <Text style={styles.pillText}>Search location</Text>
          </TouchableOpacity>
        </View>

        <Text style={[typography.h2, styles.sectionTitle]}>Weather Preview</Text>
        <View style={styles.card}>
          <Text style={styles.temp}>18°C</Text>
          <Text style={typography.caption}>Partly cloudy</Text>
        </View>

        <View style={styles.safetyCard}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={styles.safetyText}>Conditions look good for your hike!</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate("Confirm")}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  mapPlaceholder: {
    height: 160,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.sm,
  },
  rowGap: { flexDirection: "row", gap: spacing.sm },
  pillBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
  },
  pillText: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  sectionTitle: { marginTop: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  temp: { fontSize: 22, fontWeight: "700", color: colors.text },
  safetyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  safetyText: { flex: 1, color: colors.text },
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
