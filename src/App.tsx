import React, { useState, useEffect } from "react";
import { Project, ZenQuote, UserDoc } from "./types";
import { INITIAL_PROJECTS, BUSHIDO_QUOTES, BUSHIDO_VIRTUES } from "./data";
import { SumiCanvas } from "./components/SumiCanvas";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectModal } from "./components/ProjectModal";
import { BambooFrame } from "./components/BambooFrame";
import {
  Sun,
  Moon,
  Plus,
  Compass,
  Sparkles,
  ShieldAlert,
  Terminal,
  RefreshCw,
  BookOpen,
  ArrowUpRight,
  Code,
  CheckCircle,
  Hash,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Firebase imports
import { 
  auth, 
  db, 
  getEmailForUsername, 
  fetchUsersFromFirestore,
  saveUserToFirestore,
  getUserFromFirestore,
  seedUsersInFirestore,
  fetchProjectsFromFirestore,
  saveProjectToFirestore,
  deleteProjectFromFirestore
} from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";

export default function App() {
  // --- Persistent Dark/Light Mode state ---
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("ronin_theme");
    if (stored === "light" || stored === "dark") return stored;
    return "dark"; // Default to dark mode (monochrome dark background)
  });

  // --- Projects State initialized empty, fetched from Firestore ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [firebaseError, setFirebaseError] = useState("");

  // --- Active filter ---
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // --- Selected Virtue ---
  const [selectedVirtue, setSelectedVirtue] = useState(BUSHIDO_VIRTUES[0]);

  // --- Current Quote index ---
  const [quoteIndex, setQuoteIndex] = useState(0);

  // --- Featured Projects Carousel & Bamboo transition states ---
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isWiping, setIsWiping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // --- Modal states ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // --- Admin Mode states (Powered by Firebase Auth) ---
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);

  // --- Live Users List states ---
  const [usersList, setUsersList] = useState<UserDoc[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "viewer">("admin");
  const [userActionError, setUserActionError] = useState("");

  // Apply dark mode class to html document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("ronin_theme", theme);
  }, [theme]);

  // Real-time Firebase Auth listener with live user roles lookup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAdminUser(user);
        try {
          const userDoc = await getUserFromFirestore(user.email || "");
          if (userDoc && (userDoc.role === "admin" || userDoc.isAdmin === true)) {
            setIsAdmin(true);
          } else {
            // Fallback for default admin list
            const defaultAdmins = ["kimkapuan23@cybersamurai.co.uk", "kimkapuant23@cybersamurai.co.uk"];
            setIsAdmin(defaultAdmins.includes(user.email?.toLowerCase() || ""));
          }
        } catch (err) {
          console.error("Error fetching user role from Firestore:", err);
          const defaultAdmins = ["kimkapuan23@cybersamurai.co.uk", "kimkapuant23@cybersamurai.co.uk"];
          setIsAdmin(defaultAdmins.includes(user.email?.toLowerCase() || ""));
        }
      } else {
        setIsAdmin(false);
        setAdminUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load projects from Firestore/local storage on mount & seed default admins in Firestore
  useEffect(() => {
    let active = true;
    async function loadDataAndSeed() {
      try {
        // Seed users directory (kept for live admin roles lookup in Firestore)
        await seedUsersInFirestore();
      } catch (err) {
        console.error("Error seeding users:", err);
      }

      setIsLoadingProjects(true);
      try {
        // Try fetching from Firestore first
        const firebaseProjects = await fetchProjectsFromFirestore();
        if (firebaseProjects && firebaseProjects.length > 0 && active) {
          setProjects(firebaseProjects);
          try {
            localStorage.setItem("ronin_projects", JSON.stringify(firebaseProjects));
          } catch (e) {
            console.error("Local storage sync error:", e);
          }
        } else {
          // Fallback to local storage if Firestore has no projects
          const stored = localStorage.getItem("ronin_projects");
          if (stored && active) {
            try {
              const parsed = JSON.parse(stored);
              setProjects(parsed);
              // Also populate Firestore so they are synced
              for (const p of parsed) {
                await saveProjectToFirestore(p);
              }
            } catch (e) {
              setProjects(INITIAL_PROJECTS);
              try {
                localStorage.setItem("ronin_projects", JSON.stringify(INITIAL_PROJECTS));
              } catch (se) {
                console.error("Local storage initial seed failure:", se);
              }
              for (const p of INITIAL_PROJECTS) {
                await saveProjectToFirestore(p);
              }
            }
          } else if (active) {
            setProjects(INITIAL_PROJECTS);
            try {
              localStorage.setItem("ronin_projects", JSON.stringify(INITIAL_PROJECTS));
            } catch (se) {
              console.error("Local storage initial seed failure:", se);
            }
            for (const p of INITIAL_PROJECTS) {
              await saveProjectToFirestore(p);
            }
          }
        }
      } catch (err: any) {
        console.error("Error loading projects from Firestore:", err);
        setFirebaseError("Cloud Archive unreached. Loading offline replica.");
        // Fallback to local storage on Firestore failure
        if (active) {
          const stored = localStorage.getItem("ronin_projects");
          if (stored) {
            try {
              setProjects(JSON.parse(stored));
            } catch (e) {
              setProjects(INITIAL_PROJECTS);
            }
          } else {
            setProjects(INITIAL_PROJECTS);
          }
        }
      } finally {
        if (active) {
          setIsLoadingProjects(false);
        }
      }
    }
    loadDataAndSeed();
    return () => {
      active = false;
    };
  }, []);

  // Sync / Load live users directory whenever isAdmin is active
  useEffect(() => {
    let active = true;
    async function loadUsers() {
      if (!isAdmin) return;
      try {
        setIsLoadingUsers(true);
        const list = await fetchUsersFromFirestore();
        if (active) {
          setUsersList(list);
        }
      } catch (err) {
        console.error("Error loading users directory:", err);
      } finally {
        if (active) {
          setIsLoadingUsers(false);
        }
      }
    }
    loadUsers();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  // Back up state locally as a safe local replica
  useEffect(() => {
    if (projects.length > 0) {
      try {
        localStorage.setItem("ronin_projects", JSON.stringify(projects));
      } catch (e) {
        console.error("Local storage backup failed (likely quota exceeded due to large content):", e);
      }
    }
  }, [projects]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Rotate quotes
  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % BUSHIDO_QUOTES.length);
  };

  // --- Admin Mode Handlers (Firebase Auth powered) ---
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = usernameInput.trim().toLowerCase();
    const cleanPassword = passcodeInput;

    if (!cleanUsername) {
      setPasscodeError("USERNAME IS REQUIRED");
      return;
    }

    if (!cleanPassword) {
      setPasscodeError("PASSWORD IS REQUIRED");
      return;
    }

    try {
      setPasscodeError("");
      const email = getEmailForUsername(cleanUsername);

      try {
        // Attempt normal sign-in first
        await signInWithEmailAndPassword(auth, email, cleanPassword);
      } catch (signInErr: any) {
        // If the user doesn't exist (e.g. auth/user-not-found or auth/invalid-credential),
        // automatically register them on their first login attempt to seed the admin account.
        if (
          signInErr.code === "auth/user-not-found" ||
          signInErr.code === "auth/invalid-credential"
        ) {
          try {
            await createUserWithEmailAndPassword(auth, email, cleanPassword);
          } catch (createErr: any) {
            if (createErr.code === "auth/email-already-in-use") {
              throw signInErr; // Re-throw the original sign-in error
            } else {
              throw createErr;
            }
          }
        } else {
          throw signInErr;
        }
      }

      setShowPasscodeModal(false);
      setPasscodeInput("");
    } catch (err: any) {
      console.error("Auth error:", err);
      if (
        err.code === "auth/user-not-found" || 
        err.code === "auth/invalid-credential" || 
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-email"
      ) {
        setPasscodeError("INVALID CREDENTIALS. VERIFY YOUR USERNAME OR PASSWORD.");
      } else {
        setPasscodeError(err.message || "AUTHENTICATION SYSTEM UNREACHABLE");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };


  // --- Project Handlers ---
  const handleSaveProject = async (savedProject: Project) => {
    if (!isAdmin) {
      setShowPasscodeModal(true);
      return;
    }
    
    // Save to state and local storage immediately for responsive UI
    setProjects((prev) => {
      const updated = editingProject 
        ? prev.map((p) => (p.id === savedProject.id ? savedProject : p))
        : [savedProject, ...prev];
      try {
        localStorage.setItem("ronin_projects", JSON.stringify(updated));
      } catch (e) {
        console.error("Local storage sync error:", e);
      }
      return updated;
    });

    // Save to Firestore DB
    try {
      await saveProjectToFirestore(savedProject);
    } catch (err: any) {
      console.error("Error saving project to Firestore:", err);
      setFirebaseError("Failed to sync project with Cloud Archive.");
    }
    
    setEditingProject(null);
  };

  const handleEditProject = (project: Project) => {
    if (!isAdmin) {
      setShowPasscodeModal(true);
      return;
    }
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (!isAdmin) {
      setShowPasscodeModal(true);
      return;
    }
    
    // Delete from state and local storage immediately
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem("ronin_projects", JSON.stringify(updated));
      } catch (e) {
        console.error("Local storage sync error:", e);
      }
      return updated;
    });

    // Delete from Firestore DB
    try {
      await deleteProjectFromFirestore(id);
    } catch (err: any) {
      console.error("Error deleting project from Firestore:", err);
      setFirebaseError("Failed to delete project from Cloud Archive.");
    }
  };

  const handleAddNewClick = () => {
    if (!isAdmin) {
      setShowPasscodeModal(true);
      return;
    }
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleResetToDefault = async () => {
    if (!isAdmin) {
      setShowPasscodeModal(true);
      return;
    }
    if (!showConfirmRestore) {
      setShowConfirmRestore(true);
      // Auto-reset confirmation state after 4 seconds
      setTimeout(() => setShowConfirmRestore(false), 4000);
      return;
    }
    setIsLoadingProjects(true);
    try {
      setProjects(INITIAL_PROJECTS);
      try {
        localStorage.setItem("ronin_projects", JSON.stringify(INITIAL_PROJECTS));
      } catch (e) {
        console.error("Local storage reset error:", e);
      }
      setActiveCategory("ALL");
      setShowConfirmRestore(false);
      
      // Update Firestore DB in background
      for (const p of INITIAL_PROJECTS) {
        await saveProjectToFirestore(p);
      }
    } catch (err) {
      console.error("Local reset failure:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // --- User Directory Handlers ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError("");
    const cleanUsername = newUsername.trim().toLowerCase();
    const cleanEmail = newUserEmail.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail) {
      setUserActionError("USERNAME AND EMAIL ARE REQUIRED");
      return;
    }

    try {
      const newUser: UserDoc = {
        id: cleanUsername,
        username: cleanUsername,
        email: cleanEmail,
        role: newUserRole,
        isAdmin: newUserRole === "admin",
        createdAt: new Date().toISOString()
      };

      await saveUserToFirestore(newUser);
      
      // Update local state list
      setUsersList((prev) => {
        const filtered = prev.filter((u) => u.username !== cleanUsername);
        return [newUser, ...filtered];
      });

      setNewUsername("");
      setNewUserEmail("");
    } catch (err: any) {
      console.error("Error creating user:", err);
      setUserActionError(err.message || "COULD NOT CREATE USER IN FIRESTORE");
    }
  };

  const handleToggleAdmin = async (targetUser: UserDoc) => {
    try {
      const updatedRole: "admin" | "viewer" = targetUser.role === "admin" ? "viewer" : "admin";
      const updatedUser: UserDoc = {
        ...targetUser,
        role: updatedRole,
        isAdmin: updatedRole === "admin"
      };

      await saveUserToFirestore(updatedUser);

      // Update local state list
      setUsersList((prev) =>
        prev.map((u) => (u.username === targetUser.username ? updatedUser : u))
      );
    } catch (err) {
      console.error("Error toggling user admin role:", err);
    }
  };

  const handleDeleteUser = async (username: string) => {
    // For safety, don't allow deleting yourself
    const currentUsername = adminUser?.email?.split("@")[0] || "";
    if (
      username.toLowerCase() === currentUsername.toLowerCase() || 
      username === "kimkapuan23" || 
      username === "kimkapuant23"
    ) {
      setUserActionError("PROTECTED ACCOUNT: CANNOT REMOVE INTEGRAL CREW MEMBERS OR YOURSELF.");
      return;
    }

    try {
      const { deleteDoc, doc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "users", username));

      // Update local state list
      setUsersList((prev) => prev.filter((u) => u.username !== username));
    } catch (err: any) {
      console.error("Error deleting user document:", err);
      setUserActionError(err.message || "COULD NOT DELETE USER IN FIRESTORE");
    }
  };

  // --- Gather unique categories for filtering ---
  const categories: string[] = ["ALL", ...Array.from(new Set<string>(projects.map((p) => p.category)))];

  // Filter projects list
  const filteredProjects = projects.filter((p) => {
    if (activeCategory === "ALL") return true;
    return p.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const featuredProjects = projects.filter((p) => p.featured);
  const activeFeaturedProjects = featuredProjects.length > 0 ? featuredProjects : (projects.length > 0 ? [projects[0]] : []);
  const featuredIds = new Set(activeFeaturedProjects.map((p) => p.id));
  const regularProjects = filteredProjects.filter((p) => !featuredIds.has(p.id));

  // Safeguard carouselIndex against out-of-bounds errors (e.g. if projects are unpinned)
  useEffect(() => {
    if (carouselIndex >= activeFeaturedProjects.length) {
      setCarouselIndex(0);
    }
  }, [activeFeaturedProjects.length, carouselIndex]);

  // Swipe function with a minimalistic, cutting-edge staggered vertical bamboo-bar transition
  const triggerSwipe = (nextIdx: number) => {
    setIsWiping(true);
    // At the exact peak coverage (350ms), swap the active index!
    setTimeout(() => {
      setCarouselIndex(nextIdx);
    }, 350);
    // After the bars retract, set wiping to false (850ms total)
    setTimeout(() => {
      setIsWiping(false);
    }, 850);
  };

  const handleNextFeatured = () => {
    if (activeFeaturedProjects.length <= 1 || isWiping) return;
    const nextIdx = (carouselIndex + 1) % activeFeaturedProjects.length;
    triggerSwipe(nextIdx);
  };

  const handlePrevFeatured = () => {
    if (activeFeaturedProjects.length <= 1 || isWiping) return;
    const prevIdx = (carouselIndex - 1 + activeFeaturedProjects.length) % activeFeaturedProjects.length;
    triggerSwipe(prevIdx);
  };

  // Auto-playing interval (5 seconds) with hover-pause behavior
  useEffect(() => {
    if (activeFeaturedProjects.length <= 1 || isHovered || isWiping) return;
    const interval = setInterval(() => {
      const nextIdx = (carouselIndex + 1) % activeFeaturedProjects.length;
      triggerSwipe(nextIdx);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeFeaturedProjects, carouselIndex, isHovered, isWiping]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-500 relative flex flex-col justify-between selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Editorial Vertical Lines & Artistic Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Editorial Vertical Page-Layout Rules */}
        <div className="absolute left-12 top-0 bottom-0 w-[1px] bg-neutral-900/10 dark:bg-neutral-100/10 hidden md:block"></div>
        <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-neutral-900/5 dark:bg-neutral-100/5 hidden md:block"></div>
        
        {/* Editorial Right Top Bamboo Stalk Line Accent */}
        <div className="absolute top-24 right-20 pointer-events-none opacity-20 dark:opacity-35 hidden lg:block text-neutral-900 dark:text-neutral-100">
          <svg width="200" height="300" viewBox="0 0 200 300" fill="currentColor">
            <path d="M50,0 Q55,50 50,100 T50,200 T50,300" stroke="currentColor" strokeWidth="4" fill="none" />
            <path d="M50,40 Q80,30 110,45" stroke="currentColor" strokeWidth="1" fill="none" />
            <path d="M50,120 Q20,110 0,130" stroke="currentColor" strokeWidth="1" fill="none" />
            <rect x="45" y="35" width="10" height="4" />
            <rect x="45" y="115" width="10" height="4" />
            <rect x="45" y="205" width="10" height="4" />
          </svg>
        </div>

        {/* Editorial Bottom Left Calligraphic Accent */}
        <div className="absolute bottom-24 left-10 opacity-30 dark:opacity-45 pointer-events-none hidden lg:block text-neutral-900 dark:text-neutral-100">
          <svg width="150" height="150" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="30" cy="30" r="5" />
            <circle cx="45" cy="45" r="12" />
            <circle cx="60" cy="25" r="8" />
            <path d="M10,80 Q40,60 70,90 T100,50" stroke="currentColor" fill="none" />
          </svg>
        </div>

        <SumiCanvas />
      </div>

      {/* Main content layer */}
      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* Navigation & Header */}
        <header className="border-b border-neutral-100 dark:border-neutral-900 bg-white/70 dark:bg-black/70 backdrop-blur-md sticky top-0 z-40 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Logo / Brand signoff with Editorial Outline Style */}
            <a
              href="https://cybersamurai.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 group cursor-pointer"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-neutral-900 dark:bg-white text-white dark:text-black font-display font-black text-sm tracking-tighter transition-transform duration-200 group-hover:scale-105">
                浪
              </div>
              <div>
                <h1 className="font-display font-black text-base tracking-tight uppercase text-neutral-900 dark:text-neutral-100 transition-colors duration-200 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
                  Projects
                </h1>
                <p className="text-[9px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                  // PORTFOLIO MANIFESTO
                </p>
              </div>
            </a>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* Admin Mode Badge & Toggle */}
              {isAdmin ? (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[10px] font-mono border border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-xs transition-all cursor-pointer"
                  title="Exit administrator mode"
                >
                  <Lock className="w-3 h-3" />
                  <span>EXIT_ADMIN</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setPasscodeError("");
                    setPasscodeInput("");
                    setShowPasscodeModal(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[10px] font-mono border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-450 dark:hover:border-neutral-750 rounded-xs transition-all cursor-pointer bg-neutral-50/50 dark:bg-neutral-950/20"
                  title="Admin Portal"
                >
                  <Unlock className="w-3 h-3" />
                  <span>Admin Portal</span>
                </button>
              )}

              {/* Reset config button */}
              {isAdmin && (
                <button
                  onClick={handleResetToDefault}
                  className={`hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 text-[10px] font-mono border rounded-xs transition-all cursor-pointer ${
                    showConfirmRestore
                      ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse"
                      : "border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                  }`}
                  title={showConfirmRestore ? "Click again to confirm database reset" : "Reset portfolio projects to original templates"}
                >
                  <RefreshCw className={`w-3 h-3 ${showConfirmRestore ? "animate-spin" : ""}`} />
                  <span>{showConfirmRestore ? "CONFIRM RESET?" : "RESTORE GENESIS"}</span>
                </button>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center h-[25px] w-[50px] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-100 text-[12px] font-mono transition-all duration-300 rounded-xs cursor-pointer"
                title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
              >
                {theme === "light" ? (
                  <Moon className="w-3.5 h-3.5" />
                ) : (
                  <Sun className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col md:flex-row items-center md:items-start justify-between gap-12 border-b border-neutral-100 dark:border-neutral-900">
          {/* Left Hero: Typography with Editorial outline styling */}
          <div className="flex-1 space-y-6 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white animate-pulse" />
              <span>STRICT OFF-LINE PERSISTENCE ACTIVE</span>
            </div>

            <div>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-none text-neutral-900 dark:text-white">
                Projects
              </h2>
              <div className="mt-3 flex items-center gap-4">
                <div className="h-[1px] w-12 bg-neutral-900 dark:bg-neutral-100"></div>
                <p className="text-[11px] uppercase tracking-[0.4em] font-medium text-neutral-500 dark:text-neutral-400">Web Craftsman & Creative Developer</p>
              </div>
            </div>

            <p className="text-sm md:text-base font-sans text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
              Welcome to the digital forge. In the spirit of the cyber-samurai, each code-block is refined,
              shunning excess, focusing purely on high-performance execution. Manage and showcase your arsenal 
              of modern web applications within this interactive, monochrome canvas.
            </p>

            {/* Small action buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <a
                href="#virtues-codex"
                className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-100 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors rounded-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>BUSHIDO</span>
              </a>
            </div>
          </div>

          {/* Right Hero: Giant Calligraphic Monogram & Live Stats */}
          <div className="w-full md:w-80 flex flex-col space-y-4">
            <div className="relative border border-neutral-200 dark:border-neutral-800 p-6 bg-neutral-50/50 dark:bg-neutral-950/20 backdrop-blur-xs flex flex-col justify-between h-56 group overflow-hidden">
              {/* Background watermark - opposite color and behind text */}
              <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 text-9xl font-display font-black text-neutral-900/10 dark:text-neutral-100/10 pointer-events-none select-none transition-transform duration-700 group-hover:scale-105 z-0">
                武
              </div>

              <div className="relative z-10">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">// ACTIVE ARSENAL STATS</span>
                <div className="mt-4">
                  <div>
                    <p className="text-[50px] font-display font-black leading-none text-neutral-900 dark:text-neutral-100">{projects.length}</p>
                    <p className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-2">PROJECTS IN BLADE</p>
                  </div>
                </div>
              </div>

              {/* Micro code line snippet */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 text-[9px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center justify-between relative z-10">
                <span>SYSTEM: COMPLIANT</span>
                <span>UTC: {new Date().toISOString().slice(11, 19)}</span>
              </div>
            </div>

            {/* Quick Quote Widget */}
            <div className="border border-neutral-200/50 dark:border-neutral-800/50 p-4 flex flex-col justify-between h-28 text-left bg-white/40 dark:bg-black/40 backdrop-blur-xs">
              <p className="text-xs italic text-neutral-500 dark:text-neutral-400 line-clamp-2">
                "{BUSHIDO_QUOTES[quoteIndex].text}"
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-2">
                <span>— {BUSHIDO_QUOTES[quoteIndex].author}</span>
                <button
                  onClick={nextQuote}
                  className="hover:text-neutral-900 dark:hover:text-neutral-100 underline decoration-dotted cursor-pointer"
                >
                  NEXT MANTRA
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured App Showcase Carousel (Wide Hero Card Carousel) */}
        {activeFeaturedProjects.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">// SUPREME WORKPIECE CAROUSEL</span>
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight">FEATURED WEAPONS OF CHOICE</h3>
              </div>
              
              {/* Carousel Indicators & Controls */}
              {activeFeaturedProjects.length > 1 && (
                <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 p-1 rounded-xs self-start sm:self-auto">
                  <button
                    onClick={handlePrevFeatured}
                    className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 rounded-xs transition-all active:scale-90 cursor-pointer"
                    title="Previous Pinned Project"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {/* Indicators / Progress bars */}
                  <div className="flex items-center space-x-1.5 px-1">
                    {activeFeaturedProjects.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => !isWiping && triggerSwipe(idx)}
                        className="relative w-7 h-1 bg-neutral-200 dark:bg-neutral-800 overflow-hidden cursor-pointer"
                        title={`Go to slide ${idx + 1}`}
                      >
                        {carouselIndex === idx ? (
                          <motion.div
                            key={idx + (isHovered ? "-hovered" : "-active")}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                              duration: isHovered ? 0 : 5,
                              ease: "linear",
                            }}
                            className="absolute top-0 left-0 h-full bg-neutral-900 dark:bg-neutral-100"
                          />
                        ) : null}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextFeatured}
                    className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 rounded-xs transition-all active:scale-90 cursor-pointer"
                    title="Next Pinned Project"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative overflow-hidden w-full"
            >
              <BambooFrame isFeatured={true} className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative min-h-[380px] lg:min-h-[420px]">
                  
                  {/* Active Slide Content */}
                  {(() => {
                    const project = activeFeaturedProjects[carouselIndex];
                    if (!project) return null;
                    return (
                      <>
                        {/* Info block */}
                        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-[11px] font-mono tracking-widest text-red-600 dark:text-red-400 uppercase font-semibold">
                                [ PINNED WORK {carouselIndex + 1}/{activeFeaturedProjects.length} ]
                              </span>
                              <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">// {project.category}</span>
                            </div>

                            <h4 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                              {project.title}
                            </h4>

                            {project.role && (
                              <p className="text-xs font-mono text-neutral-500">// ROLE: {project.role}</p>
                            )}

                            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                              {project.description}
                            </p>
                          </div>

                          {/* Tech stack & Actions */}
                          <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-900">
                            <div className="flex flex-wrap gap-2">
                              {project.tech.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs font-mono px-2.5 py-0.5 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center space-x-3 pt-2">
                              {project.demoUrl && (
                                <a
                                  href={project.demoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-mono font-semibold tracking-wider uppercase border border-neutral-950 dark:border-neutral-100 bg-neutral-950 text-white dark:bg-neutral-100 dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-150 rounded-xs"
                                >
                                  <span>View Project</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {project.codeUrl && (
                                <a
                                  href={project.codeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-mono uppercase tracking-wider border border-neutral-200 dark:border-neutral-800 hover:border-neutral-950 dark:hover:border-neutral-100 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-neutral-100 transition-all duration-150 rounded-xs"
                                >
                                  <Code className="w-3.5 h-3.5" />
                                  <span>SOURCE REPOSITORY</span>
                                </a>
                              )}

                              {isAdmin && (
                                <button
                                  onClick={() => handleEditProject(project)}
                                  className="px-3 py-2 text-xs font-mono uppercase tracking-wider border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-200 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ml-auto cursor-pointer"
                                  title="Edit project specs"
                                >
                                  EDIT
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Aesthetic Visual Side Column */}
                        <div className="lg:col-span-5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 backdrop-blur-xs flex flex-col justify-center items-center p-8 relative overflow-hidden min-h-[220px]">
                          {project.image ? (
                            <div className="absolute inset-0 w-full h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                              {project.image.startsWith("data:video/") || project.image.endsWith(".webm") || project.image.includes("video/webm") ? (
                                <video
                                  src={project.image}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src={project.image}
                                  alt={project.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              )}
                              
                              <div className="absolute inset-0 bg-neutral-950/15 dark:bg-neutral-950/30 mix-blend-multiply" />
                              
                              <div className="absolute bottom-4 right-4 text-right flex flex-col items-end bg-black/75 backdrop-blur-xs px-2.5 py-1.5 border border-neutral-800 rounded-xs select-none">
                                <span className="text-[7px] font-mono tracking-widest text-neutral-400">ARTIFACT VERIFIED</span>
                                <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">[ CERTIFIED ]</span>
                              </div>
                              
                              <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-xs px-2.5 py-1.5 border border-neutral-800 rounded-xs select-none">
                                <span className="text-[9px] font-mono text-neutral-300 uppercase tracking-wider">
                                  TEAM: {project.badge}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="absolute w-36 h-36 rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 animate-spin [animation-duration:40s]" />
                              <div className="absolute w-28 h-28 rounded-full border border-neutral-200 dark:border-neutral-800" />

                              <div className="relative text-7xl font-bold font-display text-neutral-900 dark:text-neutral-100 animate-pulse select-none">
                                🛡️
                              </div>

                              <div className="absolute bottom-4 right-4 text-right flex flex-col items-end">
                                <span className="text-[8px] font-mono tracking-widest text-neutral-400">MONOCHROME SEAL</span>
                                <span className="text-[10px] font-mono text-neutral-800 dark:text-neutral-200 uppercase">[ APPROVED ]</span>
                              </div>

                              <div className="absolute bottom-4 left-4">
                                <span className="text-[9px] font-mono text-neutral-450 uppercase tracking-wider">
                                  TEAM: {project.badge}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}

                  {/* Bamboo Monochrome Staggered Gate Transition Wipe */}
                  <AnimatePresence>
                    {isWiping && (
                      <motion.div
                        className="absolute inset-0 z-30 grid grid-cols-5 pointer-events-none overflow-hidden"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        {[0, 1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            variants={{
                              initial: { scaleY: 0 },
                              animate: {
                                scaleY: 1,
                                transition: {
                                  duration: 0.35,
                                  delay: i * 0.05,
                                  ease: "easeInOut",
                                },
                              },
                              exit: {
                                scaleY: 0,
                                transition: {
                                  duration: 0.35,
                                  delay: (4 - i) * 0.05,
                                  ease: "easeInOut",
                                },
                              },
                            }}
                            style={{ originY: i % 2 === 0 ? 0 : 1 }}
                            className="bg-neutral-950 dark:bg-neutral-50 w-full h-full relative border-x border-neutral-900/10 dark:border-neutral-100/10"
                          >
                            {/* Minimalist Bamboo Nodes details */}
                            <div className="absolute inset-x-0 h-[2px] bg-neutral-900 dark:bg-neutral-200 top-1/3 opacity-30" />
                            <div className="absolute inset-x-0 h-[2px] bg-neutral-900 dark:bg-neutral-200 top-2/3 opacity-30" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-mono tracking-widest text-neutral-500 dark:text-neutral-400 font-bold uppercase opacity-40 select-none">
                              竹
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </BambooFrame>
            </div>
          </section>
        )}

        {/* Project Grid & Filtering */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-neutral-100 dark:border-neutral-900 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">// SHOWCASE COHORT</span>
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight">THE CHRONICLE OF CREATIONS</h3>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 text-xs font-mono tracking-wider border rounded-xs transition-all duration-200 cursor-pointer ${
                    activeCategory.toLowerCase() === cat.toLowerCase()
                      ? "border-neutral-950 bg-neutral-950 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-black"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-400 text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {cat === "ALL" ? "ALL WEAPONS" : cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingProjects ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="flex space-x-2 items-end h-12">
                  <motion.div 
                    animate={{ scaleY: [1, 2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} 
                    className="w-2.5 bg-neutral-900 dark:bg-white origin-bottom h-6 rounded-xs" 
                  />
                  <motion.div 
                    animate={{ scaleY: [1, 2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} 
                    className="w-2.5 bg-neutral-900 dark:bg-white origin-bottom h-9 rounded-xs" 
                  />
                  <motion.div 
                    animate={{ scaleY: [1, 2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} 
                    className="w-2.5 bg-neutral-900 dark:bg-white origin-bottom h-5 rounded-xs" 
                  />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest animate-pulse">
                  // RE-CONSULTING DIGITAL SCROLLS FROM CLOUD ARCHIVE...
                </span>
                {firebaseError && (
                  <span className="text-[9px] font-mono text-amber-500 uppercase tracking-wider animate-pulse">
                    {firebaseError}
                  </span>
                )}
              </div>
            ) : (
              <>
                {/* Create Card placeholder button - only visible to Admins */}
                {isAdmin && (
                  <div
                    onClick={handleAddNewClick}
                    className="group relative border-2 border-dashed border-neutral-300 dark:border-neutral-800 hover:border-neutral-950 dark:hover:border-neutral-100 p-8 flex flex-col justify-center items-center text-center cursor-pointer min-h-[300px] transition-all duration-300 bg-neutral-50/20 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/10"
                  >
                    {/* Bamboo shoot outline */}
                    <div className="w-16 h-16 border border-neutral-300 dark:border-neutral-800 group-hover:border-neutral-900 dark:group-hover:border-neutral-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 mb-4">
                      <Plus className="w-6 h-6 text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-neutral-100" />
                    </div>
                    <p className="font-display font-bold text-sm uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      ADD NEW APPLICATION
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans max-w-[200px] mt-1.5">
                      Add your custom web apps, portfolio links, and technology stacks directly.
                    </p>
                  </div>
                )}

                {/* Project List */}
                {filteredProjects.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-12 text-center border border-neutral-100 dark:border-neutral-900">
                    <ShieldAlert className="w-8 h-8 text-neutral-300 mb-2" />
                    <p className="text-sm text-neutral-400 font-mono">NO COMPATIBLE CREATIONS FOUND IN THIS SHIELD</p>
                  </div>
                ) : (
                  filteredProjects.map((proj) => (
                    <ProjectCard
                      key={proj.id}
                      project={proj}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                      isAdmin={isAdmin}
                    />
                  ))
                )}
              </>
            )}
          </div>
        </section>

        {/* Virtues Codex Section */}
        <section
          id="virtues-codex"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-neutral-100 dark:border-neutral-900 w-full relative overflow-hidden"
        >
          {/* Falling Cherry Blossom Petals Background Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {Array.from({ length: 18 }).map((_, i) => {
              const startX = (i * 7) % 100; // spread starting positions
              const duration = 10 + (i % 6) * 3; // 10s to 28s
              const delay = (i % 8) * 2.5; // staggered delay
              const size = 5 + (i % 4) * 2; // size 5px to 11px
              
              return (
                <motion.div
                  key={i}
                  className="absolute bg-gradient-to-br from-rose-400 to-orange-400 rounded-tr-full rounded-bl-full opacity-60 shadow-xs"
                  style={{
                    width: size,
                    height: size * 1.4,
                    left: `${startX}%`,
                    top: "-5%",
                  }}
                  animate={{
                    y: ["0vh", "110vh"],
                    x: ["0px", `${40 + (i % 3) * 35}px`, `${-25 + (i % 4) * 20}px`, `${15 + (i % 2) * 25}px`],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear",
                    delay: delay,
                  }}
                />
              );
            })}
          </div>

          <div className="relative z-10 text-center md:text-left mb-10">
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">// CODE OF THE CHERRY BLOSSOM</span>
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
              THE SEVEN VIRTUES OF THE DIGITAL RONIN
            </h3>
            <p className="text-xs text-neutral-500 font-sans mt-1">
              Each virtue blooms as a golden flower on our tree. Tap a flower to reveal its deep philosophical code.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Interactive Vector Cherry Tree */}
            <div className="lg:col-span-6 flex flex-col justify-center p-2 relative">
              <svg viewBox="0 0 400 450" className="w-full h-auto max-h-[480px] mx-auto select-none">
                <defs>
                  <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className="stop-neutral-400 dark:stop-neutral-700" />
                    <stop offset="100%" className="stop-neutral-600 dark:stop-neutral-900" />
                  </linearGradient>
                </defs>

                {/* Main Trunk */}
                <path
                  d="M 200,450 C 195,395 190,345 180,295"
                  fill="none"
                  className="stroke-neutral-300 dark:stroke-neutral-800"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M 180,295 C 175,255 170,215 175,175"
                  fill="none"
                  className="stroke-neutral-300 dark:stroke-neutral-800"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M 175,175 C 175,135 180,105 190,75"
                  fill="none"
                  className="stroke-neutral-300 dark:stroke-neutral-800"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Branch 1 (Gi - Left low) */}
                <path
                  d="M 183,340 C 150,335 130,342 120,350"
                  fill="none"
                  className="stroke-neutral-300 dark:stroke-neutral-800"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Sub-branch 1a */}
                <path
                  d="M 150,337 C 140,350 135,365 130,370"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Sub-branch 1b */}
                <path
                  d="M 135,345 C 125,335 110,330 100,332"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Twig 1c */}
                <path
                  d="M 142,352 C 132,360 122,363 115,365"
                  fill="none"
                  className="stroke-neutral-300/60 dark:stroke-neutral-800/60"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                
                {/* Branch 2 (Yu - Right low) */}
                <path
                  d="M 182,320 C 215,295 245,295 270,310"
                  fill="none"
                  className="stroke-neutral-300 dark:stroke-neutral-800"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Sub-branch 2a */}
                <path
                  d="M 220,300 C 235,315 250,325 255,335"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Sub-branch 2b */}
                <path
                  d="M 245,300 C 260,285 275,280 285,282"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Twig 2c */}
                <path
                  d="M 232,310 C 242,322 248,328 250,345"
                  fill="none"
                  className="stroke-neutral-300/60 dark:stroke-neutral-800/60"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Branch 3 (Jin - Left mid) */}
                <path
                  d="M 178,270 C 140,250 115,245 90,250"
                  fill="none"
                  className="stroke-neutral-300 dark:stroke-neutral-800"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Sub-branch 3a */}
                <path
                  d="M 140,251 C 120,235 105,225 95,222"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Sub-branch 3b */}
                <path
                  d="M 115,247 C 100,265 85,270 75,272"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Twig 3c */}
                <path
                  d="M 125,249 C 115,238 100,232 82,230"
                  fill="none"
                  className="stroke-neutral-300/60 dark:stroke-neutral-800/60"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Branch 4 (Rei - Right mid) */}
                <path
                  d="M 176,240 C 205,215 220,205 240,200"
                  fill="none"
                  className="stroke-neutral-300 dark:stroke-neutral-800"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Sub-branch 4a */}
                <path
                  d="M 205,220 C 215,190 230,180 245,175"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Sub-branch 4b */}
                <path
                  d="M 220,210 C 235,225 255,230 265,232"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Twig 4c */}
                <path
                  d="M 228,198 C 238,188 248,184 258,185"
                  fill="none"
                  className="stroke-neutral-300/60 dark:stroke-neutral-800/60"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Branch 5 (Makoto - Left high) */}
                <path
                  d="M 175,200 C 145,175 130,165 110,150"
                  fill="none"
                  className="stroke-neutral-300 dark:stroke-neutral-800"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Sub-branch 5a */}
                <path
                  d="M 145,175 C 135,190 120,195 112,198"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Sub-branch 5b */}
                <path
                  d="M 130,165 C 120,145 115,135 108,130"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Twig 5c */}
                <path
                  d="M 125,182 C 115,186 105,188 95,190"
                  fill="none"
                  className="stroke-neutral-300/60 dark:stroke-neutral-800/60"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Branch 6 (Meiyo - Right high) */}
                <path
                  d="M 175,190 C 215,160 250,150 290,130"
                  fill="none"
                  className="stroke-neutral-300 dark:stroke-neutral-800"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Sub-branch 6a */}
                <path
                  d="M 215,160 C 225,140 240,130 255,125"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Sub-branch 6b */}
                <path
                  d="M 250,150 C 270,165 285,170 300,172"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Twig 6c */}
                <path
                  d="M 235,142 C 248,132 258,124 268,115"
                  fill="none"
                  className="stroke-neutral-300/60 dark:stroke-neutral-800/60"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Branch 7 (Chugi - Top) */}
                <path
                  d="M 175,160 C 172,120 180,100 190,75"
                  fill="none"
                  className="stroke-neutral-300 dark:stroke-neutral-800"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Sub-branch 7a */}
                <path
                  d="M 173,130 C 155,115 145,105 135,102"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Sub-branch 7b */}
                <path
                  d="M 178,110 C 195,95 210,85 220,82"
                  fill="none"
                  className="stroke-neutral-300/80 dark:stroke-neutral-800/80"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Twig 7c */}
                <path
                  d="M 152,110 C 142,102 135,98 125,95"
                  fill="none"
                  className="stroke-neutral-300/60 dark:stroke-neutral-800/60"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Additional Filler Twigs */}
                <path
                  d="M 175,175 C 150,160 140,140 135,120"
                  fill="none"
                  className="stroke-neutral-300/60 dark:stroke-neutral-800/60"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M 180,175 C 210,150 225,130 230,110"
                  fill="none"
                  className="stroke-neutral-300/60 dark:stroke-neutral-800/60"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M 179,295 C 155,285 135,275 125,265"
                  fill="none"
                  className="stroke-neutral-300/60 dark:stroke-neutral-800/60"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 179,295 C 205,275 225,260 235,245"
                  fill="none"
                  className="stroke-neutral-300/60 dark:stroke-neutral-800/60"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 176,215 C 160,230 148,240 140,242"
                  fill="none"
                  className="stroke-neutral-300/50 dark:stroke-neutral-800/50"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M 178,190 C 190,178 202,172 210,168"
                  fill="none"
                  className="stroke-neutral-300/50 dark:stroke-neutral-800/50"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M 185,150 C 195,135 200,125 205,112"
                  fill="none"
                  className="stroke-neutral-300/50 dark:stroke-neutral-800/50"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M 172,145 C 160,132 152,122 148,110"
                  fill="none"
                  className="stroke-neutral-300/50 dark:stroke-neutral-800/50"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Decorative static cherry blossom petal groupings to add lush fullness */}
                {[
                  { cx: 130, cy: 370 }, { cx: 100, cy: 332 }, { cx: 255, cy: 335 },
                  { cx: 285, cy: 282 }, { cx: 95,  cy: 222 }, { cx: 75,  cy: 272 },
                  { cx: 245, cy: 175 }, { cx: 265, cy: 232 }, { cx: 112, cy: 198 },
                  { cx: 108, cy: 130 }, { cx: 255, cy: 125 }, { cx: 300, cy: 172 },
                  { cx: 135, cy: 102 }, { cx: 220, cy: 82 },  { cx: 135, cy: 120 },
                  { cx: 230, cy: 110 }, { cx: 125, cy: 265 }, { cx: 235, cy: 245 },
                  { cx: 115, cy: 365 }, { cx: 250, cy: 345 }, { cx: 82,  cy: 230 },
                  { cx: 258, cy: 185 }, { cx: 95,  cy: 190 }, { cx: 268, cy: 115 },
                  { cx: 125, cy: 95 },  { cx: 140, cy: 242 }, { cx: 210, cy: 168 },
                  { cx: 205, cy: 112 }, { cx: 148, cy: 110 }, { cx: 155, cy: 115 },
                  { cx: 122, cy: 363 }, { cx: 235, cy: 315 }, { cx: 115, cy: 238 },
                ].map((cluster, ci) => (
                  <g key={`cluster-${ci}`} className="opacity-70">
                    <circle
                      cx={cluster.cx}
                      cy={cluster.cy}
                      r="3"
                      className="fill-rose-400/50 dark:fill-orange-400/40"
                    />
                    <circle
                      cx={cluster.cx + 4}
                      cy={cluster.cy - 2}
                      r="2.5"
                      className="fill-rose-300/55 dark:fill-rose-400/40"
                    />
                    <circle
                      cx={cluster.cx - 3}
                      cy={cluster.cy + 3}
                      r="2"
                      className="fill-orange-400/40 dark:fill-rose-300/50"
                    />
                  </g>
                ))}

                {/* Render nodes dynamically */}
                {[
                  { x: 120, y: 350, r: 16, index: 0, labelDir: "left" },
                  { x: 270, y: 310, r: 16, index: 1, labelDir: "right" },
                  { x: 90,  y: 250, r: 16, index: 2, labelDir: "left" },
                  { x: 240, y: 200, r: 16, index: 3, labelDir: "right" },
                  { x: 110, y: 150, r: 16, index: 4, labelDir: "left" },
                  { x: 290, y: 130, r: 16, index: 5, labelDir: "right" },
                  { x: 190, y: 75,  r: 16, index: 6, labelDir: "top" },
                ].map((node) => {
                  const v = BUSHIDO_VIRTUES[node.index];
                  const isSelected = selectedVirtue.romaji === v.romaji;
                  return (
                    <g
                      key={v.romaji}
                      onClick={() => setSelectedVirtue(v)}
                      className="cursor-pointer group"
                    >
                      {/* Pulsing selection aura */}
                      {isSelected && (
                        <motion.circle
                          cx={node.x}
                          cy={node.y}
                          r={node.r + 5}
                          className="stroke-amber-400/50 fill-none"
                          strokeWidth="1.5"
                          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        />
                      )}

                      {/* Outer decorative dotted circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.r + 3}
                        className={`fill-none transition-all duration-300 ${
                          isSelected 
                            ? "stroke-amber-400 stroke-2" 
                            : "stroke-neutral-300/40 dark:stroke-neutral-700/40 group-hover:stroke-amber-400/60"
                        }`}
                        strokeDasharray="3 2"
                      />

                      {/* Golden Blossom Center */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.r}
                        className={`transition-all duration-300 ${
                          isSelected
                            ? "fill-amber-400 stroke-amber-500"
                            : "fill-white dark:fill-black stroke-neutral-300 dark:stroke-neutral-800 group-hover:stroke-amber-400 group-hover:fill-amber-50/10"
                        }`}
                        strokeWidth="1.5"
                      />

                      {/* Kanji character centered inside blossom */}
                      <text
                        x={node.x}
                        y={node.y + 4}
                        textAnchor="middle"
                        className={`font-display font-black select-none pointer-events-none transition-colors duration-300 text-[11px] ${
                          isSelected 
                            ? "fill-neutral-950 font-bold" 
                            : "fill-neutral-700 dark:fill-neutral-300 group-hover:fill-amber-500"
                        }`}
                      >
                        {v.kanji}
                      </text>

                      {/* Romaji text overlay label */}
                      <text
                        x={
                          node.labelDir === "left"
                            ? node.x - node.r - 8
                            : node.labelDir === "right"
                            ? node.x + node.r + 8
                            : node.x
                        }
                        y={
                          node.labelDir === "top"
                            ? node.y - node.r - 8
                            : node.y + 3
                        }
                        textAnchor={
                          node.labelDir === "left"
                            ? "end"
                            : node.labelDir === "right"
                            ? "start"
                            : "middle"
                        }
                        className={`font-mono text-[9px] font-bold uppercase tracking-wider select-none pointer-events-none transition-all ${
                          isSelected
                            ? "fill-amber-500 dark:fill-amber-400"
                            : "fill-neutral-400 dark:fill-neutral-500 group-hover:fill-neutral-600 dark:group-hover:fill-neutral-300"
                        }`}
                      >
                        {v.romaji}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Accessible horizontal backup selectors */}
              <div className="flex flex-wrap justify-center gap-1.5 pt-4 border-t border-neutral-100 dark:border-neutral-900/60">
                {BUSHIDO_VIRTUES.map((v) => {
                  const isSelected = selectedVirtue.romaji === v.romaji;
                  return (
                    <button
                      key={v.romaji}
                      onClick={() => setSelectedVirtue(v)}
                      className={`px-2.5 py-1 text-[8px] font-mono tracking-widest uppercase border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-400 border-amber-400 text-neutral-900"
                          : "bg-white/10 dark:bg-black/10 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100"
                      }`}
                    >
                      {v.romaji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Displaying focused Virtue details */}
            <div className="lg:col-span-6 border border-neutral-200 dark:border-neutral-800 p-8 md:p-12 flex flex-col justify-between relative bg-neutral-50/25 dark:bg-neutral-950/5 overflow-hidden rounded-sm min-h-[360px]">
              {/* Kanji Background watermark */}
              <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 text-[180px] font-display font-black text-neutral-100/70 dark:text-neutral-950/40 pointer-events-none select-none leading-none">
                {selectedVirtue.kanji}
              </div>

              <div className="space-y-6 relative z-10 max-w-lg">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">[ BUSHIDO DIRECTIVE ]</span>
                <div className="space-y-2">
                  <h4 className="font-display text-4xl font-extrabold uppercase tracking-tight text-neutral-900 dark:text-white">
                    {selectedVirtue.romaji}
                  </h4>
                  <p className="text-xs font-mono text-amber-500 dark:text-amber-400 uppercase tracking-widest font-semibold">
                    {selectedVirtue.meaning}
                  </p>
                </div>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed">
                  {selectedVirtue.description}
                </p>
              </div>

              <div className="pt-8 border-t border-neutral-200/50 dark:border-neutral-800/50 relative z-10 flex flex-wrap items-center justify-between text-[10px] font-mono text-neutral-400">
                <span className="uppercase">// INFLUENCE ON CREATION: QUALITY, REFLECTION, SINCERITY</span>
                <span className="uppercase">[ BUSHIDO CODE VALIDATED ]</span>
              </div>
            </div>
          </div>
        </section>



      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black py-10 relative z-10 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center relative z-10">
          <a
            href="https://cybersamurai.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono tracking-widest text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors duration-200 uppercase font-medium hover:underline decoration-1 underline-offset-4"
          >
            Cyber Security - Automation - Assessment
          </a>
        </div>
      </footer>

      {/* 2. Create / Edit Project Modal Drawer */}
      <AnimatePresence>
        {isModalOpen && (
          <ProjectModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveProject}
            projectToEdit={editingProject}
          />
        )}
      </AnimatePresence>

      {/* 3. Admin Passcode Modal Gate */}
      <AnimatePresence>
        {showPasscodeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900/60 dark:bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-md"
            >
              <BambooFrame isFeatured={true}>
                <form onSubmit={handleAdminAuth} className="space-y-6">
                  {/* Decorative crest */}
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                      <Lock className="w-5 h-5 text-neutral-900 dark:text-neutral-100" />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-red-600 dark:text-red-400 uppercase font-bold">// SECURE SHIELD AUTHENTICATION</span>
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
                      Admin Portal
                    </h3>
                  </div>

                  {/* Input fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                        Admin Username
                      </label>
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => {
                          setUsernameInput(e.target.value);
                          setPasscodeError("");
                        }}
                        placeholder="//////"
                        className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm font-mono tracking-wider rounded-xs focus:outline-hidden focus:border-neutral-900 dark:focus:border-white transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                          Enter Password
                        </label>
                      </div>
                      <input
                        type="password"
                        value={passcodeInput}
                        onChange={(e) => {
                          setPasscodeInput(e.target.value);
                          setPasscodeError("");
                        }}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm font-mono tracking-widest rounded-xs focus:outline-hidden focus:border-neutral-900 dark:focus:border-white transition-colors"
                        autoFocus
                      />
                      
                      {/* Error message */}
                      {passcodeError && (
                        <p className="text-[10px] font-mono text-red-600 dark:text-red-400 animate-pulse uppercase tracking-wider">
                          {passcodeError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col space-y-3 pt-2">
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasscodeModal(false);
                          setPasscodeInput("");
                          setPasscodeError("");
                        }}
                        className="flex-1 py-2 text-xs font-mono tracking-widest uppercase border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                      >
                        DISMISS
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 text-xs font-mono font-bold tracking-widest uppercase bg-neutral-900 text-white dark:bg-white dark:text-black border border-neutral-900 dark:border-white hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all cursor-pointer"
                      >
                        AUTHENTICATE
                      </button>
                    </div>
                  </div>
                </form>
              </BambooFrame>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
