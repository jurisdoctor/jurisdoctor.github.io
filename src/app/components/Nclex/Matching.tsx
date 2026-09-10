"use client";
import { useMemo, useRef, useState } from "react";
import { QuestionType, shuffled } from "./Questions";

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

const Matching = ({
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
  const items = question.items ?? [];
  const terms = question.terms ?? [];
  const key = question.answer as unknown as Record<string, string>;
  const deck = useMemo(
    () => shuffled(terms, question.id),
    [question.id, terms],
  );
  const [picks, setPicks] = useState<Record<string, string>>({});
  const frameRef = useRef<HTMLDivElement>(null);

  const termOf = (id?: string) => terms.find((term) => term.id === id);
  const rightFor = (itemId: string) => picks[itemId] === key[itemId];
  const scored = items.filter((item) => rightFor(item.id)).length;
  const full = items.every((item) => picks[item.id]);

  const assign = (itemId: string, termId: string) => {
    if (answered) return;
    setPicks((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((other) => {
        if (next[other] === termId) delete next[other];
      });
      if (termId) next[itemId] = termId;
      else delete next[itemId];
      return next;
    });
  };

  const check = () => {
    const perfect = scored === items.length;
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
      {!answered && question.note && (
        <p className="mb-4 rounded-2xl border-2 border-dashed border-[#d3d0e4] p-4 text-sm text-[#8b88b1]">
          {question.note}
        </p>
      )}

      <div ref={frameRef} className="mb-6 grid gap-y-3">
        {items.map((item) => {
          const chosen = picks[item.id];
          const right = answered && rightFor(item.id);
          const shell = answered
            ? right
              ? "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.12)]"
              : "border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)]"
            : chosen
              ? "border-[hsl(219,100%,72%)] bg-[hsl(219,100%,97%)]"
              : "border-transparent bg-[var(--body-color)]";

          return (
            <div
              key={item.id}
              className={`rounded-xl border-2 border-solid p-4 duration-300 ${shell}`}
            >
              <p className="mb-3 text-sm">{item.text}</p>

              <select
                disabled={answered}
                value={chosen ?? ""}
                onChange={(event) => assign(item.id, event.target.value)}
                aria-label={`Term for ${item.text.slice(0, 40)}`}
                className="w-full rounded-xl border-2 border-solid border-[#d3d0e4] bg-[var(--container-color)] p-3 text-sm text-[var(--text-color)] outline-none disabled:opacity-70"
              >
                <option value="">Choose a term</option>
                {deck.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.text}
                  </option>
                ))}
              </select>

              {answered && (
                <div className="mt-2 animate-fadeIn text-sm">
                  {!right && (
                    <p className="font-bold text-[var(--title-color)]">
                      Correct term: {termOf(key[item.id])?.text}
                    </p>
                  )}
                  <p className="mt-1 text-[#8b88b1]">{item.rationale}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {answered ? (
        <p className="animate-fadeIn rounded-2xl bg-[var(--body-color)] p-4 text-center">
          <span className="font-bold text-[var(--title-color)]">
            {scored} of {items.length}
          </span>{" "}
          matched correctly.
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
            {Object.keys(picks).length} of {items.length} matched
          </span>
        </div>
      )}
    </div>
  );
};

export default Matching;
