"use client";
import { useEffect, useState } from "react";

const STEP = 2500;
const slotNow = () => Math.floor(Date.now() / STEP);

// Cycles through chapter numbers for a topic built from several chapters.
// Only one value is visible at a time (no overlap/garble). All of them share
// one grid cell, so the box is exactly as wide as the widest value, the glyph
// keeps the normal text baseline and the surrounding text never shifts. Each
// change flashes in with a simple opacity fade.
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

  return (
    <span
      className={`inline-grid justify-items-center tabular-nums ${className ?? ""}`}
    >
      {items.map((item, at) => (
        <span
          key={`${at}-${at === index}`}
          aria-hidden={at !== index}
          className={`col-start-1 row-start-1 whitespace-nowrap ${
            at === index ? "flash-num" : "invisible"
          }`}
        >
          {item}
        </span>
      ))}
    </span>
  );
};

export default Flash;
