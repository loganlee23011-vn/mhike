import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, spacing, typography } from "../constants/theme";
import { useFirebase } from "../context/FirebaseContext";
import { useHikeForm } from "../context/HikeFormContext";
import { addHike, updateHike } from "../services/hikeService";

function ReviewSection({ icon, title, editStep, navigation, rows }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <MaterialIcons name={icon} size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate(editStep)}>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>
      {rows.map((r) => (
        <View key={r.label} style={styles.row}>
          <Text style={typography.caption}>{r.label}</Text>
          <Text style={styles.value}>{r.value}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ConfirmScreen({ navigation }) {
  const { form, resetForm, editingHikeId } = useHikeForm();
  const { uid } = useFirebase();
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(editingHikeId);

  const handleSave = async () => {
    if (!uid) {
      Alert.alert("Not signed in yet", "Please wait a moment and try again.");
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await updateHike(editingHikeId, {
          name: form.name,
          location: form.location,
          hikeDate: form.hikeDate,
          parkingAvailable: form.parkingAvailable,
          length: Number(form.length),
          difficulty: form.difficulty,
          description: form.description ?? "",
          estimatedDuration: form.estimatedDuration ?? "",
          terrainType: form.terrainType ?? "",
          latitude: form.latitude ?? null,
          longitude: form.longitude ?? null,
          weather: form.weather ?? null,
        });
        resetForm();
        navigation.replace("Detail", { hikeId: editingHikeId });
      } else {
        const id = await addHike(uid, form);
        resetForm();
        navigation.replace("Detail", { hikeId: id });
      }
    } catch (error) {
      Alert.alert("Couldn't save hike", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title={isEditing ? "Review Changes" : "Review Hike"}
        subtitle="Please review your hike details"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <ReviewSection
          icon="person-outline"
          title="Basic Information"
          editStep="EntryBasic"
          navigation={navigation}
          rows={[
            { label: "Name", value: form.name },
            { label: "Location", value: form.location },
            { label: "Date", value: form.hikeDate ? form.hikeDate.toDateString() : "—" },
            { label: "Parking", value: form.parkingAvailable ? "Yes" : "No" },
          ]}
        />

        <ReviewSection
          icon="directions"
          title="Trail Details"
          editStep="EntryRoute"
          navigation={navigation}
          rows={[
            { label: "Length", value: `${form.length} km` },
            { label: "Difficulty", value: form.difficulty },
            { label: "Estimated Duration", value: form.estimatedDuration || "—" },
            { label: "Terrain Type", value: form.terrainType },
          ]}
        />

        <ReviewSection
          icon="location-on"
          title="Location & Safety"
          editStep="EntryLocation"
          navigation={navigation}
          rows={[
            {
              label: "Coordinates",
              value: form.latitude ? `${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}` : "Not set",
            },
            {
              label: "Weather",
              value: form.weather ? `${Math.round(form.weather.temperature)}°C, ${form.weather.description}` : "Not checked",
            },
          ]}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <MaterialIcons name="save" size={18} color={colors.surface} />
          )}
          <Text style={styles.saveText}>{isEditing ? "Save Changes" : "Save Hike"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  sectionTitle: { fontWeight: "700", color: colors.text },
  editLink: { color: colors.primary, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.xs },
  value: { color: colors.text, fontWeight: "600" },
  footer: { padding: spacing.md },
  saveBtn: {
    flexDirection: "row",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: colors.surface, fontWeight: "700", fontSize: 15 },
});
