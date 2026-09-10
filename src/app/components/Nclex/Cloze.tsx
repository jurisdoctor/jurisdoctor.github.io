"use client";
import { Fragment, useRef, useState } from "react";
import { QuestionType } from "./Questions";

const SHAKE = [
  { transform: "translateX(0)" },
  { transform: "translateX(-7px)" },
  { transform: "translateX(6px)" },
  { transform: "translateX(-4px)" },
  { transform: "translateX(0)" },
];
const POP = [
  { transform: "scale(1)" },
  { transform: "scale(1.02)" },
  { transform: "scale(0.998)" },
  { transform: "scale(1)" },
];

const Cloze = ({
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
  const blanks = question.blanks ?? [];
  const [picks, setPicks] = useState<Record<number, string>>({});
  const frameRef = useRef<HTMLDivElement>(null);

  const blankOf = (id: number) => blanks.find((blank) => blank.id === id);
  const keyFor = (id: number) =>
    blankOf(id)?.options.find((option) => option.correct)?.id;
  const rightFor = (id: number) => picks[id] === keyFor(id);
  const scored = blanks.filter((blank) => rightFor(blank.id)).length;
  const full = blanks.every((blank) => picks[blank.id]);

  const parts = (question.sentence ?? "").split(/(\[\[\d+\]\])/g);

  const check = () => {
    const perfect = scored === blanks.length;
    const node = frameRef.current;
    if (
      node &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      node.animate(perfect ? POP : SHAKE, {
        duration: perfect ? 460 : 480,
        easing: "ease-out",
      });
    }
    onSettle(perfect);
  };

  const reset = () => {
    setPicks({});
    onClear();
  };

  return (
    <div className="mb-6">
      <div
        ref={frameRef}
        className="mb-6 rounded-2xl bg-[var(--body-color)] p-5 leading-10"
      >
        {parts.map((part, index) => {
          const hit = part.match(/^\[\[(\d+)\]\]$/);
          if (!hit) return <Fragment key={index}>{part}</Fragment>;

          const id = Number(hit[1]);
          const blank = blankOf(id);
          if (!blank) return <Fragment key={index}>{part}</Fragment>;

          const chosen = picks[id];
          const right = answered && rightFor(id);
          const tone = answered
            ? right
              ? "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.18)]"
              : "border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.14)]"
            : chosen
              ? "border-[hsl(219,100%,72%)] bg-[hsl(219,100%,97%)]"
              : "border-[#d3d0e4] bg-[var(--container-color)]";

          return (
            <select
              key={index}
              disabled={answered}
              value={chosen ?? ""}
              aria-label={`Blank ${id}`}
              onChange={(event) =>
                setPicks((prev) => ({ ...prev, [id]: event.target.value }))
              }
              className={`mx-1 rounded-lg border-2 border-solid px-2 py-1 text-sm text-[var(--text-color)] outline-none duration-300 disabled:opacity-90 ${tone}`}
            >
              <option value="">Select</option>
              {blank.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.text}
                </option>
              ))}
            </select>
          );
        })}
      </div>

      {answered && (
        <div className="mb-6 grid gap-y-3">
          {blanks.map((blank) => {
            const chosen = picks[blank.id];
            const right = rightFor(blank.id);
            return (
              <div
                key={blank.id}
                className={`animate-fadeIn rounded-xl border-2 border-solid p-4 ${
                  right
                    ? "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.12)]"
                    : "border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)]"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
                  Blank {blank.id}
                </span>
                {blank.options.map((option) => {
                  if (!option.correct && option.id !== chosen) return null;
                  return (
                    <p key={option.id} className="mt-1 text-sm">
                      <span className="font-bold text-[var(--title-color)]">
                        {option.text}
                        {option.correct ? " ✅" : " ❌"}
                      </span>
                      <span className="ml-2 text-[#8b88b1]">
                        {option.rationale}
                      </span>
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {answered ? (
        <p className="animate-fadeIn rounded-2xl bg-[var(--body-color)] p-4 text-center">
          <span className="font-bold text-[var(--title-color)]">
            {scored} of {blanks.length}
          </span>{" "}
          blanks correct.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
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
            {Object.values(picks).filter(Boolean).length} of {blanks.length}{" "}
            filled
          </span>
        </div>
      )}
    </div>
  );
};

export default Cloze;
