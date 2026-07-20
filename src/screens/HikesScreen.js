import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing, typography } from "../constants/theme";

const HIKES = [
  { id: "snowdon-summit", name: "Snowdon Summit", location: "Snowdonia, Wales", date: "Sat, 25 May 2024", length: "9.2 km", difficulty: "Moderate" },
  { id: "catbells-loop", name: "Catbells Loop", location: "Lake District, England", date: "Sun, 9 Jun 2024", length: "6.0 km", difficulty: "Easy" },
  { id: "kinder-scout", name: "Kinder Scout", location: "Peak District, England", date: "Sat, 22 Jun 2024", length: "11.3 km", difficulty: "Hard" },
];

export default function HikesScreen({ navigation }) {
  const [tab, setTab] = useState("upcoming");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerRow}>
        <Text style={typography.h1}>Hikes</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Ionicons name="search-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Ionicons name="options-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segment, tab === "upcoming" && styles.segmentActive]}
          onPress={() => setTab("upcoming")}
        >
          <Text style={tab === "upcoming" ? styles.segmentTextActive : styles.segmentText}>
            Upcoming (3)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, tab === "completed" && styles.segmentActive]}
          onPress={() => setTab("completed")}
        >
          <Text style={tab === "completed" ? styles.segmentTextActive : styles.segmentText}>
            Completed (5)
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={HIKES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Detail", { hikeId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
            </View>
            <Text style={typography.caption}>{item.location}</Text>
            <Text style={typography.caption}>{item.date}</Text>
            <Text style={typography.caption}>
              {item.length} · {item.difficulty}
            </Text>
          </TouchableOpacity>
        )}
      />

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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
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
