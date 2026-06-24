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
import { Project } from "./types";

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
  return `${clean}@cybersamurai.com`;
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
