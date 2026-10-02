"use client";

import { ElementType, ReactNode, useEffect, useRef, useState } from "react";

// Fades and slides an element in the moment it enters the viewport, the way
// Squarespace sections animate on scroll — once per element, via
// IntersectionObserver rather than a scroll listener. Elements already in
// view on mount (e.g. the hero) reveal almost immediately, which gives Home
// the same staggered entrance for free.
const Reveal = ({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  [key: string]: unknown;
}) => {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
      className={`transition-[opacity,transform] duration-700 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
