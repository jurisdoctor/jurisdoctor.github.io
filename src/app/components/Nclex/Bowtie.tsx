"use client";
import { useRef, useState } from "react";
import { OptionType, poolsOf, QuestionType } from "./Questions";

const SHAKE = [
  { transform: "translateX(0)" },
  { transform: "translateX(-7px)" },
  { transform: "translateX(6px)" },
  { transform: "translateX(-4px)" },
  { transform: "translateX(0)" },
];
const POP = [
  { transform: "scale(1)" },
  { transform: "scale(1.03)" },
  { transform: "scale(0.997)" },
  { transform: "scale(1)" },
];

const ORDER = ["actions", "condition", "parameters"];

const sortPools = (entries: [string, { label: string; select: number }][]) =>
  [...entries].sort((a, b) => ORDER.indexOf(a[0]) - ORDER.indexOf(b[0]));

const Connector = ({ flip }: { flip?: boolean }) => (
  <svg
    aria-hidden
    viewBox="0 0 40 100"
    preserveAspectRatio="none"
    className={`h-full w-full self-stretch text-[#d3d0e4] lg:hidden ${
      flip ? "-scale-x-100" : ""
    }`}
  >
    <line
      x1="2"
      y1="24"
      x2="38"
      y2="50"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    <line
      x1="2"
      y1="76"
      x2="38"
      y2="50"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const Slot = ({
  option,
  answered,
  right,
  onRemove,
  onDrop,
  active,
}: {
  option?: OptionType;
  answered: boolean;
  right: boolean;
  onRemove: () => void;
  onDrop: () => void;
  active: boolean;
}) => {
  const [over, setOver] = useState(false);

  const shell = answered
    ? right
      ? "border-solid border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.12)]"
      : "border-solid border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)]"
    : option
      ? "border-solid border-[hsl(219,100%,72%)] bg-[hsl(219,100%,97%)]"
      : over
        ? "border-dashed border-[hsl(219,100%,72%)] bg-[hsl(219,100%,97%)]"
        : active
          ? "border-dashed border-[hsl(219,100%,80%)] bg-[var(--body-color)]"
          : "border-dashed border-[#d3d0e4] bg-[var(--body-color)]";

  return (
    <button
      type="button"
      disabled={answered || !option}
      onClick={onRemove}
      onDragOver={(event) => {
        if (answered || option) return;
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        if (answered || option) return;
        onDrop();
      }}
      className={`flex min-h-[5.5rem] w-full items-center justify-center rounded-2xl border-2 p-3 text-center text-sm duration-300 ${shell}`}
    >
      {option ? (
        <span className="flex flex-col gap-y-1">
          <span>{option.text}</span>
          {answered && (
            <span className="text-xs font-bold uppercase tracking-wide">
              {right ? "Correct" : "Not this one"}
            </span>
          )}
        </span>
      ) : (
        <span className="text-xs uppercase tracking-wide text-[#b6b3ce]">
          Drop or tap a choice
        </span>
      )}
    </button>
  );
};

const Bowtie = ({
  question,
  answered,
  onSettle,
  onClear,
}: {
  question: QuestionType;
  answered: boolean;
  onSettle: (correct: boolean) => void;
  onClear: () => void;
}) => {
  const pools = sortPools(poolsOf(question));
  const [placed, setPlaced] = useState<Record<string, string[]>>({});
  const [held, setHeld] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const optionOf = (key: string, id: string) =>
    question.pools?.[key].options.find((option) => option.id === id);

  const rightIn = (key: string, id: string) => !!optionOf(key, id)?.correct;

  const full = pools.every(
    ([key, pool]) => (placed[key]?.length ?? 0) === pool.select,
  );

  const drop = (key: string, id: string) => {
    if (answered) return;
    setPlaced((prev) => {
      const pool = question.pools?.[key];
      const here = prev[key] ?? [];
      if (!pool || here.includes(id) || here.length >= pool.select) return prev;
      return { ...prev, [key]: [...here, id] };
    });
    setHeld(null);
  };

  const lift = (key: string, id: string) => {
    if (answered) return;
    setPlaced((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((entry) => entry !== id),
    }));
  };

  const tap = (key: string, id: string) => {
    if (answered) return;
    if ((placed[key] ?? []).includes(id)) {
      lift(key, id);
      return;
    }
    drop(key, id);
  };

  const check = () => {
    const hit = pools.every(([key, pool]) => {
      const here = placed[key] ?? [];
      return (
        here.length === pool.select && here.every((id) => rightIn(key, id))
      );
    });

    const node = frameRef.current;
    if (
      node &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      node.animate(hit ? POP : SHAKE, {
        duration: hit ? 460 : 480,
        easing: "ease-out",
      });
    }

    onSettle(hit);
  };

  const reset = () => {
    setPlaced({});
    setHeld(null);
    onClear();
  };

  const column = (key: string, pool: { label: string; select: number }) => {
    const here = placed[key] ?? [];
    return (
      <div className="flex flex-col gap-y-3">
        <span className="text-center text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
          {pool.label}
        </span>
        {Array.from({ length: pool.select }).map((_, index) => {
          const id = here[index];
          const option = id ? optionOf(key, id) : undefined;
          return (
            <Slot
              key={`${key}-${index}`}
              option={option}
              answered={answered}
              right={!!id && rightIn(key, id)}
              active={held !== null && held.startsWith(`${key}:`)}
              onRemove={() => id && lift(key, id)}
              onDrop={() => {
                if (!held) return;
                const [poolKey, optionId] = held.split(":");
                if (poolKey === key) drop(key, optionId);
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="mb-6">
      <div
        ref={frameRef}
        className="mb-6 grid grid-cols-[1fr_2.5rem_1fr_2.5rem_1fr] items-center gap-x-2 gap-y-6 lg:grid-cols-1"
      >
        {column(pools[0][0], pools[0][1])}
        <Connector />
        {column(pools[1][0], pools[1][1])}
        <Connector flip />
        {column(pools[2][0], pools[2][1])}
      </div>

      <div className="grid gap-y-5">
        {pools.map(([key, pool]) => {
          const here = placed[key] ?? [];
          return (
            <div key={key}>
              <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
                {pool.label}
                <span className="ml-2 font-normal normal-case">
                  choose {pool.select}
                </span>
              </span>

              <div className="mt-2 grid gap-y-2">
                {question.pools?.[key].options.map((option) => {
                  const taken = here.includes(option.id);
                  const shell = answered
                    ? option.correct
                      ? "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.12)]"
                      : taken
                        ? "border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)]"
                        : "border-transparent bg-[var(--body-color)] opacity-60"
                    : taken
                      ? "border-[hsl(219,100%,72%)] bg-[hsl(219,100%,97%)]"
                      : "border-transparent bg-[var(--body-color)] hover:border-[hsl(219,100%,88%)]";

                  return (
                    <div key={option.id}>
                      <button
                        type="button"
                        disabled={answered}
                        draggable={!answered}
                        onDragStart={() => setHeld(`${key}:${option.id}`)}
                        onDragEnd={() => setHeld(null)}
                        onClick={() => tap(key, option.id)}
                        aria-pressed={taken}
                        className={`flex w-full items-start gap-x-3 rounded-xl border-2 border-solid p-3 text-left text-sm duration-300 ${shell}`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-solid border-[var(--primary-color)] text-[10px] font-bold text-[var(--primary-color)]">
                          {option.id}
                        </span>
                        <span className="min-w-0 flex-1">{option.text}</span>
                        {answered && option.correct && (
                          <span className="shrink-0">✅</span>
                        )}
                        {answered && !option.correct && taken && (
                          <span className="shrink-0">❌</span>
                        )}
                      </button>

                      {answered && (
                        <p className="ml-9 mt-1 animate-fadeIn text-sm text-[#8b88b1]">
                          {option.rationale}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!answered && (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={!full}
            onClick={check}
            className="inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            Check answer
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs font-bold uppercase tracking-wide text-[#8b88b1] duration-300 hover:text-[var(--primary-color)]"
          >
            Clear
          </button>
          <span className="text-sm text-[#8b88b1]">
            {pools.reduce((sum, [key]) => sum + (placed[key]?.length ?? 0), 0)}{" "}
            of {pools.reduce((sum, [, pool]) => sum + pool.select, 0)} placed
          </span>
        </div>
      )}
    </div>
  );
};

export default Bowtie;
