import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("portfolio-theme");
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    set({ theme: next });
    applyTheme(next);
  },
  setTheme: (theme) => {
    set({ theme });
    applyTheme(theme);
  },
}));

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  localStorage.setItem("portfolio-theme", theme);
}

// Apply on load
if (typeof window !== "undefined") {
  applyTheme(getInitialTheme());
}
