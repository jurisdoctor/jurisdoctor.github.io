"use client";
import { ReactNode, useEffect, useRef } from "react";

const SETTLE = 40;

const Reflow = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const running = new WeakMap<Element, Animation>();
    let previous = new Map<Element, DOMRect>();

    const record = () => {
      previous = new Map(
        Array.from(grid.children).map((child) => [
          child,
          child.getBoundingClientRect(),
        ]),
      );
    };

    const play = () => {
      for (const child of Array.from(grid.children)) {
        const from = previous.get(child);
        if (!from) continue;

        const to = child.getBoundingClientRect();
        const dx = from.left - to.left;
        const dy = from.top - to.top;
        if (Math.abs(dy) < SETTLE) continue;

        running.get(child)?.cancel();
        running.set(
          child,
          child.animate(
            [
              { transform: `translate(${dx}px, ${dy}px)` },
              { transform: "translate(0, 0)" },
            ],
            { duration: 420, easing: "ease-in-out" },
          ),
        );
      }
      record();
    };

    record();
    const observer = new ResizeObserver(play);
    observer.observe(grid);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default Reflow;
