import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing, typography } from "../constants/theme";
import { getTerrainImage } from "../constants/terrainImages";
import { useHikeForm } from "../context/HikeFormContext";
import { subscribeToRecentObservations } from "../services/observationService";
import { subscribeToHikes } from "../services/hikeService";

const quickActions = [
  { key: "map", label: "Map", icon: "location-on", tab: "Map" },
  { key: "observations", label: "Observations", icon: "visibility", screen: "Observations" },
  { key: "myHikes", label: "My Hikes", icon: "backpack", tab: "Hikes" },
  { key: "planRoute", label: "Plan Route", icon: "navigation", screen: "EntryBasic" },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 18) return "Good afternoon!";
  return "Good evening!";
}

function daysUntilLabel(date) {
  const diffMs = date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  const days = Math.round(diffMs / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export default function HomeScreen({ navigation }) {
  const [hikes, setHikes] = useState([]);
  const [observations, setObservations] = useState([]);
  const { resetForm } = useHikeForm();

  useEffect(() => {
    const unsubscribeHikes = subscribeToHikes(setHikes, (err) => console.error(err));
    const unsubscribeObs = subscribeToRecentObservations(3, setObservations, (err) => console.error(err));
    return () => {
      unsubscribeHikes();
      unsubscribeObs();
    };
  }, []);

  const now = new Date();
  const upcoming = useMemo(() => hikes.filter((h) => h.hikeDate && h.hikeDate >= now), [hikes]);
  const completedCount = hikes.length - upcoming.length;
  const totalDistance = useMemo(
    () => hikes.reduce((sum, h) => sum + (Number(h.length) || 0), 0),
    [hikes]
  );
  const hikesById = useMemo(() => Object.fromEntries(hikes.map((h) => [h.id, h])), [hikes]);

  const upcomingHike = upcoming[0];
  const nextUpcoming = upcoming.slice(1, 6);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={typography.h1}>{greeting()}</Text>
            <Text style={typography.caption}>Ready for your next adventure?</Text>
          </View>
          <MaterialIcons name="notifications-none" size={24} color={colors.text} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>{hikes.length}</Text>
            <Text style={styles.statLabel}>Hikes</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>{totalDistance.toFixed(1)}</Text>
            <Text style={styles.statLabel}>km logged</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={typography.h2}>Upcoming Hike</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Hikes")}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>

        {upcomingHike ? (
          <TouchableOpacity
            style={styles.photoCard}
            onPress={() => navigation.navigate("Detail", { hikeId: upcomingHike.id })}
          >
            <ImageBackground
              source={getTerrainImage(upcomingHike.terrainType)}
              style={styles.photoCardBg}
              imageStyle={styles.photoCardImage}
            >
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{daysUntilLabel(new Date(upcomingHike.hikeDate))}</Text>
              </View>
              <View style={styles.photoCardOverlay}>
                <Text style={styles.photoCardTitle}>{upcomingHike.name}</Text>
                <Text style={styles.photoCardCaption}>
                  {upcomingHike.hikeDate.toDateString()} · {upcomingHike.length} km · {upcomingHike.difficulty}
                </Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ) : (
          <View style={styles.card}>
            <Text style={typography.caption}>No upcoming hikes yet. Add one to get started.</Text>
          </View>
        )}

        {nextUpcoming.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.strip}
            contentContainerStyle={styles.stripContent}
          >
            {nextUpcoming.map((hike) => (
              <TouchableOpacity
                key={hike.id}
                style={styles.stripCard}
                onPress={() => navigation.navigate("Detail", { hikeId: hike.id })}
              >
                <ImageBackground
                  source={getTerrainImage(hike.terrainType)}
                  style={styles.stripCardBg}
                  imageStyle={styles.stripCardImage}
                >
                  <View style={styles.stripCardOverlay}>
                    <Text style={styles.stripCardTitle} numberOfLines={1}>{hike.name}</Text>
                    <Text style={styles.stripCardCaption}>{hike.length} km</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <Text style={[typography.h2, styles.sectionTitle]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionCard}
              onPress={() => {
                if (action.screen === "EntryBasic") resetForm();
                action.tab
                  ? navigation.navigate(action.tab)
                  : navigation.navigate(action.screen);
              }}
            >
              <MaterialIcons name={action.icon} size={22} color={colors.primary} />
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

        {observations.length > 0 ? (
          <View style={styles.obsList}>
            {observations.map((obs) => (
              <TouchableOpacity
                key={obs.id}
                style={styles.card}
                onPress={() => navigation.navigate("Observations", { hikeId: obs.hikeId })}
              >
                <View style={styles.obsHeader}>
                  <MaterialIcons name="visibility" size={16} color={colors.primary} />
                  <Text style={styles.obsHike} numberOfLines={1}>
                    {hikesById[obs.hikeId]?.name ?? "Hike"}
                  </Text>
                  <Text style={typography.caption}>{obs.observedAt?.toDateString()}</Text>
                </View>
                <Text style={styles.cardTitle}>{obs.observationText}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={typography.caption}>No observations logged yet.</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          resetForm();
          navigation.navigate("EntryBasic");
        }}
      >
        <MaterialIcons name="add" size={28} color={colors.surface} />
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
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "700", color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
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
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  photoCard: { borderRadius: radius.lg, overflow: "hidden" },
  photoCardBg: { minHeight: 140, justifyContent: "flex-end" },
  photoCardImage: { borderRadius: radius.lg },
  dateBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  dateBadgeText: { color: colors.surface, fontSize: 11, fontWeight: "700" },
  photoCardOverlay: {
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: spacing.md,
  },
  photoCardTitle: { fontSize: 17, fontWeight: "700", color: colors.surface, marginBottom: spacing.xs },
  photoCardCaption: { color: colors.surface, opacity: 0.9, fontSize: 13 },
  strip: { marginTop: spacing.sm },
  stripContent: { gap: spacing.sm, paddingRight: spacing.md },
  stripCard: { width: 120, height: 90, borderRadius: radius.md, overflow: "hidden" },
  stripCardBg: { flex: 1, justifyContent: "flex-end" },
  stripCardImage: { borderRadius: radius.md },
  stripCardOverlay: { backgroundColor: "rgba(0,0,0,0.35)", padding: spacing.xs },
  stripCardTitle: { color: colors.surface, fontSize: 12, fontWeight: "700" },
  stripCardCaption: { color: colors.surface, opacity: 0.9, fontSize: 11 },
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
  obsList: { gap: spacing.sm },
  obsHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs },
  obsHike: { flex: 1, fontSize: 12, fontWeight: "700", color: colors.primary },
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
