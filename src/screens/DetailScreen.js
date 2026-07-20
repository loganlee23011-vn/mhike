import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing, typography } from "../constants/theme";
import { getTerrainImage } from "../constants/terrainImages";
import { useHikeForm } from "../context/HikeFormContext";
import { deleteHike, getHikeById } from "../services/hikeService";

export default function DetailScreen({ route, navigation }) {
  const hikeId = route.params?.hikeId;
  const [hike, setHike] = useState(null);
  const [loading, setLoading] = useState(true);
  const { startEdit } = useHikeForm();

  useEffect(() => {
    let active = true;
    setLoading(true);
    getHikeById(hikeId)
      .then((result) => {
        if (active) setHike(result);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [hikeId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!hike) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={["top"]}>
        <Text style={typography.body}>Hike not found.</Text>
      </SafeAreaView>
    );
  }

  const handleEdit = () => {
    startEdit(hike);
    navigation.navigate("EntryBasic");
  };

  const handleDelete = () => {
    Alert.alert("Delete hike?", `This removes "${hike.name}" and its observations.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHike(hikeId);
            navigation.navigate("MainTabs", { screen: "Hikes" });
          } catch (err) {
            Alert.alert("Delete failed", err.message);
          }
        },
      },
    ]);
  };

  const rows = [
    { icon: "location-on", label: "Location", value: hike.location },
    { icon: "calendar-today", label: "Date", value: hike.hikeDate?.toDateString() ?? "—" },
    { icon: "straighten", label: "Length", value: `${hike.length} km` },
    { icon: "bar-chart", label: "Difficulty", value: hike.difficulty },
    { icon: "schedule", label: "Estimated Duration", value: hike.estimatedDuration || "—" },
    { icon: "terrain", label: "Terrain Type", value: hike.terrainType || "—" },
    { icon: "local-parking", label: "Parking Available", value: hike.parkingAvailable ? "Yes" : "No" },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ImageBackground source={getTerrainImage(hike.terrainType)} style={styles.hero}>
        <View style={styles.heroScrim}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.heroIcon}>
            <MaterialIcons name="arrow-back" size={22} color={colors.surface} />
          </TouchableOpacity>
          <View style={styles.heroActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.heroActionBtn}>
              <MaterialIcons name="edit" size={20} color={colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.heroActionBtn}>
              <MaterialIcons name="delete-outline" size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroTitle}>{hike.name}</Text>
          <Text style={styles.heroSubtitle}>
            {hike.hikeDate?.toDateString()} · {hike.difficulty}
          </Text>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("MainTabs", { screen: "Map" })}
          >
            <MaterialIcons name="map" size={20} color={colors.primary} />
            <Text style={styles.actionLabel}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("Observations", { hikeId })}
          >
            <MaterialIcons name="visibility" size={20} color={colors.primary} />
            <Text style={styles.actionLabel}>Observations</Text>
          </TouchableOpacity>
        </View>

        <Text style={typography.h2}>Overview</Text>
        <View style={styles.card}>
          {rows.map((r) => (
            <View key={r.label} style={styles.row}>
              <View style={styles.rowLabel}>
                <MaterialIcons name={r.icon} size={16} color={colors.textMuted} />
                <Text style={typography.caption}>{r.label}</Text>
              </View>
              <Text style={styles.value}>{r.value}</Text>
            </View>
          ))}
        </View>

        {hike.description ? (
          <>
            <Text style={[typography.h2, styles.sectionTitle]}>Description</Text>
            <View style={styles.card}>
              <Text style={typography.body}>{hike.description}</Text>
            </View>
          </>
        ) : null}

        {hike.weather ? (
          <View style={styles.safetyCard}>
            <MaterialIcons name="verified-user" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.safetyTitle}>Weather & Safety</Text>
              <Text style={typography.caption}>
                {Math.round(hike.weather.temperature)}°C, {hike.weather.description}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: "center", justifyContent: "center" },
  hero: {
    height: 200,
    backgroundColor: colors.primary,
  },
  heroScrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: spacing.md,
    justifyContent: "flex-end",
  },
  heroIcon: { position: "absolute", top: spacing.md, left: spacing.md },
  heroActions: { position: "absolute", top: spacing.md, right: spacing.md, flexDirection: "row", gap: spacing.md },
  heroActionBtn: {},
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
