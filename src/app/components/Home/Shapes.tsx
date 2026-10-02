"use client";

import { useEffect, useRef } from "react";

// A pointer over any real UI — nav, a button, a link, a card — attracts
// nothing; the shapes wander on their own. A pointer over open background
// anywhere else (or any tap, since touch has no hover) pulls every shape
// toward it. The moment the pointer lands back on real UI, each shape rolls
// a fresh random wander target instead of resuming whatever path it was
// on, so the "release" always looks like a new scatter, not a resumed
// loop. This is DOM-driven (closest(SAFE_SELECTOR) on the actual pointer
// target), not tied to one ref, so it works the same on every page without
// each one having to wire up its own "safe zone".
type Mode = "idle" | "attracted";

const SAFE_SELECTOR =
  'button, a, input, select, textarea, label, aside, [data-shapes-safe]';

// At IDLE_EASE, a shape is ~95% of the way to its target after ~1.4s — the
// retarget window has to stay shorter than that, or it visibly finishes
// easing and sits still for whatever's left before the next retarget.
const SEGMENT_MIN_MS = 900;
const SEGMENT_MAX_MS = 1700;
const WANDER_RADIUS = 170;
const IDLE_EASE = 0.035;
const ATTRACT_EASE = 0.07;
// How often each shape re-rolls where near the cursor it's circling, so a
// held-still pointer still reads as a little swarm instead of the shapes
// converging and freezing in formation.
const SWARM_MIN_MS = 400;
const SWARM_MAX_MS = 900;
const SWARM_RADIUS = 110;

interface ShapeState {
  el: SVGSVGElement | null;
  anchorX: number;
  anchorY: number;
  curX: number;
  curY: number;
  targetX: number;
  targetY: number;
  nextRetarget: number;
  attractOffsetX: number;
  attractOffsetY: number;
}

const randomWanderTarget = () => ({
  x: (Math.random() * 2 - 1) * WANDER_RADIUS,
  y: (Math.random() * 2 - 1) * WANDER_RADIUS,
});

const Shapes = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shapeRefs = useRef<(SVGSVGElement | null)[]>([]);
  const states = useRef<ShapeState[]>([]);
  const mode = useRef<Mode>("idle");
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
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
              targetX: 0,
              targetY: 0,
              nextRetarget: 0,
              attractOffsetX: 0,
              attractOffsetY: 0,
            }
          );
        }
        // Clear any transform before measuring, so the rect reflects the
        // shape's untransformed CSS anchor position, not wherever it last
        // drifted to. Measured in viewport space, matching the pointer
        // (clientX/clientY below) — every mount point for this component is
        // a `fixed` layer that doesn't scroll with the page, so adding
        // scrollX/scrollY here would offset the anchor by however far the
        // page had scrolled, throwing the "move toward the pointer" math off
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
          targetX: prev?.targetX ?? 0,
          targetY: prev?.targetY ?? 0,
          nextRetarget: prev?.nextRetarget ?? 0,
          attractOffsetX:
            prev?.attractOffsetX ?? (Math.random() * 2 - 1) * 90,
          attractOffsetY:
            prev?.attractOffsetY ?? (Math.random() * 2 - 1) * 90,
        };
      });
    };

    measure();
    window.addEventListener("resize", measure);

    const overSafeZone = (target: EventTarget | null) =>
      target instanceof Element && !!target.closest(SAFE_SELECTOR);

    // Force every shape to re-roll immediately on the next tick, instead of
    // waiting out whatever retarget timer it had queued from the mode it
    // was just in — without this, a shape could inherit a multi-second-old
    // idle timer the instant it became attracted, and visibly sit still
    // for however much of that was left before its first swarm jitter.
    const rerollAll = () => {
      states.current.forEach((state) => {
        state.nextRetarget = 0;
      });
    };

    const scatter = () => {
      const now = performance.now();
      states.current.forEach((state) => {
        const wander = randomWanderTarget();
        state.targetX = wander.x;
        state.targetY = wander.y;
        state.nextRetarget =
          now + SEGMENT_MIN_MS + Math.random() * (SEGMENT_MAX_MS - SEGMENT_MIN_MS);
      });
    };

    const setMode = (next: Mode) => {
      if (mode.current === next) return;
      const wasAttracted = mode.current === "attracted";
      mode.current = next;
      if (next === "idle" && wasAttracted) scatter();
      if (next === "attracted" && !wasAttracted) rerollAll();
    };

    // pointer.current is stored in viewport space to match the anchors
    // (see measure()); the safe-zone check uses the event's own target,
    // which needs no coordinate conversion at all.
    const handlePointer = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
      setMode(overSafeZone(event.target) ? "idle" : "attracted");
    };

    window.addEventListener("pointermove", handlePointer);
    window.addEventListener("pointerdown", handlePointer);

    // Once the pointer leaves the page there are no more pointermove events
    // to flip the mode, so the shapes would stay stuck swarming the last spot
    // it touched on the way out. Treat leaving the document (or the window
    // losing focus) like landing on real UI: release back to wandering.
    // Touch is excluded — a finger lifting also fires pointerleave, and a tap
    // is meant to keep the pull until the next tap.
    // No single signal is reliable across browsers (Safari and fast exits
    // skip some of them), so listen to all: pointerleave on <html>, a
    // document-level mouseleave, a pointerout whose relatedTarget is null
    // (the pointer went somewhere that isn't part of this page), and the tab
    // losing focus or going hidden.
    const handleLeave = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      setMode("idle");
    };
    const handleOut = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.relatedTarget) return;
      setMode("idle");
    };
    const handleIdle = () => setMode("idle");
    const handleVisibility = () => {
      if (document.hidden) setMode("idle");
    };

    document.documentElement.addEventListener("pointerleave", handleLeave);
    document.addEventListener("mouseleave", handleIdle);
    window.addEventListener("pointerout", handleOut);
    window.addEventListener("blur", handleIdle);
    document.addEventListener("visibilitychange", handleVisibility);

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const attracted = mode.current === "attracted";

      states.current.forEach((state) => {
        if (!state.el) return;

        if (attracted) {
          // Re-roll where near the cursor this shape is circling every
          // SWARM_MIN-MAX_MS, rather than settling into a fixed offset —
          // keeps the group visibly moving around each other and the
          // pointer even while the pointer itself holds still.
          if (now >= state.nextRetarget) {
            state.attractOffsetX = (Math.random() * 2 - 1) * SWARM_RADIUS;
            state.attractOffsetY = (Math.random() * 2 - 1) * SWARM_RADIUS;
            state.nextRetarget =
              now + SWARM_MIN_MS + Math.random() * (SWARM_MAX_MS - SWARM_MIN_MS);
          }
          state.targetX = pointer.current.x - state.anchorX + state.attractOffsetX;
          state.targetY = pointer.current.y - state.anchorY + state.attractOffsetY;
        } else if (now >= state.nextRetarget) {
          const wander = randomWanderTarget();
          state.targetX = wander.x;
          state.targetY = wander.y;
          state.nextRetarget =
            now +
            SEGMENT_MIN_MS +
            Math.random() * (SEGMENT_MAX_MS - SEGMENT_MIN_MS);
        }

        const ease = attracted ? ATTRACT_EASE : IDLE_EASE;
        state.curX += (state.targetX - state.curX) * ease;
        state.curY += (state.targetY - state.curY) * ease;
        state.el.style.transform = `translate(${state.curX.toFixed(2)}px, ${state.curY.toFixed(2)}px)`;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("pointerdown", handlePointer);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
      document.removeEventListener("mouseleave", handleIdle);
      window.removeEventListener("pointerout", handleOut);
      window.removeEventListener("blur", handleIdle);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const ref = (index: number) => (el: SVGSVGElement | null) => {
    shapeRefs.current[index] = el;
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full"
    >
      <svg
        ref={ref(0)}
        width="27"
        height="29"
        className="absolute left-[2%] top-[10%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.15625.60099c4.37954 3.67487 6.46544 9.40612 5.47254 15.03526-.9929 5.62915-4.91339 10.30141-10.2846 12.25672-5.37122 1.9553-11.3776.89631-15.75715-2.77856l2.05692-2.45134c3.50315 2.93948 8.3087 3.78663 12.60572 2.22284 4.297-1.5638 7.43381-5.30209 8.22768-9.80537.79387-4.50328-.8749-9.08872-4.37803-12.02821L21.15625.60099z"
          fill="#FFD15C"
          fillRule="evenodd"
        />
      </svg>

      <svg
        ref={ref(1)}
        width="26"
        height="26"
        className="absolute left-[18%] top-[30%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 3.3541L2.42705 24.5h21.1459L13 3.3541z"
          stroke="#FF4C60"
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
        className="absolute bottom-[30%] left-[5%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="13"
          cy="13"
          r="10"
          stroke="#44D7B6"
          strokeWidth="3"
          fill="none"
        />
      </svg>

      <svg
        ref={ref(3)}
        width="15"
        height="23"
        className="absolute bottom-[10%] left-[2%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          transform="rotate(30 9.86603 10.13397)"
          x="7"
          width="3"
          height="25"
          rx="1.5"
          fill="#FFD15C"
          fillRule="evenodd"
        />
      </svg>

      {/* plus */}
      <svg
        ref={ref(4)}
        width="22"
        height="22"
        className="absolute left-[44%] top-[10%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.5 0h3v9.5H22v3h-9.5V22h-3v-9.5H0v-3h9.5V0z"
          fill="#6C6CE5"
          fillRule="evenodd"
        />
      </svg>

      {/* zigzag */}
      <svg
        ref={ref(5)}
        width="40"
        height="18"
        className="absolute bottom-[10%] left-[36%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          points="2,16 11,2 20,16 29,2 38,16"
          stroke="#FF4C60"
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
        className="absolute right-[25%] top-[20%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 1.5l11 6.5v14l-11 6.5-11-6.5V8l11-6.5z"
          stroke="#FFD15C"
          strokeWidth="2.5"
          fill="none"
          fillRule="evenodd"
        />
      </svg>

      <svg
        ref={ref(7)}
        width="19"
        height="21"
        className="absolute bottom-[20%] right-[24%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          transform="rotate(-40 6.25252 10.12626)"
          x="7"
          width="3"
          height="25"
          rx="1.5"
          fill="#6C6CE5"
          fillRule="evenodd"
        />
      </svg>

      {/* rotated square */}
      <svg
        ref={ref(8)}
        width="28"
        height="28"
        className="absolute right-[2%] top-[10%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="5"
          width="18"
          height="18"
          stroke="#6C6CE5"
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
        className="absolute left-[11%] top-[45%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#44D7B6" fillRule="evenodd">
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
        className="absolute bottom-[10%] right-[2%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 0l3.21 6.73 7.41.98-5.4 5.13 1.42 7.35L13 16.7l-6.64 3.49 1.42-7.35-5.4-5.13 7.41-.98L13 0z"
          fill="#FFD15C"
          fillRule="evenodd"
        />
      </svg>
    </div>
  );
};

export default Shapes;
