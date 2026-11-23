"use client";
import { useEffect, useState } from "react";

const STEP = 2500;
const slotNow = () => Math.floor(Date.now() / STEP);

// Cycles through chapter numbers for a topic built from several chapters.
// One number is in the DOM at a time (no overlap/garble). It sits in a plain
// inline-block sized to the widest value with tabular figures, so the glyph
// keeps the normal text baseline (never clipped) and the surrounding text
// never shifts. Each change flashes in with a simple opacity fade.
const Flash = ({
  items,
  className,
  fluid = false,
}: {
  items: string[];
  className?: string;
  fluid?: boolean;
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setIndex(slotNow() % items.length);
      timer = setTimeout(tick, STEP - (Date.now() % STEP));
    };
    tick();
    return () => clearTimeout(timer);
  }, [items.length]);

  if (items.length < 2) return <>{items[0]}</>;

  if (fluid) {
    return (
      <span key={index} className={`flash-num ${className ?? ""}`}>
        {items[index]}
      </span>
    );
  }

  const widest = items.reduce((a, b) => Math.max(a, b.length), 0);

  return (
    <span
      className={`inline-block text-center tabular-nums ${className ?? ""}`}
      style={{ minWidth: `${widest}ch` }}
    >
      <span key={index} className="flash-num">
        {items[index]}
      </span>
    </span>
  );
};

export default Flash;
