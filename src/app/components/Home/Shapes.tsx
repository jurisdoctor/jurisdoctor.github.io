"use client";

import { useEffect, useRef, useState } from "react";
import { CONSTELLATIONS } from "./Constellations";

// The shapes wander on their own, and every so often they gather into a
// constellation somewhere on the screen: the twelve zodiac signs plus a few
// more (Ophiuchus, Orion, the Big Dipper...), each coming up once in a random
// order before any repeats. A different set of shapes drifts into the star
// positions, sways a little, and thin lines join the stars the way the
// constellation is drawn, with its name under it. Only as many shapes as it has
// stars are used; the rest shrink away until it breaks up. A few seconds later
// the shapes drift off to wander again as the lines fade, and then the next one
// forms. Nothing follows the pointer.
type Mode = "idle" | "attracted";

// At IDLE_EASE, a shape is ~95% of the way to its target after ~1.4s — the
// retarget window has to stay shorter than that, or it visibly finishes
// easing and sits still for whatever's left before the next retarget.
const SEGMENT_MIN_MS = 900;
const SEGMENT_MAX_MS = 1700;
const WANDER_RADIUS = 170;
const IDLE_EASE = 0.045;
// Constellation: how fast a shape eases to its star (per 60th of a second), how
// wide the pattern is (a share of the window, capped), how strong the lines
// are, how fast they fade in and out, and how far a shape sways around its star.
const ATTRACT_EASE = 0.07;
const PATTERN_MAX = 460;
const PATTERN_SHARE = 0.5;
const LINE_OPACITY = 0.6;
const LINE_FADE = 0.08;
const SWAY = 4;
// How long the shapes wander between signs (a random time in this range), and
// how long a sign holds before it breaks up.
const WANDER_MIN_MS = 2000;
const WANDER_MAX_MS = 2000;
const HOLD_MS = 4000;

interface ShapeState {
  el: SVGSVGElement | null;
  anchorX: number;
  anchorY: number;
  curX: number;
  curY: number;
  scale: number;
  // Called in with no star to take: faded out until released.
  spare: boolean;
  targetX: number;
  targetY: number;
  nextRetarget: number;
  // Constellation: this shape's spot relative to the center, and where it
  // is in its sway.
  spotX: number;
  spotY: number;
  phase: number;
}

// How much of a square around a point (reach pixels to each side) has page
// content on top of it, sampled on a grid: an element that has its own text or
// a background of its own, as opposed to an empty wrapper.
const coverage = (cx: number, cy: number, reach: number) => {
  let covered = 0;
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const el = document.elementFromPoint(
        cx + (i * reach) / 2,
        cy + (j * reach) / 2,
      );
      if (!el || el === document.body || el === document.documentElement) {
        continue;
      }
      const hasText = Array.from(el.childNodes).some(
        (node) => node.nodeType === 3 && !!node.textContent?.trim(),
      );
      const color = getComputedStyle(el).backgroundColor;
      const hasFill = color !== "rgba(0, 0, 0, 0)" && color !== "transparent";
      if (hasText || hasFill || el.matches("img, svg, button, input, select")) {
        covered++;
      }
    }
  }
  return covered;
};

const randomWanderTarget = () => ({
  x: (Math.random() * 2 - 1) * WANDER_RADIUS,
  y: (Math.random() * 2 - 1) * WANDER_RADIUS,
});

// How many shapes there are, and where each sits on this visit: rolled fresh
// every time the page opens, anywhere on the screen, so the arrangement is
// never the same twice (the way the lava lamp's blobs start somewhere new).
const COUNT = 11;
const rollSpots = () =>
  Array.from({ length: COUNT }, () => ({
    left: 2 + Math.random() * 92,
    top: 4 + Math.random() * 88,
  }));

const Shapes = () => {
  // Null until the browser has rolled them, so the page the server sends and
  // the first paint agree; the shapes are hidden until then.
  const [spots, setSpots] = useState<{ left: number; top: number }[] | null>(
    null,
  );
  useEffect(() => setSpots(rollSpots()), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const shapeRefs = useRef<(SVGSVGElement | null)[]>([]);
  const states = useRef<ShapeState[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const labelRef = useRef<SVGTextElement>(null);
  const mode = useRef<Mode>("idle");
  // Where the current constellation is centered, in viewport space.
  const center = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!spots) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const measure = () => {
      states.current = shapeRefs.current.map((el, index) => {
        const prev = states.current[index];
        if (!el) {
          return (
            prev ?? {
              el: null,
              anchorX: 0,
              anchorY: 0,
              curX: 0,
              curY: 0,
              scale: 1,
              spare: false,
              targetX: 0,
              targetY: 0,
              nextRetarget: 0,
              spotX: 0,
              spotY: 0,
              phase: 0,
            }
          );
        }
        // Clear any transform before measuring, so the rect reflects the
        // shape's untransformed CSS anchor position, not wherever it last
        // drifted to. Measured in viewport space, matching the constellation
        // center (viewport coordinates too) — every mount point for this component is
        // a `fixed` layer that doesn't scroll with the page, so adding
        // scrollX/scrollY here would offset the anchor by however far the
        // page had scrolled, throwing the "move toward the center" math off
        // by exactly that amount instead of keeping it accurate.
        el.style.transform = "";
        const rect = el.getBoundingClientRect();
        const anchorX = rect.left + rect.width / 2;
        const anchorY = rect.top + rect.height / 2;
        return {
          el,
          anchorX,
          anchorY,
          curX: prev?.curX ?? 0,
          curY: prev?.curY ?? 0,
          scale: prev?.scale ?? 1,
          spare: prev?.spare ?? false,
          targetX: prev?.targetX ?? 0,
          targetY: prev?.targetY ?? 0,
          nextRetarget: prev?.nextRetarget ?? 0,
          spotX: prev?.spotX ?? 0,
          spotY: prev?.spotY ?? 0,
          phase: prev?.phase ?? index,
        };
      });
    };

    measure();
    window.addEventListener("resize", measure);

    let plan = { name: "", edges: [] as [number, number][], labelDrop: 0 };

    const setMode = (next: Mode) => {
      if (mode.current === next) return;
      mode.current = next;
      // Every call picks a constellation, turns it a little, and deals the
      // shapes out to its stars at random, so it is never the same twice. The
      // shapes with no star hang round the outside of it.
      if (next === "attracted") {
        const all = states.current;
        const sky = nextSky();
        const size = Math.min(PATTERN_MAX, window.innerWidth * PATTERN_SHARE);
        const turn = (Math.random() * 2 - 1) * 0.3;
        const xs = sky.stars.map((star) => star[0]);
        const ys = sky.stars.map((star) => star[1]);
        const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
        const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
        const span = Math.max(
          Math.max(...xs) - Math.min(...xs),
          Math.max(...ys) - Math.min(...ys),
        );
        const order = all.map((_, index) => index);
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }
        sky.stars.forEach((star, n) => {
          const shape = all[order[n]];
          if (!shape) return;
          const x = ((star[0] - midX) / span) * size;
          const y = ((star[1] - midY) / span) * size;
          shape.spotX = x * Math.cos(turn) - y * Math.sin(turn);
          shape.spotY = x * Math.sin(turn) + y * Math.cos(turn);
          shape.phase = Math.random() * Math.PI * 2;
        });
        // Only as many shapes as the constellation has stars are called in;
        // the rest shrink away where they are, and grow back once released.
        all.forEach((shape) => {
          shape.spare = true;
        });
        order.slice(0, sky.stars.length).forEach((index) => {
          if (all[index]) all[index].spare = false;
        });
        plan = {
          name: `${sky.glyph}\uFE0E  ${sky.name}`,
          edges: sky.edges.map(([a, b]) => [order[a], order[b]]),
          labelDrop:
            (((Math.max(...ys) - Math.min(...ys)) / span) * size) / 2 + 40,
        };
      }
      // Leaving it, every shape picks a fresh place to wander to at once,
      // rather than waiting out a timer from before it was called in.
      if (next === "idle") {
        states.current.forEach((state) => {
          state.nextRetarget = 0;
        });
      }
    };

    // The cycle: wander for a while, then form a sign somewhere on screen
    // (kept clear of the edges so it fits), hold it, break it up, repeat.
    let cycle = 0;
    // Every constellation comes up once, in a fresh random order, before any
    // repeats (and the first of a new round is never the one just shown).
    let bag: typeof CONSTELLATIONS = [];
    let last: (typeof CONSTELLATIONS)[number] | null = null;
    const nextSky = () => {
      if (!bag.length) {
        bag = [...CONSTELLATIONS];
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        if (bag[bag.length - 1] === last) bag.unshift(bag.pop()!);
      }
      last = bag.pop()!;
      return last;
    };
    const form = () => {
      const box = containerRef.current?.getBoundingClientRect();
      const left = box?.left ?? 0;
      const top = box?.top ?? 0;
      const width = box?.width ?? window.innerWidth;
      const height = box?.height ?? window.innerHeight;
      const room =
        Math.min(PATTERN_MAX, window.innerWidth * PATTERN_SHARE) / 2 + 50;
      // The shapes sit behind the page, so try a handful of places and take
      // the one with the least text and cards in the way.
      let best = { x: left + width / 2, y: top + height / 2 };
      let fewest = Infinity;
      for (let attempt = 0; attempt < 14; attempt++) {
        const spot = {
          x: left + room + Math.random() * Math.max(0, width - room * 2),
          y: top + room + Math.random() * Math.max(0, height - room * 2),
        };
        const covered = coverage(spot.x, spot.y, room - 50);
        if (covered < fewest) {
          fewest = covered;
          best = spot;
        }
      }
      center.current = best;
      setMode("attracted");
      cycle = window.setTimeout(() => {
        setMode("idle");
        wait();
      }, HOLD_MS);
    };
    const wait = () => {
      cycle = window.setTimeout(
        form,
        WANDER_MIN_MS + Math.random() * (WANDER_MAX_MS - WANDER_MIN_MS),
      );
    };
    wait();

    const lines = lineRefs.current;
    let lineAlpha = 0;
    // The lines only light once the shapes have (nearly) reached their stars,
    // so they never stretch across the screen while the shapes are still on
    // their way.
    let lit = false;
    let raf = 0;
    let lastFrame = performance.now();
    const tick = () => {
      const now = performance.now();
      // The easing is per 60th of a second, scaled by how long the frame
      // really took, so the shapes cover the same ground in the same time on a
      // phone running at 30 frames a second as on a laptop at 120. (Easing
      // once per frame made them crawl wherever the page was drawing slowly.)
      const frames = Math.min((now - lastFrame) / (1000 / 60), 4);
      lastFrame = now;
      const attracted = mode.current === "attracted";

      let farthest = 0;
      states.current.forEach((state) => {
        if (!state.el) return;

        if (attracted && state.spare) {
          // No star: stay put while shrinking away.
          state.targetX = state.curX;
          state.targetY = state.curY;
        } else if (attracted) {
          // Head for this shape's own spot, swaying a touch so the sky is
          // never quite still.
          const t = now / 1000;
          state.targetX =
            center.current.x -
            state.anchorX +
            state.spotX +
            Math.sin(t * 0.9 + state.phase) * SWAY;
          state.targetY =
            center.current.y -
            state.anchorY +
            state.spotY +
            Math.cos(t * 0.7 + state.phase) * SWAY;
        } else if (now >= state.nextRetarget) {
          const wander = randomWanderTarget();
          state.targetX = wander.x;
          state.targetY = wander.y;
          state.nextRetarget =
            now +
            SEGMENT_MIN_MS +
            Math.random() * (SEGMENT_MAX_MS - SEGMENT_MIN_MS);
        }

        const ease =
          1 - Math.pow(1 - (attracted ? ATTRACT_EASE : IDLE_EASE), frames);
        if (attracted && !state.spare) {
          farthest = Math.max(
            farthest,
            Math.hypot(state.targetX - state.curX, state.targetY - state.curY),
          );
        }
        state.curX += (state.targetX - state.curX) * ease;
        state.curY += (state.targetY - state.curY) * ease;
        // Shapes without a star shrink to nothing as they fade, and return at
        // full size once the sign breaks up.
        const wanted = attracted && state.spare ? 0 : 1;
        state.scale += (wanted - state.scale) * ease;
        state.el.style.opacity = state.scale.toFixed(3);
        state.el.style.transform = `translate(${state.curX.toFixed(2)}px, ${state.curY.toFixed(2)}px) scale(${state.scale.toFixed(3)})`;
      });

      // The lines run along the constellation's edges, and fade in and out
      // with the call. They are drawn in the layer's own space, which is not
      // always the window's (the question banks' layer starts after the sidebar).
      if (!attracted) lit = false;
      else if (farthest < 40) lit = true;
      lineAlpha +=
        ((lit ? 1 : 0) - lineAlpha) * (1 - Math.pow(1 - LINE_FADE, frames));
      const origin = containerRef.current?.getBoundingClientRect();
      const offX = origin?.left ?? 0;
      const offY = origin?.top ?? 0;
      lines.forEach((line, index) => {
        if (!line) return;
        const edge = plan.edges[index];
        const from = edge && states.current[edge[0]];
        const to = edge && states.current[edge[1]];
        if (!from || !to || lineAlpha < 0.01) {
          line.style.opacity = "0";
          return;
        }
        line.setAttribute("x1", (from.anchorX + from.curX - offX).toFixed(1));
        line.setAttribute("y1", (from.anchorY + from.curY - offY).toFixed(1));
        line.setAttribute("x2", (to.anchorX + to.curX - offX).toFixed(1));
        line.setAttribute("y2", (to.anchorY + to.curY - offY).toFixed(1));
        line.style.opacity = (lineAlpha * LINE_OPACITY).toFixed(3);
      });
      const label = labelRef.current;
      if (label) {
        if (label.textContent !== plan.name) label.textContent = plan.name;
        label.setAttribute("x", (center.current.x - offX).toFixed(1));
        label.setAttribute(
          "y",
          (center.current.y - offY + plan.labelDrop).toFixed(1),
        );
        label.style.opacity = (lineAlpha * 0.7).toFixed(3);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(cycle);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [spots]);

  const ref = (index: number) => (el: SVGSVGElement | null) => {
    shapeRefs.current[index] = el;
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full"
    >
      {/* constellation lines, one for each edge, and its name */}
      <svg
        className="absolute left-0 top-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: 12 }, (_, index) => (
          <line
            key={index}
            ref={(el) => {
              lineRefs.current[index] = el;
            }}
            style={{ stroke: "var(--shape-b)", opacity: 0 }}
            strokeWidth="1.2"
          />
        ))}
        <text
          ref={labelRef}
          textAnchor="middle"
          style={{ fill: "var(--shape-b)", opacity: 0 }}
          fontSize="13"
          letterSpacing="3"
        />
      </svg>

      <svg
        ref={ref(0)}
        width="27"
        height="29"
        className="absolute"
        style={
          spots
            ? { left: `${spots[0].left}%`, top: `${spots[0].top}%` }
            : { visibility: "hidden" }
        }
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.15625.60099c4.37954 3.67487 6.46544 9.40612 5.47254 15.03526-.9929 5.62915-4.91339 10.30141-10.2846 12.25672-5.37122 1.9553-11.3776.89631-15.75715-2.77856l2.05692-2.45134c3.50315 2.93948 8.3087 3.78663 12.60572 2.22284 4.297-1.5638 7.43381-5.30209 8.22768-9.80537.79387-4.50328-.8749-9.08872-4.37803-12.02821L21.15625.60099z"
          style={{ fill: "var(--shape-b)" }}
          fillRule="evenodd"
        />
      </svg>

      <svg
        ref={ref(1)}
        width="26"
        height="26"
        className="absolute"
        style={
          spots
            ? { left: `${spots[1].left}%`, top: `${spots[1].top}%` }
            : { visibility: "hidden" }
        }
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 3.3541L2.42705 24.5h21.1459L13 3.3541z"
          style={{ stroke: "var(--shape-a)" }}
          strokeWidth="3"
          fill="none"
          fillRule="evenodd"
        />
      </svg>

      {/* ring */}
      <svg
        ref={ref(2)}
        width="26"
        height="26"
        className="absolute"
        style={
          spots
            ? { left: `${spots[2].left}%`, top: `${spots[2].top}%` }
            : { visibility: "hidden" }
        }
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="13"
          cy="13"
          r="10"
          style={{ stroke: "var(--shape-d)" }}
          strokeWidth="3"
          fill="none"
        />
      </svg>

      <svg
        ref={ref(3)}
        width="15"
        height="23"
        className="absolute"
        style={
          spots
            ? { left: `${spots[3].left}%`, top: `${spots[3].top}%` }
            : { visibility: "hidden" }
        }
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          transform="rotate(30 9.86603 10.13397)"
          x="7"
          width="3"
          height="25"
          rx="1.5"
          style={{ fill: "var(--shape-b)" }}
          fillRule="evenodd"
        />
      </svg>

      {/* plus */}
      <svg
        ref={ref(4)}
        width="22"
        height="22"
        className="absolute"
        style={
          spots
            ? { left: `${spots[4].left}%`, top: `${spots[4].top}%` }
            : { visibility: "hidden" }
        }
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.5 0h3v9.5H22v3h-9.5V22h-3v-9.5H0v-3h9.5V0z"
          style={{ fill: "var(--shape-c)" }}
          fillRule="evenodd"
        />
      </svg>

      {/* zigzag */}
      <svg
        ref={ref(5)}
        width="40"
        height="18"
        className="absolute"
        style={
          spots
            ? { left: `${spots[5].left}%`, top: `${spots[5].top}%` }
            : { visibility: "hidden" }
        }
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          points="2,16 11,2 20,16 29,2 38,16"
          style={{ stroke: "var(--shape-a)" }}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* hexagon */}
      <svg
        ref={ref(6)}
        width="26"
        height="30"
        className="absolute"
        style={
          spots
            ? { left: `${spots[6].left}%`, top: `${spots[6].top}%` }
            : { visibility: "hidden" }
        }
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 1.5l11 6.5v14l-11 6.5-11-6.5V8l11-6.5z"
          style={{ stroke: "var(--shape-b)" }}
          strokeWidth="2.5"
          fill="none"
          fillRule="evenodd"
        />
      </svg>

      <svg
        ref={ref(7)}
        width="19"
        height="21"
        className="absolute"
        style={
          spots
            ? { left: `${spots[7].left}%`, top: `${spots[7].top}%` }
            : { visibility: "hidden" }
        }
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          transform="rotate(-40 6.25252 10.12626)"
          x="7"
          width="3"
          height="25"
          rx="1.5"
          style={{ fill: "var(--shape-c)" }}
          fillRule="evenodd"
        />
      </svg>

      {/* rotated square */}
      <svg
        ref={ref(8)}
        width="28"
        height="28"
        className="absolute"
        style={
          spots
            ? { left: `${spots[8].left}%`, top: `${spots[8].top}%` }
            : { visibility: "hidden" }
        }
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="5"
          width="18"
          height="18"
          style={{ stroke: "var(--shape-c)" }}
          strokeWidth="3"
          fill="none"
          transform="rotate(45 14 14)"
        />
      </svg>

      {/* diagonal dot cluster */}
      <svg
        ref={ref(9)}
        width="30"
        height="30"
        className="absolute"
        style={
          spots
            ? { left: `${spots[9].left}%`, top: `${spots[9].top}%` }
            : { visibility: "hidden" }
        }
        xmlns="http://www.w3.org/2000/svg"
      >
        <g style={{ fill: "var(--shape-d)" }} fillRule="evenodd">
          <circle cx="4" cy="4" r="3.5" />
          <circle cx="15" cy="15" r="3.5" />
          <circle cx="26" cy="26" r="3.5" />
        </g>
      </svg>

      {/* star */}
      <svg
        ref={ref(10)}
        width="26"
        height="25"
        className="absolute"
        style={
          spots
            ? { left: `${spots[10].left}%`, top: `${spots[10].top}%` }
            : { visibility: "hidden" }
        }
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 0l3.21 6.73 7.41.98-5.4 5.13 1.42 7.35L13 16.7l-6.64 3.49 1.42-7.35-5.4-5.13 7.41-.98L13 0z"
          style={{ fill: "var(--shape-b)" }}
          fillRule="evenodd"
        />
      </svg>
    </div>
  );
};

export default Shapes;
