import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, spacing, typography } from "../constants/theme";
import { subscribeToHikes } from "../services/hikeService";

const DIFFICULTIES = ["All", "Easy", "Moderate", "Hard", "Expert"];

const EMPTY_FILTERS = {
  query: "",
  difficulty: "All",
  location: "",
  minLength: "",
  maxLength: "",
  dateFrom: "",
  dateTo: "",
};

function parseDate(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const date = new Date(`${trimmed}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function matches(hike, filters) {
  if (filters.query.trim() && !hike.name?.toLowerCase().startsWith(filters.query.trim().toLowerCase())) {
    return false;
  }
  if (filters.difficulty !== "All" && hike.difficulty !== filters.difficulty) {
    return false;
  }
  if (filters.location.trim() && !hike.location?.toLowerCase().includes(filters.location.trim().toLowerCase())) {
    return false;
  }
  const min = parseFloat(filters.minLength);
  if (!Number.isNaN(min) && hike.length < min) return false;
  const max = parseFloat(filters.maxLength);
  if (!Number.isNaN(max) && hike.length > max) return false;
  const from = parseDate(filters.dateFrom);
  if (from && hike.hikeDate && hike.hikeDate < from) return false;
  const to = parseDate(filters.dateTo);
  if (to && hike.hikeDate && hike.hikeDate > to) return false;
  return true;
}

export default function SearchScreen({ navigation }) {
  const [hikes, setHikes] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToHikes(setHikes, (err) => console.error(err));
    return unsubscribe;
  }, []);

  const setField = (fields) => setFilters((prev) => ({ ...prev, ...fields }));

  const runSearch = () => {
    setResults(hikes.filter((h) => matches(h, filters)));
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setResults(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Search & Filters" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hikes..."
            placeholderTextColor={colors.textMuted}
            value={filters.query}
            onChangeText={(query) => setField({ query })}
            onSubmitEditing={runSearch}
            returnKeyType="search"
          />
        </View>

        <View style={styles.sectionRow}>
          <Text style={typography.h2}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.link}>Reset</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.chipRow}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, filters.difficulty === d && styles.chipActive]}
              onPress={() => setField({ difficulty: d })}
            >
              <Text style={filters.difficulty === d ? styles.chipTextActive : styles.chipText}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.field}
          placeholder="e.g. Wales"
          placeholderTextColor={colors.textMuted}
          value={filters.location}
          onChangeText={(location) => setField({ location })}
        />

        <Text style={styles.label}>Length (km)</Text>
        <View style={styles.rowGap}>
          <TextInput
            style={styles.fieldHalf}
            placeholder="Min"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={filters.minLength}
            onChangeText={(minLength) => setField({ minLength })}
          />
          <TextInput
            style={styles.fieldHalf}
            placeholder="Max"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={filters.maxLength}
            onChangeText={(maxLength) => setField({ maxLength })}
          />
        </View>

        <Text style={styles.label}>Date</Text>
        <View style={styles.rowGap}>
          <TextInput
            style={styles.fieldHalf}
            placeholder="From (YYYY-MM-DD)"
            placeholderTextColor={colors.textMuted}
            value={filters.dateFrom}
            onChangeText={(dateFrom) => setField({ dateFrom })}
          />
          <TextInput
            style={styles.fieldHalf}
            placeholder="To (YYYY-MM-DD)"
            placeholderTextColor={colors.textMuted}
            value={filters.dateTo}
            onChangeText={(dateTo) => setField({ dateTo })}
          />
        </View>

        <TouchableOpacity style={styles.applyBtn} onPress={runSearch}>
          <Text style={styles.applyText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          results !== null ? (
            <Text style={[typography.caption, styles.empty]}>No hikes match your filters.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Detail", { hikeId: item.id })}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={typography.caption}>{item.location}</Text>
            <Text style={typography.caption}>
              {item.length} km · {item.difficulty} · {item.hikeDate?.toDateString()}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: spacing.sm, color: colors.text },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  link: { color: colors.primary, fontWeight: "600" },
  label: { fontSize: 13, fontWeight: "600", color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextActive: { color: colors.surface, fontWeight: "600" },
  rowGap: { flexDirection: "row", gap: spacing.sm },
  fieldHalf: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  field: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  applyText: { color: colors.surface, fontWeight: "700", fontSize: 15 },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  empty: { textAlign: "center", marginTop: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: spacing.xs },
});
