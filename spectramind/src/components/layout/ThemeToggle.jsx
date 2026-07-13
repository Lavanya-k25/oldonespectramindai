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
      aria-label="Toggle appearance"
      className="rounded-lg border border-transparent p-2 text-slate-700 transition hover:border-blue-600/20 hover:bg-white/60 hover:text-blue-700"
    >
      {darkMode ? (
        <Sun size={21} className="text-blue-600" />
      ) : (
        <Moon size={21} />
      )}
    </button>
  );
}
