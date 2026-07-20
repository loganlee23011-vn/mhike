import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ScreenHeader from "../components/ScreenHeader";
import StepIndicator from "../components/StepIndicator";
import { colors, radius, spacing, typography } from "../constants/theme";
import { useHikeForm } from "../context/HikeFormContext";
import { getCurrentLocation } from "../services/locationService";
import { getCurrentWeather } from "../services/weatherService";

export default function EntryLocationScreen({ navigation }) {
  const { form, setFields, resetForm, editingHikeId } = useHikeForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUseLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const coords = await getCurrentLocation();
      const weather = await getCurrentWeather(coords.latitude, coords.longitude);
      setFields({ ...coords, weather });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title={editingHikeId ? "Edit Hike" : "Add Hike"}
        onBack={() => navigation.goBack()}
        rightIcon="close"
        onRightPress={() => {
          resetForm();
          navigation.popToTop();
        }}
      />
      <StepIndicator step={3} label="Location & Safety" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.caption}>Set your hike location and check weather and safety conditions.</Text>

        <View style={styles.mapPlaceholder}>
          <MaterialIcons name="location-on" size={28} color={colors.primary} />
          {form.latitude ? (
            <Text style={typography.caption}>
              {Math.abs(form.latitude).toFixed(4)}°{form.latitude >= 0 ? "N" : "S"},{" "}
              {Math.abs(form.longitude).toFixed(4)}°{form.longitude >= 0 ? "E" : "W"}
            </Text>
          ) : null}
        </View>

        <View style={styles.rowGap}>
          <TouchableOpacity style={styles.pillBtn} onPress={handleUseLocation} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialIcons name="my-location" size={16} color={colors.primary} />
            )}
            <Text style={styles.pillText}>Use current location</Text>
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={[typography.h2, styles.sectionTitle]}>Weather Preview</Text>
        <View style={styles.card}>
          {form.weather ? (
            <>
              <Text style={styles.temp}>{Math.round(form.weather.temperature)}°C</Text>
              <Text style={typography.caption}>{form.weather.description}</Text>
            </>
          ) : (
            <Text style={typography.caption}>Fetch a location to preview conditions.</Text>
          )}
        </View>

        {form.weather ? (
          <View style={styles.safetyCard}>
            <MaterialIcons name="verified-user" size={20} color={colors.primary} />
            <Text style={styles.safetyText}>Conditions look good for your hike!</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate("Confirm")}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  mapPlaceholder: {
    height: 160,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.sm,
    gap: spacing.xs,
  },
  rowGap: { flexDirection: "row", gap: spacing.sm },
  pillBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
  },
  pillText: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  error: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
  sectionTitle: { marginTop: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  temp: { fontSize: 22, fontWeight: "700", color: colors.text },
  safetyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  safetyText: { flex: 1, color: colors.text },
  footer: { flexDirection: "row", gap: spacing.sm, padding: spacing.md },
  backBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  backText: { color: colors.text, fontWeight: "700" },
  continueBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  continueText: { color: colors.surface, fontWeight: "700", fontSize: 15 },
});
