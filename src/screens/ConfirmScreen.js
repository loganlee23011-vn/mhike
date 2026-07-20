import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, spacing, typography } from "../constants/theme";

function ReviewSection({ icon, title, editStep, navigation, rows }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={18} color={colors.primary} />
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
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Review Hike" subtitle="Please review your hike details" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <ReviewSection
          icon="person-outline"
          title="Basic Information"
          editStep="EntryBasic"
          navigation={navigation}
          rows={[
            { label: "Name", value: "Snowdon Summit" },
            { label: "Location", value: "Snowdonia National Park, Wales" },
            { label: "Date", value: "25 May 2024" },
            { label: "Parking", value: "Yes" },
          ]}
        />

        <ReviewSection
          icon="trail-sign-outline"
          title="Trail Details"
          editStep="EntryRoute"
          navigation={navigation}
          rows={[
            { label: "Length", value: "9.2 km" },
            { label: "Difficulty", value: "Moderate" },
            { label: "Estimated Duration", value: "05:00" },
            { label: "Terrain Type", value: "Mountain" },
          ]}
        />

        <ReviewSection
          icon="location-outline"
          title="Location & Safety"
          editStep="EntryLocation"
          navigation={navigation}
          rows={[
            { label: "Coordinates", value: "53.0663° N, 4.0754° W" },
            { label: "Weather", value: "18°C, Partly cloudy" },
            { label: "Safety Status", value: "Good conditions" },
          ]}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => navigation.replace("Detail", { hikeId: "snowdon-summit" })}
        >
          <Ionicons name="save-outline" size={18} color={colors.surface} />
          <Text style={styles.saveText}>Save Hike</Text>
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
