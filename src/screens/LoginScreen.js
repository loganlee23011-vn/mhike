import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing, typography } from "../constants/theme";
import { signInWithEmail } from "../services/authService";
import { clearCredentials, loadCredentials, saveCredentials } from "../services/savedCredentials";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill from the last "Remember me" login, if any.
  useEffect(() => {
    loadCredentials().then(({ email: savedEmail, password: savedPassword }) => {
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    });
  }, []);

  const handleLogin = async () => {
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      if (rememberMe) {
        await saveCredentials(email.trim(), password);
      } else {
        await clearCredentials();
      }
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Text style={styles.brandMark}>M</Text>
          </View>
          <Text style={[typography.h1, styles.title]}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue to M-Hike.</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
          {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe((prev) => !prev)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe ? <Ionicons name="checkmark" size={14} color={colors.surface} /> : null}
            </View>
            <Text style={styles.rememberText}>Remember me (save password)</Text>
          </TouchableOpacity>

          {errors.form ? <Text style={[styles.error, styles.formError]}>{errors.form}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleLogin}
            disabled={submitting}
          >
            <Text style={styles.submitText}>{submitting ? "Signing in..." : "Sign In"}</Text>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.switchLink}> Create one</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: spacing.lg },
  brand: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  brandMark: { color: colors.surface, fontSize: 28, fontWeight: "700" },
  title: { textAlign: "center" },
  subtitle: { textAlign: "center", color: colors.textMuted, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  formError: { textAlign: "center", marginTop: spacing.sm },
  rememberRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.md },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  rememberText: { color: colors.text, fontSize: 14 },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: colors.surface, fontWeight: "700", fontSize: 15 },
  switchRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.lg },
  switchText: { color: colors.textMuted },
  switchLink: { color: colors.primary, fontWeight: "700" },
});
