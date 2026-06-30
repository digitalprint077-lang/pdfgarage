import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface ThemeContextValue {
  darkMode: boolean;
  toggleDark: () => void;
}

const STORAGE_KEY = "pdfgarage-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light") return false;
    if (saved === "dark") return true;
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem(STORAGE_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark: () => setDarkMode((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
