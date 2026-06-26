import { Project, ZenQuote } from "./types";

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "cyber-siege",
    title: "CyberSiege",
    description: "A real-time, gamified cyber warfare simulation platform designed to stress-test enterprise networks. Integrates live packet parsing with an interactive 3D tactical map, allowing security operations teams to visualize and defend mock infrastructure against automated red-team attacks.",
    category: "Defense Platform",
    tech: ["React", "Motion", "Three.js", "WebSockets", "Go"],
    demoUrl: "https://cybersiege.cybersamurai.com",
    codeUrl: "https://github.com/cybersamurai/cyber-siege",
    badge: "Automation",
    role: "Lead Security Architect",
    featured: true,
    date: "Spring 1600",
    image: "/portfolio/cybersiege_hero.png"
  },
  {
    id: "bug-witcher",
    title: "BugWitcher",
    description: "An automated smart contract vulnerability scanner that hunts down protocol bugs like a witcher tracking beasts. Employs symbolic execution, custom LLVM mutation analysis, and automated fuzzing techniques to audit Web3 and EVM bytecode for critical vulnerabilities.",
    category: "Security Auditing",
    tech: ["Rust", "WebAssembly", "LLVM", "EVM", "Clang"],
    demoUrl: "https://bugwitcher.cybersamurai.com",
    codeUrl: "https://github.com/cybersamurai/bugwitcher",
    badge: "Blue Team",
    role: "Solo Protocol Researcher",
    featured: true,
    date: "Autumn 1599",
    image: "/portfolio/bugwitcher_hero.png"
  },
  {
    id: "phishing-trainer",
    title: "PhishTrainer",
    description: "An interactive security awareness simulation platform that trains enterprise staff to detect sophisticated social engineering and spear-phishing attempts. Features customizable mock templates, automated landing page generation, and real-time failure telemetry reporting.",
    category: "SecOps Education",
    tech: ["React", "Express", "PostgreSQL", "Tailwind CSS", "D3.js"],
    demoUrl: "https://phish-trainer.cybersamurai.com",
    codeUrl: "https://github.com/cybersamurai/phish-trainer",
    badge: "Red Team",
    role: "Lead UI Artist",
    featured: true,
    date: "Summer 1601",
    image: "/portfolio/phishing_training_hero.png"
  },
  {
    id: "port-hunter",
    title: "PortHunter",
    description: "A high-speed, multi-threaded port scanner and vulnerability mapper designed for tactical network discovery. Employs SYN stealth scanning techniques, service banner grabbing, and custom exploit-matching signatures to identify exposed services in seconds.",
    category: "Network Utility",
    tech: ["Go", "React", "TypeScript", "Tailwind CSS", "gRPC"],
    demoUrl: "https://porthunter.cybersamurai.com",
    codeUrl: "https://github.com/cybersamurai/porthunter",
    badge: "Architecture",
    role: "Network Engineer",
    featured: false,
    date: "Winter 1598",
    image: "/portfolio/porthunter_hero.png"
  },
  {
    id: "cyber-terminal",
    title: "CyberTerminal",
    description: "A customizable web-based terminal emulator styled with a sleek retro-futurism cyberpunk palette. Features command history persistence, multi-tab sandboxed shell sessions, interactive directory explorer, and custom style themes.",
    category: "Developer Tools",
    tech: ["React", "Xterm.js", "TypeScript", "Node.js", "Tailwind CSS"],
    demoUrl: "https://terminal.cybersamurai.com",
    codeUrl: "https://github.com/cybersamurai/cyber-terminal",
    badge: "Cyber Games",
    role: "Terminal Artisan",
    featured: false,
    date: "Spring 1603",
    image: "/portfolio/terminal_hero.png"
  },
  {
    id: "type-to-patch",
    title: "TypeToPatch",
    description: "An educational speed-typing game designed for software developers. Players write clean code patches under intense pressure to repair failing system nodes and defend a mainframe against rogue virus nodes before time limits expire.",
    category: "Game Development",
    tech: ["React", "Tailwind CSS", "TypeScript", "Canvas API", "AudioSynth"],
    demoUrl: "https://typetopatch.cybersamurai.com",
    codeUrl: "https://github.com/cybersamurai/type-to-patch",
    badge: "Architecture",
    role: "Creative Director",
    featured: false,
    date: "Summer 1604",
    image: "/portfolio/typeToPatch_hero.png"
  },
  {
    id: "xheaders",
    title: "xheaders.com",
    description: "A simple, ultra-fast web tool that inspects HTTP headers for security posture compliance. Analyzes Content-Security-Policy (CSP), CORS, HSTS, and X-Content-Type-Options, providing developer-friendly recommendations for securing web endpoints.",
    category: "Security Analysis",
    tech: ["Next.js", "Tailwind CSS", "TypeScript", "OpenAPI", "Vercel"],
    demoUrl: "https://xheaders.com",
    codeUrl: "https://github.com/cybersamurai/xheaders",
    badge: "Blue Team",
    role: "Solo Developer",
    featured: false,
    date: "Autumn 1603",
    image: "/portfolio/xheders_hero.png"
  },
  {
    id: "girasol-social",
    title: "Girasol Social",
    description: "A lightweight, privacy-first microblogging platform designed for decentralized community clusters. Features localized content federation, zero third-party tracking, and custom theme layouts with fluid visual styling inspired by organic patterns.",
    category: "Social Protocol",
    tech: ["TypeScript", "React", "GraphQL", "PostgreSQL", "Tailwind CSS"],
    demoUrl: "https://girasol.cybersamurai.com",
    codeUrl: "https://github.com/cybersamurai/girasol-social",
    badge: "Cyber Games",
    role: "Frontend Creator",
    featured: false,
    date: "Winter 1602",
    image: "/portfolio/girasol_hero.png"
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
