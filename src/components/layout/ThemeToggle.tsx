"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("theme") === "dark";
}

function getServerSnapshot(): boolean {
  return false;
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      window.dispatchEvent(new Event("storage"));
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <button
      onClick={toggleTheme}
      id="theme-toggle-button"
      aria-label="Ganti mode gelap/terang"
      className="text-white hover:text-amber-300 transition-colors p-1 flex items-center justify-center cursor-pointer focus:outline-none"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-300 stroke-[2]" />
      ) : (
        <Moon className="w-5 h-5 text-white stroke-[2]" />
      )}
    </button>
  );
}
