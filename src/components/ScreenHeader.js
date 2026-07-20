import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, spacing, typography } from "../constants/theme";

export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
}) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      <View style={styles.titleWrap}>
        <Text style={typography.h2}>{title}</Text>
        {subtitle ? <Text style={typography.caption}>{subtitle}</Text> : null}
      </View>

      {rightIcon ? (
        <TouchableOpacity
          onPress={onRightPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name={rightIcon} size={22} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  spacer: {
    width: 24,
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
  },
});
