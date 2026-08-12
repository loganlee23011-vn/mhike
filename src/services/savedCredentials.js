// "Remember me" storage for the Login screen. Uses SecureStore (OS Keychain /
// Keystore) rather than AsyncStorage because this holds a raw password —
// separate from Firebase Auth's own session persistence in firebaseConfig.js.
import * as SecureStore from "expo-secure-store";

const EMAIL_KEY = "mhike_saved_email";
const PASSWORD_KEY = "mhike_saved_password";

export async function saveCredentials(email, password) {
  await SecureStore.setItemAsync(EMAIL_KEY, email);
  await SecureStore.setItemAsync(PASSWORD_KEY, password);
}

export async function loadCredentials() {
  const [email, password] = await Promise.all([
    SecureStore.getItemAsync(EMAIL_KEY),
    SecureStore.getItemAsync(PASSWORD_KEY),
  ]);
  return { email: email || "", password: password || "" };
}

export async function clearCredentials() {
  await SecureStore.deleteItemAsync(EMAIL_KEY);
  await SecureStore.deleteItemAsync(PASSWORD_KEY);
}
