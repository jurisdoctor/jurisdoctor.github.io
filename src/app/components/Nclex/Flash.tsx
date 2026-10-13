"use client";
import { useEffect, useState } from "react";
import TypedText from "../Typed/TypedText";

// Cycles through a few labels in place (TypedText blurs and fades one out as the
// next blurs and fades in over it), for tiles/headings that stand in for more than
// one source chapter (a combined deck). The label shown comes from the clock,
// not from when each one mounted, so every Flash on the page (a tile and the
// heading under it) always shows the same position.
const STEP = 2500;
const slotNow = () => Math.floor(Date.now() / STEP);

const Flash = ({
  items,
  className,
}: {
  items: string[];
  className?: string;
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

  return (
    <TypedText
      inline
      nowrap
      text={items[index]}
      reserve={items}
      className={className}
    />
  );
};

export default Flash;
