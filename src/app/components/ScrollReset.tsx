"use client";

import { useEffect } from "react";

const ScrollReset = () => {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return null;
};

export default ScrollReset;
