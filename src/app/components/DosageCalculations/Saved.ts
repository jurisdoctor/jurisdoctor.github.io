"use client";
import { useEffect, useRef, useState } from "react";

const drop = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch {}
};

export const useSaved = <T>(
  key: string,
  fresh: () => T,
  valid: (saved: T) => boolean,
) => {
  const [value, setValue] = useState<T>(fresh);
  const [ready, setReady] = useState(false);
  // Callers pass `valid` inline, so it is a new function on every render. Keep
  // it in a ref: listing it as a dependency re-ran the read below after each
  // change, and the read put the older stored value back over the new one
  // before the write could land, so the value flipped back and forth for good.
  const validRef = useRef(valid);
  validRef.current = valid;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw) as T;
        if (validRef.current(saved)) setValue(saved);
        else drop(key);
      }
    } catch {
      drop(key);
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, ready, value]);

  return [value, setValue, ready] as const;
};
