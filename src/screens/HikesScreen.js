import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing, typography } from "../constants/theme";
import { getTerrainImage } from "../constants/terrainImages";
import { useFirebase } from "../context/FirebaseContext";
import { useHikeForm } from "../context/HikeFormContext";
import { deleteHike, subscribeToHikes } from "../services/hikeService";

export default function HikesScreen({ navigation }) {
  const { uid } = useFirebase();
  const [tab, setTab] = useState("upcoming");
  const [hikes, setHikes] = useState([]);
  const { resetForm, startEdit } = useHikeForm();

  useEffect(() => {
    const unsubscribe = subscribeToHikes(setHikes, (err) => console.error(err));
    return unsubscribe;
  }, []);

  // Completed is a manual flag set from DetailScreen, not derived from the
  // date — a hike whose date has passed but was never marked done stays
  // under Upcoming instead of silently disappearing into Completed.
  const upcoming = hikes.filter((h) => !h.completed);
  const completed = hikes.filter((h) => h.completed);
  const list = tab === "upcoming" ? upcoming : completed;

  const handleEdit = (hike) => {
    startEdit(hike);
    navigation.navigate("EntryBasic");
  };

  const handleDelete = (hike) => {
    Alert.alert("Delete hike?", `This removes "${hike.name}" and its observations.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteHike(hike.id).catch((err) => Alert.alert("Delete failed", err.message)),
      },
    ]);
  };

  const handleMenu = (hike) => {
    Alert.alert(undefined, undefined, [
      { text: "Edit", onPress: () => handleEdit(hike) },
      { text: "Delete", style: "destructive", onPress: () => handleDelete(hike) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerRow}>
        <Text style={typography.h1}>Hikes</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <MaterialIcons name="search" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segment, tab === "upcoming" && styles.segmentActive]}
          onPress={() => setTab("upcoming")}
        >
          <Text style={tab === "upcoming" ? styles.segmentTextActive : styles.segmentText}>
            Upcoming ({upcoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, tab === "completed" && styles.segmentActive]}
          onPress={() => setTab("completed")}
        >
          <Text style={tab === "completed" ? styles.segmentTextActive : styles.segmentText}>
            Completed ({completed.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[typography.caption, styles.empty]}>No hikes here yet.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Detail", { hikeId: item.id })}
          >
            <Image source={getTerrainImage(item.terrainType)} style={styles.thumb} />
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.userId === uid ? (
                  <TouchableOpacity onPress={() => handleMenu(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialIcons name="more-vert" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.sharedTag}>
                    <MaterialIcons name="groups" size={12} color={colors.textMuted} />
                    <Text style={styles.sharedTagText}>Shared</Text>
                  </View>
                )}
              </View>
              <Text style={typography.caption}>{item.location}</Text>
              <Text style={typography.caption}>{item.hikeDate?.toDateString()}</Text>
              <Text style={typography.caption}>
                {item.length} km · {item.difficulty}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  headerIcons: { flexDirection: "row", gap: spacing.md },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  segment: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmentText: { color: colors.text, fontWeight: "600" },
  segmentTextActive: { color: colors.surface, fontWeight: "600" },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.sm },
  empty: { textAlign: "center", marginTop: spacing.xl },
  card: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 64, height: 64, borderRadius: radius.md },
  cardBody: { flex: 1, justifyContent: "center" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  sharedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sharedTagText: { fontSize: 10, fontWeight: "600", color: colors.textMuted },
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
