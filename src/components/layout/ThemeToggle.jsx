import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <button
      type="button"
      onClick={() => setDarkMode((value) => !value)}
      aria-label="Toggle dark mode"
      className="rounded-lg p-2 text-slate-900 transition hover:bg-slate-100 hover:text-blue-600 dark:text-white dark:hover:bg-slate-900"
    >
      {darkMode ? (
        <Sun size={21} className="text-amber-400" />
      ) : (
        <Moon size={21} />
      )}
    </button>
  );
}
