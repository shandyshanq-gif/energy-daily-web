"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return null;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = getStoredTheme();
    const initial = stored ?? getSystemTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const stored = getStoredTheme();
      if (!stored) {
        const sys = getSystemTheme();
        setTheme(sys);
        applyTheme(sys);
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mounted]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("theme", next);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label="切换主题"
        disabled
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "切换到深色模式" : "切换到浅色模式"}
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}