"use client";
import { useId } from "react";
import { flameStops } from "./FlamePalette";

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
// `hue` picks the chapter's flame color (see FlamePalette); without one it's
// the original red-to-yellow ember. `edge` is the width of the tile's own
// border, if it has one: the ring is drawn along the middle of that border, so
// the glow sits on it, not floating inside it.
const Glow = ({
  label,
  hue,
  edge = 0,
}: {
  label: string;
  hue?: number;
  edge?: number;
}) => {
  const inset = edge ? edge / 2 : 1;
  const radius = 6 - inset;
  const uid = useId();
  const filterId = `${uid}-blur`;
  const gradientId = `${uid}-flame`;
  return (
    <svg
      aria-label={label}
      className="pointer-events-none absolute overflow-visible"
      style={{
        left: -edge,
        top: -edge,
        width: `calc(100% + ${edge * 2}px)`,
        height: `calc(100% + ${edge * 2}px)`,
      }}
    >
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
          gradientUnits="objectBoundingBox"
        >
          <animateTransform
            attributeName="gradientTransform"
            type="rotate"
            from="0 0.5 0.5"
            to="360 0.5 0.5"
            dur="2.8s"
            repeatCount="indefinite"
          />
          {flameStops(hue ?? 28, hue === undefined ? 1 : 0.25).map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={stop.color}
            />
          ))}
        </linearGradient>
      </defs>
      <rect
        x={inset}
        y={inset}
        width={`calc(100% - ${inset * 2}px)`}
        height={`calc(100% - ${inset * 2}px)`}
        rx={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
        pathLength={100}
        className="glow-flicker"
        filter={`url(#${filterId})`}
        opacity={0.9}
      />
      <rect
        x={inset}
        y={inset}
        width={`calc(100% - ${inset * 2}px)`}
        height={`calc(100% - ${inset * 2}px)`}
        rx={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        pathLength={100}
        className="glow-flicker"
        style={{ animationDelay: "-0.35s" }}
      />
    </svg>
  );
};

export default Glow;
