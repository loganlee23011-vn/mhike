import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing, typography } from "../constants/theme";

const quickActions = [
  { key: "map", label: "Map", icon: "location-outline", tab: "Map" },
  { key: "observations", label: "Observations", icon: "eye-outline", screen: "Observations" },
  { key: "myHikes", label: "My Hikes", icon: "bag-handle-outline", tab: "Hikes" },
  { key: "planRoute", label: "Plan Route", icon: "navigate-outline", screen: "EntryBasic" },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={typography.h1}>Good morning, Alex!</Text>
            <Text style={typography.caption}>Ready for your next adventure?</Text>
          </View>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </View>

        <View style={styles.sectionRow}>
          <Text style={typography.h2}>Upcoming Hike</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Hikes")}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Detail", { hikeId: "snowdon-summit" })}
        >
          <Text style={styles.cardTitle}>Snowdon Summit</Text>
          <Text style={typography.caption}>Sat, 25 May 2024 · 9.2 km · Moderate</Text>
        </TouchableOpacity>

        <Text style={[typography.h2, styles.sectionTitle]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionCard}
              onPress={() =>
                action.tab
                  ? navigation.navigate(action.tab)
                  : navigation.navigate(action.screen)
              }
            >
              <Ionicons name={action.icon} size={22} color={colors.primary} />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={typography.h2}>Recent Observations</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Observations")}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Observations")}
        >
          <Text style={styles.cardTitle}>Snowdon Summit</Text>
          <Text style={typography.caption}>Beautiful clear views at the top.</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("EntryBasic")}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  link: { color: colors.primary, fontWeight: "600" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: spacing.xs },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionCard: {
    flexBasis: "47%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  actionLabel: { fontSize: 13, color: colors.text, fontWeight: "600" },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
