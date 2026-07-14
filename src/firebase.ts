import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";
import { Project, UserDoc } from "./types";

// Initialize Firebase with the explicit custom firestoreDatabaseId if provided
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
const auth = getAuth(app);

const PROJECTS_COLLECTION = "projects";

/**
 * Maps the admin username to a valid Firebase Auth email format
 */
export function getEmailForUsername(username: string): string {
  const clean = username.trim().toLowerCase();
  return `${clean}@cybersamurai.co.uk`;
}

/**
 * Fetch all users from Firestore users collection
 */
export async function fetchUsersFromFirestore(): Promise<UserDoc[]> {
  try {
    const q = query(collection(db, "users"));
    const snapshot = await getDocs(q);
    const usersList: UserDoc[] = [];
    snapshot.forEach((docSnap) => {
      usersList.push(docSnap.data() as UserDoc);
    });
    return usersList;
  } catch (error) {
    console.error("Error fetching users from Firestore:", error);
    return [];
  }
}

/**
 * Save or update a user document in Firestore
 */
export async function saveUserToFirestore(userDoc: UserDoc): Promise<void> {
  try {
    const docRef = doc(db, "users", userDoc.username);
    await setDoc(docRef, userDoc, { merge: true });
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    throw error;
  }
}

/**
 * Get a user document from Firestore by email or username
 */
export async function getUserFromFirestore(emailOrUsername: string): Promise<UserDoc | null> {
  try {
    const clean = emailOrUsername.trim().toLowerCase();
    const username = clean.includes("@") ? clean.split("@")[0] : clean;
    const docRef = doc(db, "users", username);
    const snapshot = await getDocs(query(collection(db, "users")));
    let found: UserDoc | null = null;
    snapshot.forEach((ds) => {
      const u = ds.data() as UserDoc;
      if (u.username.toLowerCase() === username || u.email.toLowerCase() === clean) {
        found = u;
      }
    });
    return found;
  } catch (error) {
    console.error("Error getting user from Firestore:", error);
    return null;
  }
}

/**
 * Seeds default admin users into the "users" collection
 */
export async function seedUsersInFirestore(): Promise<void> {
  try {
    const defaultUsers: UserDoc[] = [
      {
        id: "kimkapuan23",
        username: "kimkapuan23",
        email: "kimkapuan23@cybersamurai.co.uk",
        role: "admin",
        isAdmin: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "kimkapuant23",
        username: "kimkapuant23",
        email: "kimkapuant23@cybersamurai.co.uk",
        role: "admin",
        isAdmin: true,
        createdAt: new Date().toISOString()
      }
    ];

    for (const u of defaultUsers) {
      await saveUserToFirestore(u);
    }
    console.log("Users seeded successfully in Firestore.");
  } catch (error) {
    console.error("Error seeding users in Firestore:", error);
  }
}

/**
 * Fetch all projects from Firestore, ordered by title or a custom criteria
 */
export async function fetchProjectsFromFirestore(): Promise<Project[]> {
  try {
    const q = query(collection(db, PROJECTS_COLLECTION));
    const snapshot = await getDocs(q);
    const projects: Project[] = [];
    snapshot.forEach((docSnap) => {
      projects.push(docSnap.data() as Project);
    });
    return projects;
  } catch (error) {
    console.error("Error fetching projects from Firestore:", error);
    throw error;
  }
}

/**
 * Save or update a project in Firestore
 */
export async function saveProjectToFirestore(project: Project): Promise<void> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, project.id);
    await setDoc(docRef, project, { merge: true });
  } catch (error) {
    console.error("Error saving project to Firestore:", error);
    throw error;
  }
}

/**
 * Delete a project from Firestore
 */
export async function deleteProjectFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting project from Firestore:", error);
    throw error;
  }
}

export { app, db, auth };
