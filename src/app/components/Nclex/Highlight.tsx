"use client";
import { useRef, useState } from "react";
import { QuestionType, SegmentType } from "./Questions";

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

const Segment = ({
  segment,
  picked,
  answered,
  onToggle,
}: {
  segment: SegmentType;
  picked: boolean;
  answered: boolean;
  onToggle: () => void;
}) => {
  const shell = answered
    ? picked && segment.correct
      ? "bg-[rgba(68,215,182,0.35)] decoration-[rgb(68,215,182)]"
      : picked && !segment.correct
        ? "bg-[hsla(353,100%,65%,0.22)] line-through decoration-[var(--primary-color)]"
        : segment.correct
          ? "bg-transparent underline decoration-dashed decoration-[rgb(68,215,182)] underline-offset-4"
          : "bg-transparent"
    : picked
      ? "bg-[#fdf06a]"
      : "bg-transparent hover:bg-[hsl(219,100%,93%)]";

  return (
    <button
      type="button"
      disabled={answered}
      aria-pressed={picked}
      onClick={onToggle}
      className={`mr-1 rounded-[3px] px-0.5 text-left duration-200 ${shell} ${
        answered ? "cursor-default" : "cursor-pointer"
      }`}
    >
      {segment.text}
    </button>
  );
};

const Highlight = ({
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
  const segments = question.segments ?? [];
  const [picked, setPicked] = useState<string[]>([]);
  const frameRef = useRef<HTMLDivElement>(null);

  const keys = segments.filter((segment) => segment.correct).map((s) => s.id);
  const cap = question.select;
  const hit = picked.filter((id) => keys.includes(id)).length;
  const miss = picked.length - hit;
  const earned = Math.max(0, hit - miss);

  const toggle = (id: string) => {
    if (answered) return;
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((entry) => entry !== id);
      if (cap && prev.length >= cap) return prev;
      return [...prev, id];
    });
  };

  const check = () => {
    const perfect = hit === keys.length && miss === 0;
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
    setPicked([]);
    onClear();
  };

  return (
    <div className="mb-6">
      {!answered && question.note && (
        <p className="mb-4 rounded-2xl border-2 border-dashed border-[#d3d0e4] p-4 text-sm text-[#8b88b1]">
          {question.note}
        </p>
      )}

      <div
        ref={frameRef}
        className="mb-6 rounded-2xl bg-[var(--body-color)] p-5 leading-9"
      >
        {segments.map((segment) => (
          <Segment
            key={segment.id}
            segment={segment}
            picked={picked.includes(segment.id)}
            answered={answered}
            onToggle={() => toggle(segment.id)}
          />
        ))}
      </div>

      {answered && (
        <div className="mb-6 grid gap-y-3">
          {segments.map((segment) => {
            const took = picked.includes(segment.id);
            if (!took && !segment.correct) return null;
            const tone =
              took && segment.correct
                ? "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.12)]"
                : took
                  ? "border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)]"
                  : "border-dashed border-[rgb(68,215,182)] bg-[var(--body-color)]";
            const label =
              took && segment.correct
                ? "Correct"
                : took
                  ? "Should not be highlighted"
                  : "Missed";

            return (
              <div
                key={segment.id}
                className={`animate-fadeIn rounded-xl border-2 border-solid p-4 ${tone}`}
              >
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--title-color)]">
                  {label}
                </span>
                <p className="mt-1 text-sm">{segment.text}</p>
                <p className="mt-1 text-sm text-[#8b88b1]">
                  {segment.rationale}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {answered ? (
        <p className="animate-fadeIn rounded-2xl bg-[var(--body-color)] p-4 text-center">
          <span className="font-bold text-[var(--title-color)]">
            {hit} of {keys.length}
          </span>{" "}
          highlighted correctly
          {miss > 0 && (
            <>
              , with{" "}
              <span className="font-bold text-[var(--primary-color)]">
                {miss}
              </span>{" "}
              that should not have been
            </>
          )}
          . Plus and minus scoring gives {earned}{" "}
          {earned === 1 ? "point" : "points"}.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={!picked.length}
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
            {picked.length} highlighted
            {cap ? ` of ${cap} requested` : ""}
          </span>
        </div>
      )}
    </div>
  );
};

export default Highlight;
