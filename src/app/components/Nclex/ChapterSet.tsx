"use client";
import {
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { LuChevronDown } from "react-icons/lu";
import { ChapterType, displayNumberOf } from "./Questions";

export type PickType = string;
export type LensType = "all" | "incomplete";
export type ResultType = "solved" | "missed";

// Cycles through a few labels in place, crossfading, for tiles/headings that
// stand in for more than one source chapter (a combined deck).
export const Flash = ({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 1600);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length < 2) return <>{items[0]}</>;

  return (
    <span className={`relative inline-grid ${className ?? ""}`}>
      {items.map((item, itemIndex) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={itemIndex}
          className={`col-start-1 row-start-1 transition duration-[900ms] ease-in-out ${
            itemIndex === index
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0"
          }`}
        >
          {item}
        </span>
      ))}
    </span>
  );
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
const Glow = ({ label }: { label: string }) => {
  const uid = useId();
  const filterId = `${uid}-blur`;
  const gradientId = `${uid}-flame`;
  return (
    <svg
      aria-label={label}
      className="pointer-events-none absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)] overflow-visible"
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
          <stop offset="0%" stopColor="hsl(4, 90%, 38%)" />
          <stop offset="22%" stopColor="hsl(14, 100%, 48%)" />
          <stop offset="48%" stopColor="hsl(28, 100%, 58%)" />
          <stop offset="70%" stopColor="hsl(38, 100%, 62%)" />
          <stop offset="88%" stopColor="hsl(46, 100%, 74%)" />
          <stop offset="100%" stopColor="hsl(52, 100%, 88%)" />
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
        strokeWidth="4"
        strokeLinecap="round"
        pathLength={100}
        className="glow-flicker"
        filter={`url(#${filterId})`}
        opacity={0.9}
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
        className="glow-flicker"
        style={{ animationDelay: "-0.35s" }}
      />
    </svg>
  );
};

const Reset = ({ onReset }: { onReset: () => void }) => {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-bold uppercase tracking-wide text-[#8b88b1] duration-300 hover:text-[var(--primary-color)]"
      >
        Reset
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
      <span className="font-bold text-[var(--title-color)]">
        Clear every answer?
      </span>

      <button
        type="button"
        onClick={() => {
          onReset();
          setConfirming(false);
        }}
        className="rounded-full bg-[var(--primary-color)] px-3 py-1 font-bold uppercase tracking-wide text-white"
      >
        Reset
      </button>

      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="font-bold uppercase tracking-wide text-[#8b88b1] duration-300 hover:text-[var(--title-color)]"
      >
        Cancel
      </button>
    </span>
  );
};

const chip =
  "flex items-center gap-x-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide duration-300";

const GLIDE = "cubic-bezier(0.22, 1, 0.36, 1)";

const calm = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Fill = ({
  solved,
  missed,
  total,
}: {
  solved: number;
  missed: number;
  total: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const crestRef = useRef<HTMLSpanElement>(null);
  const swellRef = useRef<HTMLSpanElement>(null);
  const was = useRef(solved + missed);
  const done = solved + missed;
  const level = total ? (done / total) * 100 : 0;
  const crest =
    missed > 0 ? "bg-[hsla(353,100%,65%,0.5)]" : "bg-[rgba(68,215,182,0.55)]";

  useEffect(() => {
    if (!done || calm()) return;
    const spin = (node: HTMLSpanElement | null, ms: number, back: boolean) =>
      node?.animate(
        [
          { transform: `translateX(-50%) rotate(${back ? 360 : 0}deg)` },
          { transform: `translateX(-50%) rotate(${back ? 0 : 360}deg)` },
        ],
        { duration: ms, iterations: Infinity, easing: "linear" },
      );

    const a = spin(crestRef.current, 6200, false);
    const b = spin(swellRef.current, 9400, true);
    return () => {
      a?.cancel();
      b?.cancel();
    };
  }, [done]);

  useEffect(() => {
    if (was.current === done) return;
    const rising = done > was.current;
    was.current = done;
    const body = ref.current;
    if (!body || !rising || calm()) return;

    const slosh = body.animate(
      [
        { transform: "rotate(0deg) translateY(7%)" },
        { transform: "rotate(-2.6deg) translateY(-3%)", offset: 0.26 },
        { transform: "rotate(2deg) translateY(1.5%)", offset: 0.54 },
        { transform: "rotate(-0.9deg) translateY(-0.5%)", offset: 0.78 },
        { transform: "rotate(0deg) translateY(0)" },
      ],
      { duration: 1100, easing: "ease-out" },
    );

    return () => slosh.cancel();
  }, [done]);

  if (!total) return null;

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
    >
      <span
        ref={ref}
        style={{ height: `${level}%` }}
        className="absolute -inset-x-1 bottom-0 flex origin-bottom flex-col-reverse transition-[height] duration-[900ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]"
      >
        <span
          style={{ flexGrow: solved }}
          className="w-full bg-[rgba(68,215,182,0.55)]"
        />
        <span
          style={{ flexGrow: missed }}
          className="w-full bg-[hsla(353,100%,65%,0.5)]"
        />

        {done > 0 && (
          <span className="absolute inset-x-0 -top-[6px] h-[10px] overflow-hidden">
            <span
              ref={swellRef}
              style={{ top: "2px", borderRadius: "38% 62% 44% 56%" }}
              className={`absolute left-1/2 h-[3.5rem] w-[3.5rem] -translate-x-1/2 opacity-55 ${crest}`}
            />
            <span
              ref={crestRef}
              style={{ top: "4px", borderRadius: "58% 42% 63% 37%" }}
              className={`absolute left-1/2 h-[3.25rem] w-[3.25rem] -translate-x-1/2 ${crest}`}
            />
          </span>
        )}
      </span>
    </span>
  );
};

const Count = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || calm()) return;
    const animation = node.animate(
      [
        { opacity: 0, transform: "translateX(-8px)" },
        { opacity: 1, transform: "translateX(0)" },
      ],
      { duration: 560, easing: GLIDE },
    );
    return () => animation.cancel();
  }, []);

  return (
    <span ref={ref} className="font-normal normal-case">
      {children}
    </span>
  );
};

const Chip = ({
  on,
  tone,
  onPick,
  children,
  disabled,
}: {
  on: boolean;
  tone: string;
  onPick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const was = useRef(on);

  useEffect(() => {
    if (was.current === on) return;
    was.current = on;
    const node = ref.current;
    if (!node || !on || calm()) return;
    const animation = node.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.06)" },
        { transform: "scale(1)" },
      ],
      { duration: 620, easing: GLIDE },
    );
    return () => animation.cancel();
  }, [on]);

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={onPick}
      aria-pressed={on}
      className={`${chip} ${
        on
          ? tone
          : "bg-[var(--container-color)] hover:text-[var(--title-color)]"
      }`}
    >
      {children}
    </button>
  );
};

const ChapterSet = ({
  chapters,
  active,
  results,
  current,
  lens,
  onRun,
  noun,
  labelFor,
  picker = "grid",
  progressOf,
  total,
  left,
  onStart,
  onReset,
}: {
  chapters: ChapterType[];
  active: PickType | null;
  results: Record<string, ResultType>;
  current: string | null;
  lens: LensType;
  onRun: (next: LensType) => void;
  noun: string;
  labelFor: (chapter: ChapterType) => string;
  picker?: "grid" | "select";
  progressOf: (id: string) => { solved: number; missed: number; total: number };
  total: number;
  left: number;
  onStart: (pick: PickType, at: number) => void;
  onReset: () => void;
}) => {
  const [open, setOpen] = useState<string | null>(null);
  const [arrow, setArrow] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const tiles = useRef(new Map<string, HTMLButtonElement>());

  const place = useCallback((id: string) => {
    const tile = tiles.current.get(id);
    const grid = gridRef.current;
    if (!tile || !grid) return;
    const box = tile.getBoundingClientRect();
    const frame = grid.getBoundingClientRect();
    setArrow(box.left - frame.left + box.width / 2);
  }, []);

  useEffect(() => {
    if (open === null) return;
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new ResizeObserver(() => place(open));
    observer.observe(grid);
    return () => observer.disconnect();
  }, [open, place]);

  const toggle = (chapter: ChapterType) => {
    if (open === chapter.id) {
      setOpen(null);
      return;
    }
    setOpen(chapter.id);
    place(chapter.id);
  };

  const ready = chapters.filter((chapter) => chapter.questions.length > 0);
  const banked = ready.reduce(
    (sum, chapter) => sum + chapter.questions.length,
    0,
  );
  const shown = chapters.find((chapter) => chapter.id === open);

  return (
    <div className="mb-1 rounded-2xl bg-[var(--body-color)] p-5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-xs text-[#8b88b1]">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <Chip
            on={lens === "all"}
            tone="bg-[hsl(219,100%,91%)] text-[var(--title-color)]"
            onPick={() => {
              setOpen(null);
              onRun("all");
            }}
          >
            All
            {lens === "all" && <Count>{total} questions</Count>}
          </Chip>

          <Chip
            on={lens === "incomplete"}
            disabled={left === 0}
            tone="bg-[hsl(38,100%,85%)] text-[var(--title-color)]"
            onPick={() => {
              setOpen(null);
              onRun("incomplete");
            }}
          >
            Incomplete
            {lens === "incomplete" && <Count>{left} left</Count>}
          </Chip>

          {picker === "select" && (
            <span className="relative">
              <select
                value={open ?? ""}
                onChange={(event) => setOpen(event.target.value || null)}
                className="w-44 cursor-pointer appearance-none truncate rounded-full bg-[var(--container-color)] py-1.5 pl-3 pr-8 text-xs font-bold text-[var(--title-color)] outline-none duration-300 focus:ring-2 focus:ring-[var(--primary-color)]"
              >
                <option value="">Choose a skill…</option>
                {chapters.map((chapter) => (
                  <option
                    key={chapter.id}
                    value={chapter.id}
                    disabled={chapter.questions.length === 0}
                  >
                    {chapter.title}
                    {chapter.questions.length
                      ? ` (${chapter.questions.length})`
                      : " — no questions yet"}
                  </option>
                ))}
              </select>
              <LuChevronDown
                aria-hidden
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b88b1]"
              />
            </span>
          )}
        </span>

        <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>
            {lens === "incomplete"
              ? `${chapters.length} ${noun} with questions left`
              : `${ready.length} of ${chapters.length} ${noun} ready`}
          </span>
          <Reset onReset={onReset} />
        </span>
      </div>

      {picker === "select" ? null : (
        <div
          ref={gridRef}
          className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2 p-1"
        >
          {chapters.map((chapter) => {
            const count = chapter.questions.length;
            const here = open === chapter.id;
            const progress = progressOf(chapter.id);
            const wet = progress.solved + progress.missed > 0;
            const isNew = chapter.id === "new";
            const fresh =
              isNew ||
              chapter.questions.some(
                (question) => question.new || question.dailySet,
              );
            return (
              <button
                key={chapter.id}
                ref={(node) => {
                  if (node) tiles.current.set(chapter.id, node);
                  else tiles.current.delete(chapter.id);
                }}
                type="button"
                disabled={!count}
                onClick={() => toggle(chapter)}
                aria-expanded={here}
                title={
                  count
                    ? `${labelFor(chapter)} · ${count} questions${fresh ? " · has new questions" : ""}`
                    : `${labelFor(chapter)} · no questions yet`
                }
                className={`relative h-10 rounded-lg border-2 border-solid text-xs font-bold duration-300 ${
                  isNew
                    ? "motion-safe:animate-tileBounce border-transparent bg-[hsl(38,100%,55%)] text-white"
                    : `bg-[var(--container-color)] ${
                        !count
                          ? "cursor-not-allowed border-transparent text-[#d3d0e4]"
                          : here
                            ? "border-[var(--primary-color)] text-[var(--title-color)]"
                            : active === chapter.id
                              ? "border-[hsl(219,100%,72%)] text-[var(--title-color)]"
                              : wet
                                ? "border-transparent text-[var(--title-color)] hover:border-[hsl(219,100%,80%)]"
                                : "border-transparent text-[#8b88b1] hover:border-[hsl(219,100%,80%)] hover:text-[var(--title-color)]"
                      }`
                }`}
              >
                {fresh && !isNew && <Glow label="Has new questions" />}
                <Fill {...progress} />
                {isNew ? (
                  <span className="relative text-[9px] tracking-wide">NEW</span>
                ) : chapter.members && chapter.members.length > 1 ? (
                  <Flash
                    items={chapter.members.map((member, memberIndex) => (
                      <span key={memberIndex}>{member.chapterNumber}</span>
                    ))}
                  />
                ) : (
                  <span className="relative">{displayNumberOf(chapter)}</span>
                )}
                {count > 0 && (
                  <span className="pointer-events-none absolute -right-1 -top-1 rounded-full bg-[hsl(219,100%,91%)] px-1 text-[9px] leading-[14px] text-[var(--title-color)]">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {shown && (
        <div className="relative mt-6 animate-fadeIn rounded-2xl bg-[var(--container-color)] p-5 shadow-lg">
          {picker === "grid" && (
            <span
              aria-hidden
              style={{ left: `${arrow}px` }}
              className="absolute -top-1.5 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[3px] bg-[var(--container-color)]"
            />
          )}

          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="font-bold text-[var(--title-color)]">
              {labelFor(shown)}
            </span>
            <span className="text-xs text-[#8b88b1]">
              {shown.questions.length} questions
            </span>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-2">
            {shown.questions.map((question, index) => {
              const state = results[question.id];
              const here = current === question.id;
              return (
                <button
                  key={question.id}
                  type="button"
                  title={`Question ${index + 1}`}
                  aria-current={here}
                  onClick={() => onStart(shown.id, index)}
                  className={`relative h-9 rounded-lg text-xs font-bold duration-300 ${
                    here ? "ring-2 ring-[var(--title-color)]" : ""
                  } ${
                    state === "solved"
                      ? "bg-[rgb(68,215,182)] text-white"
                      : state === "missed"
                        ? "bg-[var(--primary-color)] text-white"
                        : "bg-[var(--body-color)] text-[#8b88b1] hover:bg-[hsl(219,100%,91%)] hover:text-[var(--title-color)]"
                  }`}
                >
                  {(question.new || question.dailySet) && !state && (
                    <Glow label="New question" />
                  )}
                  {question.ordinal ?? index + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterSet;
