"use client";
import Reset from "./Reset";

export type Status = "answering" | "solved" | "missed";

const Legend = ({ tone, label }: { tone: string; label: string }) => (
  <span className="flex items-center gap-x-2">
    <span className={`h-3 w-3 rounded-full ${tone}`} />
    {label}
  </span>
);

const ProblemSet = ({
  total,
  position,
  done,
  onPick,
  onReset,
}: {
  total: number;
  position: number;
  done: Record<string, Status>;
  onPick: (index: number) => void;
  onReset: () => void;
}) => (
  <div className="mb-6 animate-fadeIn rounded-2xl bg-[var(--body-color)] p-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-xs text-[#8b88b1]">
      <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Legend tone="bg-[rgb(68,215,182)]" label="Correct" />
        <Legend tone="bg-[var(--primary-color)]" label="Missed" />
        <Legend tone="bg-[var(--container-color)]" label="Not done" />
      </span>

      <Reset onReset={onReset} />
    </div>

    <div className="grid max-h-72 grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-2 overflow-y-auto p-1">
      {Array.from({ length: total }, (_, index) => {
        const state = done[index];
        const here = position === index;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onPick(index)}
            title={`Question ${index + 1}`}
            aria-current={here}
            className={`h-9 rounded-lg text-xs font-bold duration-300 ${
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
          </button>
        );
      })}
    </div>
  </div>
);

export default ProblemSet;
