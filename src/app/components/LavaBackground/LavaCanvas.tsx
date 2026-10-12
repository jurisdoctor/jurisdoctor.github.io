"use client";
import { useEffect, useRef } from "react";

// The lava lamp, drawn on the GPU for iPhones and iPads. The usual version
// blurs the blobs with an SVG filter and then sharpens the alpha so touching
// blobs fuse into one shape; Apple's browser engine silently skips that filter
// at this size. A fragment shader does the same two steps for every pixel at
// the screen's own resolution, in floating point: each blob is a soft disc,
// the discs are laid over one another, and the combined alpha is pushed
// through a narrow ramp. Working per pixel in floats is what keeps the rim
// smooth: an 8-bit canvas with a steep curve turns into visible stair-steps.

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

// Where a blob begins on this visit (see LavaBackground).
export interface LavaStart {
  phase: number; // 0-1: how far along its drift
  jx: number; // nudge off its usual spot, % of the screen's width
  jy: number; // and of its height
}

const SOFT = 30; // half the width of a disc's soft rim, in CSS pixels, at full size

const VERTEX = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

// uBlob holds each blob's centre and radius in CSS pixels; uCol its colour.
const fragment = (count: number) => `
precision highp float;
uniform vec2 uCanvas;
uniform float uScale;
uniform float uSoft;
uniform vec3 uBlob[${count}];
uniform vec3 uCol[${count}];
void main() {
  vec2 p = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y) * uScale;
  vec3 premult = vec3(0.0);
  float alpha = 0.0;
  for (int i = 0; i < ${count}; i++) {
    float d = distance(p, uBlob[i].xy);
    float r = uBlob[i].z;
    float w = 1.0 - smoothstep(r - uSoft, r + uSoft, d);
    premult = uCol[i] * w + premult * (1.0 - w);
    alpha = w + alpha * (1.0 - w);
  }
  float edge = smoothstep(0.43, 0.53, alpha);
  vec3 color = premult / max(alpha, 0.0001);
  gl_FragColor = vec4(color * edge, edge);
}
`;

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
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
};

// Where a blob is, and how big, at a moment: the same drift the CSS version
// has, out to three waypoints and back, easing in and out, swelling and
// shrinking on the way.
const stateAt = (
  blob: LavaBlob,
  seconds_: number,
  vw: number,
  vh: number,
  shrink: number,
  start: LavaStart,
): [number, number, number] => {
  const duration = seconds(blob.duration);
  const t = seconds_ + start.phase * duration;
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
  const size = blob.size * shrink;
  return [
    toPx(blob.left, vw, vh, vw) + (start.jx / 100) * vw + size / 2 + dx,
    toPx(blob.top, vw, vh, vh) + (start.jy / 100) * vh + size / 2 + dy,
    (size / 2) * grow,
  ];
};

const compile = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
};

const LavaCanvas = ({
  blobs,
  starts,
}: {
  blobs: LavaBlob[];
  starts: LavaStart[] | null;
}) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const root = document.documentElement;
    // Only where the SVG version is skipped (marked by layout.tsx).
    if (!root.classList.contains("no-goo")) return;
    if (!starts) return;

    // Without WebGL there is nothing to draw with: hand the page back to the
    // ordinary blobs rather than leave it empty.
    const giveUp = () => root.classList.remove("no-goo");
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return giveUp();
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const frag = compile(gl, gl.FRAGMENT_SHADER, fragment(blobs.length));
    const program = gl.createProgram();
    if (!vertex || !frag || !program) return giveUp();
    gl.attachShader(program, vertex);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return giveUp();
    gl.useProgram(program);

    // One triangle that covers the whole screen.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const attribute = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);

    const uCanvas = gl.getUniformLocation(program, "uCanvas");
    const uScale = gl.getUniformLocation(program, "uScale");
    const uSoft = gl.getUniformLocation(program, "uSoft");
    const uBlob = gl.getUniformLocation(program, "uBlob");
    const uCol = gl.getUniformLocation(program, "uCol");
    // Each blob's colour comes from the theme (--lava-1.. in globals.css), and
    // is read again whenever the theme is switched.
    const paintColors = () => {
      const style = getComputedStyle(root);
      const list = blobs.flatMap((b, i) => {
        const value = style.getPropertyValue(`--lava-${i + 1}`).trim();
        return rgb(/^#[0-9a-f]{6}$/i.test(value) ? value : b.color);
      });
      gl.uniform3fv(uCol, new Float32Array(list));
    };
    paintColors();
    const watcher = new MutationObserver(paintColors);
    watcher.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let vw = 0;
    let vh = 0;
    // The blobs' size relative to full (see --lava-scale in globals.css).
    let shrink = 1;
    const LEVELS = [1.5, 1, 0.75, 0.5];
    let level = 0;
    // Whether to draw less often still, once the density can go no lower.
    let every = 30;
    const fit = () => {
      shrink =
        parseFloat(getComputedStyle(root).getPropertyValue("--lava-scale")) ||
        1;
      gl.uniform1f(uSoft, SOFT * shrink);
      vw = window.innerWidth;
      vh = window.innerHeight;
      // How many canvas pixels per screen pixel: the screen's own at first (up
      // to 1.5), and fewer if the page turns out to be running slowly (see the
      // loop below). Soft blobs lose nothing visible at a lower density.
      const density = Math.min(window.devicePixelRatio || 1, LEVELS[level]);
      canvas.width = Math.round(vw * density);
      canvas.height = Math.round(vh * density);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uCanvas, canvas.width, canvas.height);
      gl.uniform1f(uScale, 1 / density);
    };
    fit();
    window.addEventListener("resize", fit);

    const draw = (now: number) => {
      const t = calm ? 0 : now / 1000;
      gl.uniform3fv(
        uBlob,
        new Float32Array(
          blobs.flatMap((b, i) => stateAt(b, t, vw, vh, shrink, starts[i])),
        ),
      );
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let last = 0;
    let before = 0;
    let average = 16;
    let counted = 0;
    const loop = (now: number) => {
      // Watch how long frames really take. If the page is struggling (under
      // about 38 a second, smoothed), the lava steps down a notch: fewer
      // pixels, then, at the bottom, fewer redraws, so it never drags the
      // shapes and the page itself down with it.
      if (before && !document.hidden) {
        average = average * 0.9 + (now - before) * 0.1;
        counted += 1;
        if (counted > 40 && average > 26) {
          counted = 0;
          average = 16;
          if (level < LEVELS.length - 1) {
            level += 1;
            fit();
          } else {
            every = Math.min(every * 2, 500);
          }
        }
      }
      before = now;
      // About 30 frames a second is plenty for a drift this slow.
      if (!document.hidden && now - last > every) {
        last = now;
        draw(now);
      }
      if (!calm) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    // Once even when still, so reduced motion shows the picture.
    if (calm) draw(0);

    return () => {
      cancelAnimationFrame(raf);
      watcher.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [blobs, starts]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="lava-canvas absolute inset-0 hidden h-full w-full"
    />
  );
};

export default LavaCanvas;
