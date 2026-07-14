export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tech: string[];
  demoUrl: string;
  codeUrl: string;
  badge: "Blue team" | "Red team" | "Training" | "Games";
  role: string;
  featured: boolean;
  date: string;
  image?: string;
}

export interface ZenQuote {
  text: string;
  author: string;
}

export interface UserDoc {
  id: string; // This can be the username or UID
  username: string;
  email: string;
  role: "admin" | "viewer";
  isAdmin: boolean;
  createdAt?: string;
}
