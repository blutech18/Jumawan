import { create } from 'zustand';
import {
  Code2,
  Server,
  Database,
  Cloud,
  TestTube,
  GitBranch,
  LucideIcon
} from "lucide-react";

export interface SkillCategory {
  title: string;
  icon: LucideIcon;
  color: string;
  skills: string[];
}

interface SkillState {
  skillCategories: SkillCategory[];
}

export const useSkillStore = create<SkillState>(() => ({
  skillCategories: [
    {
      title: "Languages",
      icon: Code2,
      color: "from-sky-400 to-blue-600",
      skills: [
        "HTML/CSS", "JavaScript", "Python", "PHP", 
        "SQL", "TypeScript", "Kotlin"
      ]
    },
    {
      title: "Frameworks & Libraries",
      icon: Server,
      color: "from-blue-600 to-primary",
      skills: [
        "Laravel", "React", "Next.js", "React Native", 
        "Node.js", "Express.js"
      ]
    },
    {
      title: "Tools & Platforms",
      icon: Database,
      color: "from-primary to-accent",
      skills: [
        "Linux", "Git", "Docker", "Node.js", "XAMPP"
      ]
    },
    {
      title: "Deployment & Cloud",
      icon: Cloud,
      color: "from-accent to-sky-300",
      skills: [
        "Vercel", "Netlify", "Railway", "Firebase", "Supabase"
      ]
    },
    {
      title: "Databases",
      icon: TestTube,
      color: "from-sky-300 to-sky-400",
      skills: [
        "MySQL", "PostgreSQL", "Firebase", "Supabase"
      ]
    },
    {
      title: "Version Control",
      icon: GitBranch,
      color: "from-navy-700 to-navy-800",
      skills: [
        "Git", "GitHub", "GitLab"
      ]
    }
  ]
}));
