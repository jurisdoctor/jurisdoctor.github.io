"use client";

import { CSSProperties, useEffect, useState } from "react";
import LavaCanvas, { LavaStart } from "./LavaCanvas";

interface Blob {
  color: string;
  size: number;
  top: string;
  left: string;
  duration: string;
  delay: string;
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  x3: string;
  y3: string;
}

const BLOBS: Blob[] = [
  {
    color: "#00D47F",
    size: 360,
    top: "-6%",
    left: "-4%",
    duration: "32s",
    delay: "-2s",
    x1: "14vw",
    y1: "10vh",
    x2: "6vw",
    y2: "22vh",
    x3: "-6vw",
    y3: "8vh",
  },
  {
    color: "#C9B5FF",
    size: 380,
    top: "2%",
    left: "70%",
    duration: "38s",
    delay: "-14s",
    x1: "-12vw",
    y1: "14vh",
    x2: "-20vw",
    y2: "2vh",
    x3: "-8vw",
    y3: "-8vh",
  },
  {
    color: "#FFF0B5",
    size: 340,
    top: "52%",
    left: "6%",
    duration: "35s",
    delay: "-21s",
    x1: "16vw",
    y1: "-10vh",
    x2: "10vw",
    y2: "-20vh",
    x3: "-4vw",
    y3: "-6vh",
  },
  {
    color: "#91FF00",
    size: 320,
    top: "66%",
    left: "76%",
    duration: "42s",
    delay: "-7s",
    x1: "-10vw",
    y1: "-12vh",
    x2: "-18vw",
    y2: "-4vh",
    x3: "-6vw",
    y3: "10vh",
  },
  {
    color: "#3b6f85",
    size: 300,
    top: "30%",
    left: "40%",
    duration: "46s",
    delay: "-31s",
    x1: "10vw",
    y1: "16vh",
    x2: "-10vw",
    y2: "14vh",
    x3: "-12vw",
    y3: "-10vh",
  },
];

// Fixed to the viewport (not the page), so it drifts continuously behind
// every route without remounting — RootLayout renders this once and the
// App Router's shared layout keeps it mounted across client-side navigation.
// Where each blob begins is rolled fresh on every visit: how far along its
// drift it already is, and a small nudge off its usual spot. Done in the
// browser once the page is up (so the server's page and the browser's agree),
// with the lamp faded in afterwards rather than showing a first guess.
const roll = (): LavaStart[] =>
  BLOBS.map(() => ({
    phase: Math.random(),
    jx: (Math.random() - 0.5) * 14,
    jy: (Math.random() - 0.5) * 14,
  }));

const LavaBackground = () => {
  const [starts, setStarts] = useState<LavaStart[] | null>(null);
  useEffect(() => setStarts(roll()), []);
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [transform:translateZ(0)]"
      aria-hidden
    >
      <svg className="absolute h-0 w-0">
        <filter
          id="lava-goo-filter"
          x="-30%"
          y="-20%"
          width="160%"
          height="140%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
          />
        </filter>
      </svg>

      <div className="absolute inset-0 [mix-blend-mode:var(--lava-blend)] [transform:translateZ(0)]">
        <div
          className="lava-goo absolute inset-0 duration-1000"
          style={{ opacity: starts ? "var(--lava-opacity)" : 0 }}
        >
          {BLOBS.map((blob, index) => (
            <span
              key={index}
              className="lava-blob absolute rounded-full"
              style={
                {
                  width: `calc(${blob.size}px * var(--lava-scale))`,
                  height: `calc(${blob.size}px * var(--lava-scale))`,
                  top: starts
                    ? `calc(${blob.top} + ${starts[index].jy}%)`
                    : blob.top,
                  left: starts
                    ? `calc(${blob.left} + ${starts[index].jx}%)`
                    : blob.left,
                  backgroundColor: `var(--lava-${index + 1})`,
                  animationDuration: blob.duration,
                  animationDelay: starts
                    ? `${-starts[index].phase * parseFloat(blob.duration)}s`
                    : blob.delay,
                  "--x1": blob.x1,
                  "--y1": blob.y1,
                  "--x2": blob.x2,
                  "--y2": blob.y2,
                  "--x3": blob.x3,
                  "--y3": blob.y3,
                } as CSSProperties
              }
            />
          ))}
          <LavaCanvas blobs={BLOBS} starts={starts} />
        </div>
      </div>
    </div>
  );
};

export default LavaBackground;
