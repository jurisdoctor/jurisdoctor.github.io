"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import TypedText from "../Typed/TypedText";

const HOLD = 2600;
// Typed values stay up a little longer: the typing itself takes about a second.
const HOLD_TYPED = 3600;

// Where the values are plain text, each is typed in by TypedText (the one text
// transition used across the site), and the line keeps the width of the
// longest value so nothing around it shifts.
const Typed = ({
  options,
  className,
}: {
  options: string[];
  className: string;
}) => {
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (options.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setAt((prev) => (prev + 1) % options.length),
      HOLD_TYPED,
    );
    return () => window.clearInterval(timer);
  }, [options.length]);

  return (
    <TypedText
      text={options[at]}
      reserve={options}
      nowrap
      className={className}
    />
  );
};

const Cycle = ({
  options,
  className = "",
}: {
  options: ReactNode[];
  className?: string;
}) => {
  const [at, setAt] = useState(0);
  // The one that just left, so it lifts away while the next rises in from
  // below, instead of the two swapping with a jump.
  const left = useRef(-1);
  const plain = options.every((option) => typeof option === "string");

  useEffect(() => {
    if (plain || options.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(
      () =>
        setAt((prev) => {
          left.current = prev;
          return (prev + 1) % options.length;
        }),
      HOLD,
    );

    return () => window.clearInterval(timer);
  }, [options.length, plain]);

  if (options.length < 2) return <>{options[0]}</>;
  if (plain)
    return <Typed options={options as string[]} className={className} />;

  return (
    <span className={`grid ${className}`}>
      {options.map((option, id) => (
        <span
          key={id}
          aria-hidden={id !== at}
          className={`col-start-1 row-start-1 flex items-center duration-500 ease-out motion-reduce:transition-none ${
            id === at
              ? "opacity-100 delay-200"
              : id === left.current
                ? "-translate-y-2 opacity-0 blur-[4px]"
                : "translate-y-2 opacity-0 blur-[4px]"
          }`}
        >
          {option}
        </span>
      ))}
    </span>
  );
};

export default Cycle;
