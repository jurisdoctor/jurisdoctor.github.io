"use client";

import { useEffect, useState } from "react";
import { LuMoon, LuSun } from "react-icons/lu";

type Theme = "light" | "dark";

// Dark is the default (see globals.css's base :root), so "light" is the
// only state that needs an attribute at all — toggling back to dark just
// removes it rather than writing a redundant "dark" value.
const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(localStorage.getItem("theme") === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  if (!theme) return <span className="block h-5 w-5" aria-hidden />;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="text-xl text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
    >
      {theme === "dark" ? <LuSun /> : <LuMoon />}
    </button>
  );
};

export default ThemeToggle;
