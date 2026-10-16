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

    node.style.pointerEvents = "none";
    const animation = node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 250,
      easing: "ease-out",
    });
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
