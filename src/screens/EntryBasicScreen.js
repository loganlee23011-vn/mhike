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

export default function EntryBasicScreen({ navigation }) {
  const [parking, setParking] = useState(null);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title="Add Hike"
        onBack={() => navigation.goBack()}
        rightIcon="close"
        onRightPress={() => navigation.popToTop()}
      />
      <StepIndicator step={1} label="Basic Information" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>Tell us about your hike.</Text>

        <Text style={styles.label}>Hike Name *</Text>
        <TextInput style={styles.input} placeholder="e.g. Snowdon Summit" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Location *</Text>
        <TextInput style={styles.input} placeholder="e.g. Snowdonia National Park, Wales" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Date *</Text>
        <TextInput style={styles.input} placeholder="Select date" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Parking Available *</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggle, parking === true && styles.toggleActive]}
            onPress={() => setParking(true)}
          >
            <Text style={parking === true ? styles.toggleTextActive : styles.toggleText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, parking === false && styles.toggleActive]}
            onPress={() => setParking(false)}
          >
            <Text style={parking === false ? styles.toggleTextActive : styles.toggleText}>No</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="A classic hike to the highest peak..."
          placeholderTextColor={colors.textMuted}
          multiline
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate("EntryRoute")}
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
  hint: { color: colors.textMuted, marginBottom: spacing.md },
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
  multiline: { minHeight: 80, textAlignVertical: "top" },
  toggleRow: { flexDirection: "row", gap: spacing.sm },
  toggle: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  toggleText: { color: colors.text, fontWeight: "600" },
  toggleTextActive: { color: colors.primary, fontWeight: "700" },
  footer: { padding: spacing.md },
  continueBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  continueText: { color: colors.surface, fontWeight: "700", fontSize: 15 },
});
