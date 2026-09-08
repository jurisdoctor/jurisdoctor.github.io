"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChapterType, labelOf } from "./Questions";

export type PickType = string;
export type ResultType = "solved" | "missed";

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

const ChapterSet = ({
  chapters,
  active,
  results,
  current,
  onStart,
  onReset,
}: {
  chapters: ChapterType[];
  active: PickType | null;
  results: Record<string, ResultType>;
  current: string | null;
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
    <div className="mb-8 rounded-2xl bg-[var(--body-color)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-xs text-[#8b88b1]">
        <button
          type="button"
          onClick={() => {
            setOpen(null);
            onStart("all", 0);
          }}
          aria-pressed={active === "all"}
          className={`${chip} ${
            active === "all"
              ? "bg-[hsl(219,100%,91%)] text-[var(--title-color)]"
              : "bg-[var(--container-color)] hover:text-[var(--title-color)]"
          }`}
        >
          All
          <span className="font-normal normal-case">{banked} questions</span>
        </button>

        <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>
            {ready.length} of {chapters.length} chapters ready
          </span>
          <Reset onReset={onReset} />
        </span>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2 p-1"
      >
        {chapters.map((chapter) => {
          const count = chapter.questions.length;
          const here = open === chapter.id;
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
                  ? `${labelOf(chapter)} · ${count} questions`
                  : `${labelOf(chapter)} · no questions yet`
              }
              className={`relative h-10 rounded-lg text-xs font-bold duration-300 ${
                active === chapter.id ? "ring-2 ring-[hsl(219,100%,72%)]" : ""
              } ${
                !count
                  ? "cursor-not-allowed bg-[var(--container-color)] text-[#d3d0e4]"
                  : here
                    ? "bg-[hsl(353,100%,93%)] text-[var(--title-color)]"
                    : active === chapter.id
                      ? "bg-[hsl(219,100%,91%)] text-[var(--title-color)]"
                      : "bg-[var(--container-color)] text-[#8b88b1] hover:text-[var(--title-color)]"
              }`}
            >
              {chapter.id}
              {count > 0 && (
                <span className="pointer-events-none absolute -right-1 -top-1 rounded-full bg-[hsl(219,100%,91%)] px-1 text-[9px] leading-[14px] text-[var(--title-color)]">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {shown && (
        <div className="relative mt-4 animate-fadeIn rounded-2xl bg-[var(--container-color)] p-5 shadow-lg">
          <span
            aria-hidden
            style={{ left: `${arrow}px` }}
            className="absolute -top-1.5 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[3px] bg-[var(--container-color)]"
          />

          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="font-bold text-[var(--title-color)]">
              {labelOf(shown)}
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
                  title={question.topic}
                  aria-current={here}
                  onClick={() => onStart(shown.id, index)}
                  className={`h-9 rounded-lg text-xs font-bold duration-300 ${
                    here ? "ring-2 ring-[var(--title-color)]" : ""
                  } ${
                    state === "solved"
                      ? "bg-[rgb(68,215,182)] text-white"
                      : state === "missed"
                        ? "bg-[var(--primary-color)] text-white"
                        : "bg-[var(--body-color)] text-[#8b88b1] hover:bg-[hsl(219,100%,91%)] hover:text-[var(--title-color)]"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-[#8b88b1]">
        The badge is the number of questions banked. Dimmed chapters have none
        yet.
      </p>
    </div>
  );
};

export default ChapterSet;
