export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tech: string[];
  demoUrl: string;
  codeUrl: string;
  badge: "SAMURAI" | "SHINOBI" | "SHOGUN" | "RONIN" | "SABER";
  role: string;
  featured: boolean;
  date: string;
  image?: string;
}

export interface ZenQuote {
  text: string;
  author: string;
}
