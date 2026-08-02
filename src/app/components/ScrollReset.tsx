"use client";

import { useEffect } from "react";

const ScrollReset = () => {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // arriving at a section link (e.g. /#about) — let the hash win
    if (window.location.hash) {
      document
        .getElementById(window.location.hash.slice(1))
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    window.scrollTo(0, 0);
  }, []);

  return null;
};

export default ScrollReset;
