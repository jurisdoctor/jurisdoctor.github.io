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

    const animation = node.animate(
      [
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );

    return () => animation.cancel();
  }, [token]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default Swap;
