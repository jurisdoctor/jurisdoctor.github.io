"use client";

import { PiPause, PiSparkle } from "react-icons/pi";

// Flips the saved choice for the lava lamp and floating shapes and reloads so
// both start from a clean state. Both icons are always rendered and CSS shows
// the right one, so the sidebar never shifts.
const MotionToggle = () => {
  const toggle = () => {
    const off = document.documentElement.classList.contains("no-bg-motion");
    try {
      if (off) localStorage.removeItem("bg-motion");
      else localStorage.setItem("bg-motion", "off");
    } catch {}
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Turn the lava lamp and floating shapes on or off"
      title="Turn the lava lamp and floating shapes on or off"
      className="text-xl text-[var(--title-color)] duration-300 hover:text-[var(--accent-color)]"
    >
      <PiSparkle className="motion-on" />
      <PiPause className="motion-off" />
    </button>
  );
};

export default MotionToggle;
