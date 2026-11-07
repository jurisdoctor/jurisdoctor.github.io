"use client";

import { PiMoon, PiSun } from "react-icons/pi";

// Dark is the default (see globals.css's base :root), so "light" is the
// only state that needs an attribute at all, and the early script in the
// layout sets it before first paint. Both icons are always rendered and CSS
// shows the right one, so the toggle is there from the first frame and never
// shifts the sidebar when the page hydrates.
const ThemeToggle = () => {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    if (next === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark mode"
      className="text-xl text-[var(--title-color)] duration-300 hover:text-[var(--accent-color)]"
    >
      <PiSun className="theme-sun" />
      <PiMoon className="theme-moon" />
    </button>
  );
};

export default ThemeToggle;
