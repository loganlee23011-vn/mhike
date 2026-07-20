import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
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
import { useFirebase } from "../context/FirebaseContext";
import {
  addObservation,
  deleteObservation,
  subscribeToObservations,
  updateObservation,
} from "../services/observationService";

export default function ObservationScreen({ route, navigation }) {
  const hikeId = route.params?.hikeId;
  const { uid } = useFirebase();
  const [observations, setObservations] = useState([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hikeId) return undefined;
    const unsubscribe = subscribeToObservations(hikeId, setObservations, (err) => console.error(err));
    return unsubscribe;
  }, [hikeId]);

  const closeEditor = () => {
    setAdding(false);
    setEditingId(null);
    setText("");
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateObservation(editingId, { observationText: text.trim() });
      } else {
        await addObservation(uid, hikeId, { observationText: text.trim() });
      }
      closeEditor();
    } catch (err) {
      Alert.alert("Couldn't save observation", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setText(item.observationText);
    setAdding(true);
  };

  const handleDelete = (item) => {
    Alert.alert("Delete observation?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteObservation(item.id).catch((err) => Alert.alert("Delete failed", err.message)),
      },
    ]);
  };

  const handleMenu = (item) => {
    Alert.alert(undefined, undefined, [
      { text: "Edit", onPress: () => handleEdit(item) },
      { text: "Delete", style: "destructive", onPress: () => handleDelete(item) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Observations" onBack={() => navigation.goBack()} />

      {!hikeId ? (
        <Text style={[typography.caption, styles.empty]}>Open a hike to see its observations.</Text>
      ) : (
        <FlatList
          data={observations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[typography.caption, styles.empty]}>No observations yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={typography.caption}>{item.observedAt?.toDateString()}</Text>
                <TouchableOpacity onPress={() => handleMenu(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name="more-vert" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={typography.body}>{item.observationText}</Text>
              {item.comments ? <Text style={typography.caption}>{item.comments}</Text> : null}
            </View>
          )}
        />
      )}

      {adding ? (
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="What did you observe?"
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            autoFocus
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <MaterialIcons name="check" size={20} color={colors.surface} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={closeEditor}>
            <MaterialIcons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      ) : (
        hikeId ? (
          <TouchableOpacity style={styles.fab} onPress={() => setAdding(true)}>
            <MaterialIcons name="add" size={28} color={colors.surface} />
          </TouchableOpacity>
        ) : null
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, gap: spacing.sm },
  empty: { textAlign: "center", marginTop: spacing.xl },
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
  addRow: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
