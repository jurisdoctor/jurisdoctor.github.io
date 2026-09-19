"use client";
import { ReactNode, useEffect, useRef } from "react";

const calm = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Swap = ({
  token,
  children,
  className,
}: {
  token: string;
  children: ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef(token);

  useEffect(() => {
    if (seen.current === token) return;
    seen.current = token;

    const node = ref.current;
    if (!node || calm()) return;

    // Options are real tap targets mid-flight during this slide-in. A fast
    // touch near an edge can hit-test against the in-between transform and
    // land on the wrong one, so block input until they're settled.
    node.style.pointerEvents = "none";
    const animation = node.animate(
      [
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    animation.finished
      .catch(() => {})
      .finally(() => {
        node.style.pointerEvents = "";
      });

    return () => {
      animation.cancel();
      node.style.pointerEvents = "";
    };
  }, [token]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default Swap;
