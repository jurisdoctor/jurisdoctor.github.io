"use client";
import { useEffect } from "react";

const MAX_TILT = 5;
const LIFT = 0.02;
const REFERENCE = 320;

// Letting go only drops the attribute: the card eases back to no transform,
// and the last angles stay set so there is nothing to snap.
const rest = (el: HTMLElement) => el.removeAttribute("data-tilting");

const TiltEffect = () => {
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current: HTMLElement | null = null;

    const release = () => {
      if (current) rest(current);
      current = null;
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || calm.matches) return;
      const card =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-tilt]")
          : null;
      if (current && current !== card) release();
      if (!card) return;
      current = card;
      const box = card.getBoundingClientRect();
      const across = (event.clientX - box.left) / box.width;
      const down = (event.clientY - box.top) / box.height;
      const scale = Math.max(
        0.3,
        Math.min(1, REFERENCE / Math.max(box.width, box.height)),
      );
      card.style.setProperty(
        "--tilt-y",
        `${((across - 0.5) * 2 * MAX_TILT * scale).toFixed(2)}deg`,
      );
      card.style.setProperty(
        "--tilt-x",
        `${((0.5 - down) * 2 * MAX_TILT * scale).toFixed(2)}deg`,
      );
      card.style.setProperty("--tilt-s", String(1 + LIFT * scale));
      card.setAttribute("data-tilting", "");
    };

    const out = (event: PointerEvent) => {
      if (!event.relatedTarget) release();
    };

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", out);
    window.addEventListener("blur", release);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", out);
      window.removeEventListener("blur", release);
    };
  }, []);

  return null;
};

export default TiltEffect;
