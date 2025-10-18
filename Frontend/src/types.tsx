export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface SkillCard {
  id: string;
  skill: string;
  description: string;
  image: string;
  tags?: string[];
  level?: Level;
}

export interface SkillCategory {
  key: string;      // e.g., "programming"
  title: string;    // e.g., "Programming Languages"
  cards: SkillCard[];
}

