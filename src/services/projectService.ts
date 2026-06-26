import { Project } from "../types";
import { INITIAL_PROJECTS } from "../data";
import {
  fetchProjectsFromFirestore,
  saveProjectToFirestore,
  deleteProjectFromFirestore
} from "../firebase";

/**
 * Validates if the projects list needs a seed (either empty, missing core projects, or contains legacy badges).
 */
export function needsSeeding(projects: Project[]): boolean {
  const hasNewProjects = projects.some(p => p.id === "cyber-siege");
  const hasLegacyBadges = projects.some(p => {
    const badge = p.badge as any;
    return badge === "SHOGUN" || 
           badge === "SAMURAI" || 
           badge === "RONIN" || 
           badge === "SHINOBI" || 
           badge === "SABER";
  });
  return projects.length === 0 || !hasNewProjects || hasLegacyBadges;
}

/**
 * Validates the loaded projects and seeds/repairs them in Firestore if necessary.
 */
export async function validateAndSeedProjects(projects: Project[]): Promise<Project[]> {
  if (needsSeeding(projects)) {
    console.log("Seeding INITIAL_PROJECTS...");
    // Clean up old ones if they exist
    for (const p of projects) {
      try {
        await deleteProjectFromFirestore(p.id);
      } catch (e) {
        console.error("Error deleting project during seeding:", p.id, e);
      }
    }
    // Seed new ones
    for (const p of INITIAL_PROJECTS) {
      await saveProjectToFirestore(p);
    }
    const seededData = await fetchProjectsFromFirestore();
    return seededData.length > 0 ? seededData : INITIAL_PROJECTS;
  } else {
    // Check if any of our screenshot projects are missing, and seed them
    const missing = INITIAL_PROJECTS.filter(ip => !projects.some(dp => dp.id === ip.id));
    if (missing.length > 0) {
      for (const p of missing) {
        await saveProjectToFirestore(p);
      }
      return fetchProjectsFromFirestore();
    }
    return projects;
  }
}

/**
 * Resets Firestore database to initial projects state.
 */
export async function resetProjects(currentProjects: Project[]): Promise<Project[]> {
  // Clear Firestore projects first
  for (const p of currentProjects) {
    try {
      await deleteProjectFromFirestore(p.id);
    } catch (e) {
      console.error("Failed to delete project during reset:", p.id, e);
    }
  }
  // Re-seed original INITIAL_PROJECTS
  for (const p of INITIAL_PROJECTS) {
    try {
      await saveProjectToFirestore(p);
    } catch (e) {
      console.error("Failed to save project during reset:", p.id, e);
    }
  }
  return INITIAL_PROJECTS;
}

/**
 * Retrieves projects from localStorage, falling back to INITIAL_PROJECTS if invalid or missing.
 */
export function getLocalStorageProjects(): Project[] {
  const stored = localStorage.getItem("ronin_projects");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (needsSeeding(parsed)) {
        return INITIAL_PROJECTS;
      }
      return parsed;
    } catch (e) {
      return INITIAL_PROJECTS;
    }
  }
  return INITIAL_PROJECTS;
}

/**
 * Saves projects to localStorage.
 */
export function saveLocalStorageProjects(projects: Project[]): void {
  localStorage.setItem("ronin_projects", JSON.stringify(projects));
}
