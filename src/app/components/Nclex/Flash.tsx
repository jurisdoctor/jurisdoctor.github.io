"use client";
import { ReactNode, useEffect, useState } from "react";

// Cycles through a few labels in place, crossfading, for tiles/headings that
// stand in for more than one source chapter (a combined deck).
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
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 1600);
    return () => clearInterval(id);
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
