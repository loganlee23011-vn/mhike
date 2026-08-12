import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
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

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function EntryBasicScreen({ navigation }) {
  const { form, setFields, resetForm, editingHikeId } = useHikeForm();
  const [showPicker, setShowPicker] = useState(false);
  const [errors, setErrors] = useState({});

  const handleContinue = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Hike name is required.";
    if (!form.location.trim()) nextErrors.location = "Location is required.";
    if (!form.hikeDate) nextErrors.date = "Select a date.";
    if (form.parkingAvailable === null) nextErrors.parking = "Select an option.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    navigation.navigate("EntryRoute");
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "set" && selectedDate) {
      setFields({ hikeDate: selectedDate });
    }
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
        <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
          <Text style={form.hikeDate ? styles.dateText : styles.datePlaceholder}>
            {form.hikeDate ? formatDate(form.hikeDate) : "Select a date"}
          </Text>
        </TouchableOpacity>
        {errors.date ? <Text style={styles.error}>{errors.date}</Text> : null}
        {showPicker ? (
          <View style={Platform.OS === "ios" ? styles.iosPickerWrap : undefined}>
            <DateTimePicker
              value={form.hikeDate ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
            {Platform.OS === "ios" ? (
              <TouchableOpacity style={styles.doneBtn} onPress={() => setShowPicker(false)}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

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
  dateText: { color: colors.text },
  datePlaceholder: { color: colors.textMuted },
  iosPickerWrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  doneBtn: { alignItems: "center", paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  doneText: { color: colors.primary, fontWeight: "700" },
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
