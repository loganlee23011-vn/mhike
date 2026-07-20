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
import { useHikeForm } from "../context/HikeFormContext";

function parseDate(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const date = new Date(`${text.trim()}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateInputText(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function EntryBasicScreen({ navigation }) {
  const { form, setFields, resetForm, editingHikeId } = useHikeForm();
  const [dateText, setDateText] = useState(
    form.hikeDate ? toDateInputText(form.hikeDate) : ""
  );
  const [errors, setErrors] = useState({});

  const handleContinue = () => {
    const hikeDate = parseDate(dateText);
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Hike name is required.";
    if (!form.location.trim()) nextErrors.location = "Location is required.";
    if (!hikeDate) nextErrors.date = "Enter a valid date (YYYY-MM-DD).";
    if (form.parkingAvailable === null) nextErrors.parking = "Select an option.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setFields({ hikeDate });
    navigation.navigate("EntryRoute");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title={editingHikeId ? "Edit Hike" : "Add Hike"}
        onBack={() => navigation.goBack()}
        rightIcon="close"
        onRightPress={() => {
          resetForm();
          navigation.popToTop();
        }}
      />
      <StepIndicator step={1} label="Basic Information" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>Tell us about your hike.</Text>

        <Text style={styles.label}>Hike Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Snowdon Summit"
          placeholderTextColor={colors.textMuted}
          value={form.name}
          onChangeText={(name) => setFields({ name })}
        />
        {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Snowdonia National Park, Wales"
          placeholderTextColor={colors.textMuted}
          value={form.location}
          onChangeText={(location) => setFields({ location })}
        />
        {errors.location ? <Text style={styles.error}>{errors.location}</Text> : null}

        <Text style={styles.label}>Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
          value={dateText}
          onChangeText={setDateText}
        />
        {errors.date ? <Text style={styles.error}>{errors.date}</Text> : null}

        <Text style={styles.label}>Parking Available *</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggle, form.parkingAvailable === true && styles.toggleActive]}
            onPress={() => setFields({ parkingAvailable: true })}
          >
            <Text style={form.parkingAvailable === true ? styles.toggleTextActive : styles.toggleText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, form.parkingAvailable === false && styles.toggleActive]}
            onPress={() => setFields({ parkingAvailable: false })}
          >
            <Text style={form.parkingAvailable === false ? styles.toggleTextActive : styles.toggleText}>No</Text>
          </TouchableOpacity>
        </View>
        {errors.parking ? <Text style={styles.error}>{errors.parking}</Text> : null}

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="A classic hike to the highest peak..."
          placeholderTextColor={colors.textMuted}
          value={form.description}
          onChangeText={(description) => setFields({ description })}
          multiline
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
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
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
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
