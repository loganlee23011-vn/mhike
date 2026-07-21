// Email/password auth, wraps Firebase Auth so screens never call the SDK directly.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "./firebaseConfig";

const ERROR_MESSAGES = {
  "auth/invalid-email": "Enter a valid email address.",
  "auth/missing-password": "Password is required.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/email-already-in-use": "An account already exists for this email.",
  "auth/user-not-found": "No account found for this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
};

function friendlyError(error) {
  return ERROR_MESSAGES[error.code] || "Something went wrong. Please try again.";
}

export async function registerWithEmail(email, password) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  } catch (error) {
    throw new Error(friendlyError(error));
  }
}

export async function signInWithEmail(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  } catch (error) {
    throw new Error(friendlyError(error));
  }
}

export async function signOutUser() {
  await signOut(auth);
}
