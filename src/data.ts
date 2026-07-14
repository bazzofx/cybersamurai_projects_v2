import { Project, ZenQuote } from "./types";

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "katana-js",
    title: "Katana.js",
    description: "A high-performance, physics-based 2D Canvas animation library for creating hyper-responsive slice and slash visual effects. Optimized for 120 FPS on high-refresh displays with hardware-accelerated drawing pipelines.",
    category: "Graphics Engine",
    tech: ["TypeScript", "HTML5 Canvas", "WebGL", "MathUtils"],
    demoUrl: "https://example.com/katana-demo",
    codeUrl: "https://github.com/samurai/katana-js",
    badge: "Games",
    role: "Lead Architect",
    featured: true,
    date: "Spring 1582"
  },
  {
    id: "bamboo-db",
    title: "BambooDB",
    description: "A lightweight, resilient key-value store designed for embedded edge runtimes. Features self-healing, append-only commit logs, and an in-memory segment tree structure with near-zero latency, compiled to WebAssembly.",
    category: "Database",
    tech: ["Rust", "WebAssembly", "IndexedDB", "Serde"],
    demoUrl: "https://example.com/bamboo-db",
    codeUrl: "https://github.com/samurai/bamboo-db",
    badge: "Training",
    role: "Solo Creator",
    featured: false,
    date: "Autumn 1585"
  },
  {
    id: "sumie-studio",
    title: "Sumi-e Studio",
    description: "An interactive, touch-sensitive simulation of traditional Japanese ink wash painting. Uses bezier-spline brush stroke modeling and fluid-dynamics equations to emulate organic charcoal diffusion on washi paper.",
    category: "Creative Tools",
    tech: ["React", "CSS Variables", "Tailwind CSS", "Motion"],
    demoUrl: "https://example.com/sumie-studio",
    codeUrl: "https://github.com/samurai/sumie-studio",
    badge: "Blue team",
    role: "Lead UI Artist",
    featured: false,
    date: "Winter 1588"
  },
  {
    id: "ronin-guard",
    title: "RoninGuard",
    description: "An offline-first, decentralized authentication protocol built with public-key cryptography. Secures client sessions in local state sandboxes using elliptic-curve signatures, eliminating centralized user directory attack vectors.",
    category: "Cybersecurity",
    tech: ["WebCrypto API", "LocalStore", "TypeScript", "ECC"],
    demoUrl: "https://example.com/ronin-guard",
    codeUrl: "https://github.com/samurai/roningard",
    badge: "Red team",
    role: "Security Engineer",
    featured: false,
    date: "Summer 1590"
  }
];

export const BUSHIDO_QUOTES: ZenQuote[] = [
  {
    text: "The supreme art of war is to subdue the enemy without fighting.",
    author: "Sun Tzu"
  },
  {
    text: "There is nothing outside of yourself that can ever enable you to get better, stronger, richer, quicker, or smarter. Everything is within. Everything exists.",
    author: "Miyamoto Musashi"
  },
  {
    text: "The path that is the wind, the blade that is the mind. A samurai has no fear, only continuous refinement.",
    author: "Hagakure Codex"
  },
  {
    text: "Master the mind, and the sword becomes an extension of your soul. Simplicity is the ultimate sophistication.",
    author: "Zen Proverb"
  },
  {
    text: "When you slice through code, do it with one clean stroke. Do not write a thousand lines where ten can stand tall.",
    author: "The Craft of the Ronin"
  },
  {
    text: "Honor is not in the praise of others, but in the precision of your own execution.",
    author: "Bushido Virtue"
  }
];

export const BUSHIDO_VIRTUES = [
  { kanji: "義", romaji: "Gi", meaning: "Rectitude & Justice", description: "Be acutely honest in your dealings with all people. Believe in justice, not from other people, but from yourself." },
  { kanji: "勇", romaji: "Yu", meaning: "Heroic Courage", description: "Rise up above the masses that fear to act. Hiding in a shell like a turtle is not living at all." },
  { kanji: "仁", romaji: "Jin", meaning: "Benevolence & Compassion", description: "Through intense training and discipline the samurai becomes quick and strong. They must use this power for good." },
  { kanji: "礼", romaji: "Rei", meaning: "Polite Respect", description: "Samurai have no reason to be cruel. They do not need to prove their strength. Courtesy is the mark of strength." },
  { kanji: "誠", romaji: "Makoto", meaning: "Honesty & Sincerity", description: "When a samurai has said they will perform an action, it is as good as done. Speaking and doing are the same action." },
  { kanji: "名", romaji: "Meiyo", meaning: "Honor", description: "The only judge of a samurai's honor is themselves. Decisions you make and how these decisions are carried out are a reflection of who you truly are." },
  { kanji: "忠", romaji: "Chugi", meaning: "Duty & Loyalty", description: "To those they are responsible for, they remain fiercely true. In code, stay true to the craft and clean design." }
];
