import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
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
import { getHikeById } from "../services/hikeService";
import {
  addObservation,
  deleteObservation,
  subscribeToObservations,
  updateObservation,
} from "../services/observationService";

function toDateTimeInputText(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(date) {
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function ObservationScreen({ route, navigation }) {
  const hikeId = route.params?.hikeId;
  const { uid } = useFirebase();
  const [observations, setObservations] = useState([]);
  const [hike, setHike] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [text, setText] = useState("");
  const [observedAt, setObservedAt] = useState(new Date());
  const [pickerMode, setPickerMode] = useState(null);
  const [comments, setComments] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hikeId) return undefined;
    const unsubscribe = subscribeToObservations(hikeId, setObservations, (err) => console.error(err));
    return unsubscribe;
  }, [hikeId]);

  useEffect(() => {
    if (!hikeId) return;
    let active = true;
    getHikeById(hikeId)
      .then((result) => {
        if (active) setHike(result);
      })
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, [hikeId]);

  const isHikeOwner = Boolean(hike && hike.userId === uid);

  const closeEditor = () => {
    setAdding(false);
    setEditingId(null);
    setText("");
    setObservedAt(new Date());
    setPickerMode(null);
    setComments("");
    setErrors({});
  };

  const openAdd = () => {
    setObservedAt(new Date());
    setAdding(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") setPickerMode(null);
    if (event.type === "set" && selectedDate) {
      setObservedAt((prev) => {
        const next = new Date(prev);
        next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        return next;
      });
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") setPickerMode(null);
    if (event.type === "set" && selectedTime) {
      setObservedAt((prev) => {
        const next = new Date(prev);
        next.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
        return next;
      });
    }
  };

  const handleSave = async () => {
    const nextErrors = {};
    if (!text.trim()) nextErrors.text = "Observation text is required.";
    if (!observedAt) nextErrors.time = "Select a time.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateObservation(editingId, {
          observationText: text.trim(),
          observedAt,
          comments: comments.trim(),
        });
      } else {
        await addObservation(uid, hikeId, {
          observationText: text.trim(),
          observedAt,
          comments: comments.trim(),
        });
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
    setObservedAt(item.observedAt ?? new Date());
    setComments(item.comments ?? "");
    setErrors({});
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
    // Anyone (author or hike owner) can delete, but only the author may
    // rewrite someone else's observation text.
    const options = [];
    if (item.userId === uid) options.push({ text: "Edit", onPress: () => handleEdit(item) });
    options.push({ text: "Delete", style: "destructive", onPress: () => handleDelete(item) });
    options.push({ text: "Cancel", style: "cancel" });
    Alert.alert(undefined, undefined, options);
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
                <Text style={typography.caption}>
                  {item.observedAt ? toDateTimeInputText(item.observedAt) : ""}
                </Text>
                {item.userId === uid || isHikeOwner ? (
                  <TouchableOpacity onPress={() => handleMenu(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialIcons name="more-vert" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>
              <Text style={typography.body}>{item.observationText}</Text>
              {item.comments ? <Text style={typography.caption}>{item.comments}</Text> : null}
            </View>
          )}
        />
      )}

      {adding ? (
        <View style={styles.editor}>
          <Text style={styles.label}>Observation *</Text>
          <TextInput
            style={styles.input}
            placeholder="What did you observe?"
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            autoFocus
          />
          {errors.text ? <Text style={styles.error}>{errors.text}</Text> : null}

          <Text style={styles.label}>Date & Time *</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.input, styles.dateTimeBtn]}
              onPress={() => setPickerMode("date")}
            >
              <Text style={styles.dateText}>{formatDate(observedAt)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.input, styles.dateTimeBtn]}
              onPress={() => setPickerMode("time")}
            >
              <Text style={styles.dateText}>{formatTime(observedAt)}</Text>
            </TouchableOpacity>
          </View>
          {errors.time ? <Text style={styles.error}>{errors.time}</Text> : null}
          {pickerMode ? (
            <View style={Platform.OS === "ios" ? styles.iosPickerWrap : undefined}>
              <DateTimePicker
                value={observedAt}
                mode={pickerMode}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={pickerMode === "date" ? handleDateChange : handleTimeChange}
              />
              {Platform.OS === "ios" ? (
                <TouchableOpacity style={styles.doneBtn} onPress={() => setPickerMode(null)}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.label}>Comments (optional)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Anything else worth noting..."
            placeholderTextColor={colors.textMuted}
            value={comments}
            onChangeText={setComments}
            multiline
          />

          <View style={styles.editorActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeEditor}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        hikeId ? (
          <TouchableOpacity style={styles.fab} onPress={openAdd}>
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
  editor: {
    padding: spacing.md,
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  label: { fontSize: 13, fontWeight: "600", color: colors.text, marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  multiline: { minHeight: 60, textAlignVertical: "top" },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  dateTimeRow: { flexDirection: "row", gap: spacing.sm },
  dateTimeBtn: { flex: 1 },
  dateText: { color: colors.text },
  iosPickerWrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  doneBtn: { alignItems: "center", paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  doneText: { color: colors.primary, fontWeight: "700" },
  editorActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  saveBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: colors.surface, fontWeight: "700" },
  cancelBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: colors.text, fontWeight: "600" },
});
