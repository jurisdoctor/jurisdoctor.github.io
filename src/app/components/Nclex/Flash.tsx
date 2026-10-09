"use client";
import { ReactNode, useEffect, useState } from "react";

// Cycles through a few labels in place, crossfading, for tiles/headings that
// stand in for more than one source chapter (a combined deck). The label shown
// comes from the clock, not from when each one mounted, so every Flash on the
// page (a tile and the heading under it) always shows the same position.
const STEP = 1600;
const slotNow = () => Math.floor(Date.now() / STEP);

const Flash = ({
  items,
  className,
}: {
  items: ReactNode[];
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
    <span className={`relative inline-grid ${className ?? ""}`}>
      {items.map((item, itemIndex) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={itemIndex}
          className={`col-start-1 row-start-1 transition duration-[900ms] ease-in-out ${
            itemIndex === index
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0"
          }`}
        >
          {item}
        </span>
      ))}
    </span>
  );
};

export default Flash;
