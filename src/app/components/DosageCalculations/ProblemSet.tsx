"use client";
import { useEffect, useRef, useState } from "react";
import Reset from "./Reset";

export type Status = "answering" | "solved" | "missed";

export const GOLD = "hsl(43, 100%, 52%)";
export const BLUE = "rgb(64, 132, 255)";

export interface MarkType {
  char: string;
  tone: string;
  group: string;
}

export const MARKS: Record<string, MarkType> = {
  star: { char: "★", tone: "text-[hsl(43,100%,52%)]", group: "extra" },
  star2: { char: "★", tone: "text-[rgb(64,132,255)]", group: "extra" },
  skull: { char: "💀", tone: "", group: "difficult" },
};

const TwinStar = () => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const star = ref.current;
    if (!star) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animation = star.animate([{ color: GOLD }, { color: BLUE }], {
      duration: 1600,
      iterations: Infinity,
      direction: "alternate",
      easing: "ease-in-out",
    });

    return () => animation.cancel();
  }, []);

  return (
    <span ref={ref} style={{ color: GOLD }}>
      ★
    </span>
  );
};

const FILTERS = [
  { key: "all", label: "All", tone: "" },
  { key: "solved", label: "Correct", tone: "bg-[rgb(68,215,182)]" },
  { key: "missed", label: "Missed", tone: "bg-[var(--primary-color)]" },
  { key: "todo", label: "Not done", tone: "bg-[var(--container-color)]" },
  { key: "extra", label: "Extra", tone: "" },
  { key: "difficult", label: "Difficult", tone: "" },
];

const matches = (key: string, state?: Status, group?: string) => {
  if (key === "solved") return state === "solved";
  if (key === "missed") return state === "missed";
  if (key === "todo") return !state;
  return group === key;
};

const ProblemSet = ({
  total,
  position,
  done,
  marks,
  onPick,
  onReset,
}: {
  total: number;
  position: number;
  done: Record<string, Status>;
  marks?: (index: number) => MarkType | undefined;
  onPick: (index: number) => void;
  onReset: () => void;
}) => {
  const [filter, setFilter] = useState<string | null>(null);

  const every = Array.from({ length: total }, (_, index) => index);
  const shown = filter
    ? every.filter((index) =>
        matches(filter, done[index], marks?.(index)?.group),
      )
    : every;

  const offered = FILTERS.filter(
    (entry) => marks || (entry.key !== "extra" && entry.key !== "difficult"),
  );

  return (
    <div className="mb-6 animate-fadeIn rounded-2xl bg-[var(--body-color)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-xs text-[#8b88b1]">
        <span className="flex flex-wrap items-center gap-x-1 gap-y-2">
          {offered.map((entry) => {
            const on = entry.key === "all" ? !filter : filter === entry.key;
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() =>
                  setFilter(on || entry.key === "all" ? null : entry.key)
                }
                aria-pressed={on}
                className={`flex items-center gap-x-2 rounded-full px-3 py-1 duration-300 ${
                  on
                    ? "bg-[hsl(219,100%,91%)] font-bold text-[var(--title-color)]"
                    : "hover:text-[var(--title-color)]"
                }`}
              >
                {entry.key === "all" ? null : entry.key === "extra" ? (
                  <TwinStar />
                ) : entry.key === "difficult" ? (
                  <span>💀</span>
                ) : (
                  <span
                    className={`h-3 w-3 rounded-full ring-1 ring-inset ring-black/15 ${entry.tone}`}
                  />
                )}
                {entry.label}
              </button>
            );
          })}
        </span>
      </div>

      <div
        className={`mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#8b88b1] ${
          filter ? "justify-between" : "justify-start"
        }`}
      >
        {filter && (
          <span>
            Showing {shown.length} of {total}.
          </span>
        )}

        <Reset onReset={onReset} />
      </div>

      <div className="grid max-h-72 grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-2 overflow-y-auto p-1">
        {shown.map((index) => {
          const state = done[index];
          const here = position === index;
          const badge = marks?.(index);
          return (
            <button
              key={index}
              type="button"
              onClick={() => onPick(index)}
              title={`Question ${index + 1}`}
              aria-current={here}
              className={`relative h-9 rounded-lg text-xs font-bold duration-300 ${
                here ? "ring-2 ring-[var(--title-color)]" : ""
              } ${
                state === "solved"
                  ? "bg-[rgb(68,215,182)] text-white"
                  : state === "missed"
                    ? "bg-[var(--primary-color)] text-white"
                    : "bg-[var(--container-color)] text-[#8b88b1] hover:text-[var(--title-color)]"
              }`}
            >
              {index + 1}
              {badge && (
                <span
                  className={`pointer-events-none absolute -right-1 -top-1 text-[10px] leading-none ${badge.tone}`}
                >
                  {badge.char}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {shown.length === 0 && (
        <p className="mt-3 text-sm text-[#8b88b1]">
          Nothing in that group yet.
        </p>
      )}
    </div>
  );
};

export default ProblemSet;
