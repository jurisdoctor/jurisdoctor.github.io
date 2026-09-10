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

const Ordered = ({
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
  const order = Array.isArray(question.answer) ? question.answer : [];
  const deck = useMemo(
    () => shuffled(question.options, question.id),
    [question.id, question.options],
  );
  const [placed, setPlaced] = useState<string[]>([]);
  const [held, setHeld] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const optionOf = (id: string) =>
    question.options.find((option) => option.id === id);

  const rightAt = (index: number) => placed[index] === order[index];
  const scored = placed.filter((_, index) => rightAt(index)).length;
  const full = placed.length === order.length;

  const drop = (id: string) => {
    if (answered) return;
    setPlaced((prev) =>
      prev.includes(id) || prev.length >= order.length ? prev : [...prev, id],
    );
    setHeld(null);
  };

  const lift = (id: string) => {
    if (answered) return;
    setPlaced((prev) => prev.filter((entry) => entry !== id));
  };

  const check = () => {
    const perfect = placed.every((id, index) => id === order[index]);
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
    setPlaced([]);
    setHeld(null);
    onClear();
  };

  const pool = deck.filter((option) => !placed.includes(option.id));

  return (
    <div className="mb-6">
      {!answered && question.note && (
        <p className="mb-4 rounded-2xl border-2 border-dashed border-[#d3d0e4] p-4 text-sm text-[#8b88b1]">
          {question.note}
        </p>
      )}

      <div ref={frameRef} className="mb-6 grid gap-y-2">
        {order.map((_, index) => {
          const id = placed[index];
          const option = id ? optionOf(id) : undefined;
          const right = answered && rightAt(index);
          const shell = answered
            ? right
              ? "border-solid border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.12)]"
              : "border-solid border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)]"
            : option
              ? "border-solid border-[hsl(219,100%,72%)] bg-[hsl(219,100%,97%)]"
              : held
                ? "border-dashed border-[hsl(219,100%,80%)] bg-[var(--body-color)]"
                : "border-dashed border-[#d3d0e4] bg-[var(--body-color)]";

          return (
            <div key={index} className="flex items-stretch gap-x-3">
              <span
                className={`flex h-auto w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  answered && option
                    ? right
                      ? "bg-[rgb(68,215,182)] text-white"
                      : "bg-[var(--primary-color)] text-white"
                    : "bg-[var(--body-color)] text-[#8b88b1]"
                }`}
              >
                {index + 1}
              </span>

              <button
                type="button"
                disabled={answered || !option}
                onClick={() => id && lift(id)}
                onDragOver={(event) => {
                  if (answered || option) return;
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (answered || option || !held) return;
                  drop(held);
                }}
                className={`flex min-h-[3.5rem] flex-1 items-center rounded-xl border-2 p-3 text-left text-sm duration-300 ${shell}`}
              >
                {option ? (
                  <span>
                    {option.text}
                    {answered && !right && (
                      <span className="ml-2 text-xs font-bold uppercase tracking-wide text-[var(--primary-color)]">
                        belongs at {order.indexOf(option.id) + 1}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-wide text-[#b6b3ce]">
                    Drop or tap an action
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {!answered && pool.length > 0 && (
        <div className="mb-6 grid gap-y-2">
          <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
            Remaining actions
          </span>
          {pool.map((option) => (
            <button
              key={option.id}
              type="button"
              draggable
              onDragStart={() => setHeld(option.id)}
              onDragEnd={() => setHeld(null)}
              onClick={() => drop(option.id)}
              className="rounded-xl border-2 border-solid border-transparent bg-[var(--body-color)] p-3 text-left text-sm duration-300 hover:border-[hsl(219,100%,88%)]"
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {answered && (
        <div className="mb-6 grid gap-y-2">
          {order.map((id, index) => {
            const option = optionOf(id);
            if (!option) return null;
            return (
              <div
                key={id}
                className="animate-fadeIn rounded-xl bg-[var(--body-color)] p-3 text-sm"
              >
                <span className="font-bold text-[var(--title-color)]">
                  {index + 1}. {option.text}
                </span>
                <p className="mt-1 text-[#8b88b1]">{option.rationale}</p>
              </div>
            );
          })}
        </div>
      )}

      {answered ? (
        <p className="animate-fadeIn rounded-2xl bg-[var(--body-color)] p-4 text-center">
          <span className="font-bold text-[var(--title-color)]">
            {scored} of {order.length}
          </span>{" "}
          in the right position.
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
            {placed.length} of {order.length} placed
          </span>
        </div>
      )}
    </div>
  );
};

export default Ordered;
