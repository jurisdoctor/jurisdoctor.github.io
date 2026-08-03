"use client";
import { useEffect } from "react";

export const SCROLL_TO = "scrollTo";

const ScrollReset = () => {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const target =
      sessionStorage.getItem(SCROLL_TO) || window.location.hash.slice(1);

    if (!target) {
      window.scrollTo(0, 0);
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "instant" });
      sessionStorage.removeItem(SCROLL_TO);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
};

export default ScrollReset;
