import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../constants/theme";

export default function StepIndicator({ step, total = 3, label }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.stepText}>
        Step {step} of {total}
      </Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.track}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < step ? styles.dotDone : styles.dotTodo]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  stepText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  label: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  track: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: radius.pill,
  },
  dotDone: {
    backgroundColor: colors.primary,
  },
  dotTodo: {
    backgroundColor: colors.border,
  },
});
