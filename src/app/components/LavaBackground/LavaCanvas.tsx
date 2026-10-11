"use client";
import { useEffect, useRef } from "react";

// The lava lamp, drawn by hand for iPhones and iPads. The usual version blurs
// the blobs with an SVG filter and then sharpens the alpha so touching blobs
// fuse into one shape; Apple's browser engine silently skips that filter at
// this size. Here the same two steps are done on a small canvas: each blob is
// drawn as a soft disc, then every pixel's alpha is pushed through a curve like
// the filter's (steep, clamped), and the browser scales the result up smoothly. Drawn at a low resolution, it is cheap enough to run
// every frame.

export interface LavaBlob {
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

const SCALE = 3; // CSS pixels per canvas pixel
const SOFT = 66; // how far a disc's soft edge reaches, in CSS pixels

const seconds = (value: string) => parseFloat(value);

const toPx = (value: string, vw: number, vh: number, whole: number) => {
  const n = parseFloat(value);
  if (value.endsWith("vw")) return (n / 100) * vw;
  if (value.endsWith("vh")) return (n / 100) * vh;
  if (value.endsWith("%")) return (n / 100) * whole;
  return n;
};

const ease = (u: number) => u * u * (3 - 2 * u);

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const LavaCanvas = ({ blobs }: { blobs: LavaBlob[] }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // Only where the SVG version is skipped (marked by layout.tsx).
    if (!document.documentElement.classList.contains("no-goo")) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let vw = 0;
    let vh = 0;
    const fit = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.ceil(vw / SCALE);
      canvas.height = Math.ceil(vh / SCALE);
    };
    fit();
    window.addEventListener("resize", fit);

    const colors = blobs.map((blob) => rgb(blob.color));
    let raf = 0;

    const draw = (now: number) => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      blobs.forEach((blob, index) => {
        // The same drift the CSS version has: out to three waypoints and back,
        // easing in and out, swelling and shrinking on the way.
        const duration = seconds(blob.duration);
        const t = calm ? 0 : now / 1000 - seconds(blob.delay);
        const phase = (((t % duration) + duration) % duration) / duration;
        const stops = [
          [0, 0, 1],
          [toPx(blob.x1, vw, vh, 0), toPx(blob.y1, vw, vh, 0), 1.15],
          [toPx(blob.x2, vw, vh, 0), toPx(blob.y2, vw, vh, 0), 0.88],
          [toPx(blob.x3, vw, vh, 0), toPx(blob.y3, vw, vh, 0), 1.08],
          [0, 0, 1],
        ];
        const at = phase * 4;
        const seg = Math.min(3, Math.floor(at));
        const u = ease(at - seg);
        const a = stops[seg];
        const b = stops[seg + 1];
        const dx = a[0] + (b[0] - a[0]) * u;
        const dy = a[1] + (b[1] - a[1]) * u;
        const grow = a[2] + (b[2] - a[2]) * u;

        const cx = (toPx(blob.left, vw, vh, vw) + blob.size / 2 + dx) / SCALE;
        const cy = (toPx(blob.top, vw, vh, vh) + blob.size / 2 + dy) / SCALE;
        const r = ((blob.size / 2) * grow) / SCALE;
        const reach = r + SOFT / SCALE;
        const [red, green, blue] = colors[index];
        const paint = (alpha: number) =>
          `rgba(${red},${green},${blue},${alpha})`;

        // A soft disc: solid in the middle, half strength at the rim, gone at
        // the reach, like a blurred circle.
        const fade = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach);
        fade.addColorStop(0, paint(1));
        fade.addColorStop((r * 0.7) / reach, paint(0.97));
        fade.addColorStop(r / reach, paint(0.5));
        fade.addColorStop(1, paint(0));
        ctx.fillStyle = fade;
        ctx.fillRect(cx - reach, cy - reach, reach * 2, reach * 2);
      });

      // The sharpening step: alpha becomes 18 x alpha - 8, so where two soft
      // discs overlap enough they read as one solid shape.
      const image = ctx.getImageData(0, 0, width, height);
      const px = image.data;
      for (let i = 3; i < px.length; i += 4) {
        // A gentler slope than the filter's 18, so the rim spreads over a few
        // canvas pixels instead of one hard step: smooth edges, not stairs.
        const sharpened = 9 * (px[i] / 255 - 0.47) + 0.5;
        px[i] = sharpened <= 0 ? 0 : sharpened >= 1 ? 255 : sharpened * 255;
      }
      ctx.putImageData(image, 0, 0);
    };

    const loop = (now: number) => {
      if (!document.hidden) draw(now);
      if (!calm) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, [blobs]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="lava-canvas absolute inset-0 hidden h-full w-full [filter:blur(2px)]"
    />
  );
};

export default LavaCanvas;
