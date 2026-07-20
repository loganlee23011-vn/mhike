import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing, typography } from "../constants/theme";

const ROWS = [
  { icon: "location-outline", label: "Location", value: "Snowdonia National Park, Wales" },
  { icon: "calendar-outline", label: "Date", value: "25 May 2024" },
  { icon: "git-network-outline", label: "Length", value: "9.2 km" },
  { icon: "stats-chart-outline", label: "Difficulty", value: "Moderate" },
  { icon: "time-outline", label: "Estimated Duration", value: "05:00" },
  { icon: "triangle-outline", label: "Terrain Type", value: "Mountain" },
  { icon: "car-outline", label: "Parking Available", value: "Yes" },
];

export default function DetailScreen({ route, navigation }) {
  const hikeId = route.params?.hikeId;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.heroIcon}>
          <Ionicons name="arrow-back" size={22} color={colors.surface} />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Snowdon Summit</Text>
        <Text style={styles.heroSubtitle}>25 May 2024 · Moderate</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("MainTabs", { screen: "Map" })}
          >
            <Ionicons name="map-outline" size={20} color={colors.primary} />
            <Text style={styles.actionLabel}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="partly-sunny-outline" size={20} color={colors.primary} />
            <Text style={styles.actionLabel}>Weather</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("Observations", { hikeId })}
          >
            <Ionicons name="eye-outline" size={20} color={colors.primary} />
            <Text style={styles.actionLabel}>Observations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="share-social-outline" size={20} color={colors.primary} />
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
        </View>

        <Text style={typography.h2}>Overview</Text>
        <View style={styles.card}>
          {ROWS.map((r) => (
            <View key={r.label} style={styles.row}>
              <View style={styles.rowLabel}>
                <Ionicons name={r.icon} size={16} color={colors.textMuted} />
                <Text style={typography.caption}>{r.label}</Text>
              </View>
              <Text style={styles.value}>{r.value}</Text>
            </View>
          ))}
        </View>

        <Text style={[typography.h2, styles.sectionTitle]}>Description</Text>
        <View style={styles.card}>
          <Text style={typography.body}>Classic route to the highest peak in Wales.</Text>
        </View>

        <View style={styles.safetyCard}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.safetyTitle}>Weather & Safety</Text>
            <Text style={typography.caption}>Light wind and low chance of rain. 18°C, Partly cloudy.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: {
    height: 200,
    backgroundColor: colors.primary,
    padding: spacing.md,
    justifyContent: "flex-end",
  },
  heroIcon: { position: "absolute", top: spacing.md, left: spacing.md },
  heroTitle: { color: colors.surface, fontSize: 24, fontWeight: "700" },
  heroSubtitle: { color: colors.surface, opacity: 0.9 },
  content: { padding: spacing.md, gap: spacing.sm },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    alignItems: "center",
    gap: 4,
  },
  actionLabel: { fontSize: 11, color: colors.text, fontWeight: "600" },
  sectionTitle: { marginTop: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  value: { color: colors.text, fontWeight: "600" },
  safetyCard: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  safetyTitle: { fontWeight: "700", color: colors.primary, marginBottom: 2 },
});
