"use client";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw) as T;
        if (valid(saved)) setValue(saved);
        else drop(key);
      }
    } catch {
      drop(key);
    }
    setReady(true);
  }, [key, valid]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, ready, value]);

  return [value, setValue] as const;
};
