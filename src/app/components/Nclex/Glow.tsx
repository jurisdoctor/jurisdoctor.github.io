"use client";
import { RefObject, useEffect, useId, useRef, useState } from "react";
import { flameStops } from "./FlamePalette";

// One shared IntersectionObserver for every Glow on the page, instead of one
// observer per tile — the New section alone can have 200+ of them.
type Listener = (visible: boolean) => void;
const listeners = new WeakMap<Element, Listener>();
let observer: IntersectionObserver | null = null;

const watch = (element: Element, listener: Listener) => {
  if (typeof IntersectionObserver === "undefined") {
    listener(true);
    return () => {};
  }
  observer ??= new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) =>
        listeners.get(entry.target)?.(entry.isIntersecting),
      ),
    // Start a little before a tile scrolls into view, so its flame is
    // already moving by the time it arrives.
    { rootMargin: "120px" },
  );
  listeners.set(element, listener);
  observer.observe(element);
  return () => {
    observer?.unobserve(element);
    listeners.delete(element);
  };
};

const useVisible = (ref: RefObject<Element>) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return watch(element, setVisible);
  }, [ref]);
  return visible;
};

const useMedia = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);
  return matches;
};

// A ring of fire along the tile's own border, sling-ring style, for flagging
// new questions. An SVG rect (not a rotating conic-gradient) so it hugs the
// actual rounded-rectangle shape regardless of the tile's aspect ratio. The
// stroke is solid (no dash pattern) — the fire instead comes from a
// hot-to-ember gradient whose angle keeps rotating via <animateTransform>,
// so the brightest point sweeps around the whole ring rather than sitting
// fixed in one corner. Every instance gets its own filter/gradient ids —
// with dozens of these on screen at once, a shared id meant only the first
// tile ever resolved correctly and the rest looked flat, which read as
// "inconsistent".
//
// Cost control, since a fresh drop can put 200+ of these on one screen:
// only rings near the viewport animate (the rest hold a still, full-color
// ring), and on small screens the blurred halo — the expensive part, one
// filter per tile — becomes a plain translucent wider stroke instead.
// Reduced-motion users get the still ring everywhere.
const Glow = ({ label, hue = 28 }: { label: string; hue?: number }) => {
  const uid = useId();
  const filterId = `${uid}-blur`;
  const gradientId = `${uid}-flame`;
  const ref = useRef<SVGSVGElement>(null);
  const visible = useVisible(ref);
  const calm = useMedia("(prefers-reduced-motion: reduce)");
  const compact = useMedia("(max-width: 767px)");
  const live = visible && !calm;
  const blurred = live && !compact;

  return (
    <svg
      ref={ref}
      aria-label={label}
      className="pointer-events-none absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)] overflow-visible"
    >
      <defs>
        {blurred && (
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        )}
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
          gradientUnits="objectBoundingBox"
        >
          {live && (
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              from="0 0.5 0.5"
              to="360 0.5 0.5"
              dur="2.8s"
              repeatCount="indefinite"
            />
          )}
          {flameStops(hue).map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={stop.color}
            />
          ))}
        </linearGradient>
      </defs>
      <rect
        x="5"
        y="5"
        width="calc(100% - 10px)"
        height="calc(100% - 10px)"
        rx="9"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={compact ? 6 : 4}
        strokeLinecap="round"
        pathLength={100}
        className={live ? "glow-flicker" : undefined}
        filter={blurred ? `url(#${filterId})` : undefined}
        opacity={compact ? 0.35 : 0.9}
      />
      <rect
        x="5"
        y="5"
        width="calc(100% - 10px)"
        height="calc(100% - 10px)"
        rx="9"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        pathLength={100}
        className={live ? "glow-flicker" : undefined}
        style={live ? { animationDelay: "-0.35s" } : undefined}
      />
    </svg>
  );
};

export default Glow;
