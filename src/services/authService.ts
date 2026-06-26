import { 
  signInWithEmailAndPassword as fbSignIn,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  User
} from "firebase/auth";
import { auth, getEmailForUsername } from "../firebase";

/**
 * Performs admin sign in using username and password.
 */
export async function login(username: string, passcode: string): Promise<User> {
  const cleanUsername = username.trim().toLowerCase();
  const email = getEmailForUsername(cleanUsername);
  const userCredential = await fbSignIn(auth, email, passcode);
  return userCredential.user;
}

/**
 * Performs sign out.
 */
export async function logout(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Subscribes to auth state changes.
 */
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return fbOnAuthStateChanged(auth, callback);
}
