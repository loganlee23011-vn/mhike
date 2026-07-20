import { Ionicons } from "@expo/vector-icons";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, spacing, typography } from "../constants/theme";

const OBSERVATIONS = [
  { id: "1", text: "Beautiful clear views at the top.", date: "21 May 2024" },
  { id: "2", text: "Trail was muddy near the summit approach.", date: "20 May 2024" },
];

export default function ObservationScreen({ route, navigation }) {
  const hikeId = route.params?.hikeId;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Observations" onBack={() => navigation.goBack()} />

      <FlatList
        data={OBSERVATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={typography.caption}>{item.date}</Text>
              <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
            </View>
            <Text style={typography.body}>{item.text}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color={colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
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
