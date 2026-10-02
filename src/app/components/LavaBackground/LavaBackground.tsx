"use client";

import { CSSProperties } from "react";

interface Blob {
  color: string;
  size: number;
  top: string;
  left: string;
  duration: string;
  delay: string;
  // Waypoints in vw/vh, so the drift is page-scale rather than relative to
  // the blob's own small box — this is what makes it travel, not just jiggle.
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  x3: string;
  y3: string;
}

const BLOBS: Blob[] = [
  {
    color: "#34d399",
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
    color: "#60a5fa",
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
    color: "#f472b6",
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
    color: "#fbbf24",
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
    color: "#a78bfa",
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
const LavaBackground = () => (
  <div
    className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [transform:translateZ(0)]"
    aria-hidden
  >
    {/* feColorMatrix alpha row (18 -8): opaque where blurred alpha is already
        high, transparent below the threshold, which is what turns a soft
        blurred overlap into one fused blob instead of a hazy double-blur.
        The filter region (x/y/width/height) is set explicitly and generously
        — mobile WebKit clips an SVG filter to its default, much tighter
        region (-10%/120%), cutting the blur off before it reaches a
        neighboring blob, so nothing ever merges there even though the exact
        same markup goo's together fine on desktop. */}
    <svg className="absolute h-0 w-0">
      <filter
        id="lava-goo-filter"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
      >
        <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
        />
      </filter>
    </svg>

    {/* The merge filter and the blend mode are kept on two separate nested
        layers rather than one element — Safari's handling of `filter` and
        `mix-blend-mode` together on the same box is inconsistent (one of
        the two silently stops applying on some versions), but each on its
        own box composites reliably everywhere. Opacity sits on the inner
        (filtered) layer, after the goo filter composites the blobs into
        fused shapes — putting it on each blob instead would feed low-alpha
        color into the filter's threshold math and break the merge. It's a
        theme-aware CSS var (see globals.css): a light background needs
        noticeably more pigment than a dark one for the same blobs to read
        at all, so this can't be one fixed value for both themes.
        translateZ(0) forces this onto its own single GPU layer — without
        it, Safari can split a full-viewport `fixed` element with a blend
        mode into separate render tiles, and the blend doesn't composite
        identically across the seam between them, showing up as a visible
        hard line (most often right at the fold where the browser's own
        viewport-height tile boundary falls). */}
    <div className="absolute inset-0 [mix-blend-mode:var(--lava-blend)] [transform:translateZ(0)]">
      <div
        className="lava-goo absolute inset-0"
        style={{ opacity: "var(--lava-opacity)" }}
      >
        {BLOBS.map((blob, index) => (
          <span
            key={index}
            className="lava-blob absolute rounded-full"
            style={
              {
                width: blob.size,
                height: blob.size,
                top: blob.top,
                left: blob.left,
                backgroundColor: blob.color,
                animationDuration: blob.duration,
                animationDelay: blob.delay,
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
      </div>
    </div>
  </div>
);

export default LavaBackground;
