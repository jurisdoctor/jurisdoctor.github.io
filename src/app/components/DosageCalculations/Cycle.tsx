"use client";
import { ReactNode, useEffect, useState } from "react";

const HOLD = 2600;

const Cycle = ({
  options,
  className = "",
}: {
  options: ReactNode[];
  className?: string;
}) => {
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (options.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(
      () => setAt((prev) => (prev + 1) % options.length),
      HOLD,
    );

    return () => window.clearInterval(timer);
  }, [options.length]);

  if (options.length < 2) return <>{options[0]}</>;

  return (
    <span className={`grid ${className}`}>
      {options.map((option, id) => (
        <span
          key={id}
          aria-hidden={id !== at}
          className={`col-start-1 row-start-1 flex items-center ${
            id === at ? "animate-fadeIn" : "opacity-0"
          }`}
        >
          {option}
        </span>
      ))}
    </span>
  );
};

export default Cycle;
