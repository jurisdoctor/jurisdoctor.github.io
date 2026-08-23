"use client";
import { useEffect, useRef, useState } from "react";
import { ResultType } from "./ChapterSet";
import { isMulti, keysOf, OptionType, QuestionType } from "./Questions";

const SHAKE = [
  { transform: "translateX(0)" },
  { transform: "translateX(-9px)" },
  { transform: "translateX(8px)" },
  { transform: "translateX(-5px)" },
  { transform: "translateX(3px)" },
  { transform: "translateX(0)" },
];
const POP = [
  { transform: "scale(1)" },
  { transform: "scale(1.035)" },
  { transform: "scale(0.995)" },
  { transform: "scale(1)" },
];

const Option = ({
  option,
  chosen,
  answered,
  multi,
  onToggle,
}: {
  option: OptionType;
  chosen: boolean;
  answered: boolean;
  multi: boolean;
  onToggle: (id: string) => void;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const wrongPick = answered && chosen && !option.correct;
  const missed = answered && !chosen && option.correct;
  const won = answered && chosen && option.correct;

  useEffect(() => {
    const node = ref.current;
    if (!node || !answered || !chosen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animation = node.animate(option.correct ? POP : SHAKE, {
      duration: option.correct ? 460 : 520,
      easing: "ease-out",
    });

    return () => animation.cancel();
  }, [answered, chosen, option.correct]);

  const shell = answered
    ? won
      ? "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.12)]"
      : wrongPick
        ? "border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)]"
        : missed
          ? "border-dashed border-[rgb(68,215,182)] bg-[var(--body-color)]"
          : "border-transparent bg-[var(--body-color)] opacity-60"
    : chosen
      ? "border-[hsl(219,100%,72%)] bg-[hsl(219,100%,97%)]"
      : "border-transparent bg-[var(--body-color)] hover:border-[hsl(219,100%,88%)]";

  const badge = answered
    ? won || missed
      ? "bg-[rgb(68,215,182)] text-white"
      : wrongPick
        ? "bg-[var(--primary-color)] text-white"
        : "border-2 border-solid border-[var(--primary-color)] text-[var(--primary-color)]"
    : chosen
      ? "bg-[hsl(219,100%,72%)] text-white"
      : "border-2 border-solid border-[var(--primary-color)] text-[var(--primary-color)]";

  return (
    <div>
      <button
        ref={ref}
        type="button"
        disabled={answered}
        aria-pressed={multi ? chosen : undefined}
        onClick={() => onToggle(option.id)}
        className={`flex w-full items-start gap-x-4 border-2 border-solid p-4 text-left duration-300 ${
          multi ? "rounded-xl" : "rounded-2xl"
        } ${shell}`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold duration-300 ${
            multi ? "rounded-md" : "rounded-full"
          } ${badge}`}
        >
          {option.id}
        </span>

        <span className="min-w-0 flex-1 pt-0.5">{option.text}</span>

        {won && <span className="shrink-0 pt-0.5">✅</span>}
        {wrongPick && <span className="shrink-0 pt-0.5">❌</span>}
        {missed && (
          <span className="shrink-0 rounded-full bg-[rgba(68,215,182,0.18)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--title-color)]">
            Missed
          </span>
        )}
      </button>

      {answered && (
        <p className="ml-11 mt-2 animate-fadeIn text-sm text-[#8b88b1]">
          {option.rationale}
        </p>
      )}
    </div>
  );
};

const Verdict = ({ correct, multi }: { correct: boolean; multi: boolean }) => (
  <div
    className={`mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl p-5 ${
      correct ? "bg-[rgba(68,215,182,0.12)]" : "bg-[hsla(353,100%,65%,0.1)]"
    }`}
  >
    <span
      className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white ${
        correct ? "bg-[rgb(68,215,182)]" : "bg-[var(--primary-color)]"
      }`}
    >
      {correct ? "Correct ✅" : "Not quite"}
    </span>

    <span className="text-lg font-bold text-[var(--title-color)]">
      {correct
        ? multi
          ? "Every one of them, and nothing extra."
          : "That is the one."
        : "Read the rationales below, they explain every option."}
    </span>
  </div>
);

const Aside = ({
  label,
  body,
  italic,
}: {
  label: string;
  body: string;
  italic?: boolean;
}) => (
  <div>
    <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
      {label}
    </span>
    <p className={`mt-1 max-w-[80ch] ${italic ? "italic" : ""}`}>{body}</p>
  </div>
);

const button =
  "inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none";
const ghost =
  "inline-block rounded-[1.875rem] border-[1px] border-solid border-[var(--primary-color)] bg-transparent px-8 py-3 font-bold leading-4 text-[var(--primary-color)] hover:animate-pulse";

const Quiz = ({
  label,
  questions,
  start,
  results,
  onResult,
  onMove,
}: {
  label: string;
  questions: QuestionType[];
  start: number;
  results: Record<string, ResultType>;
  onResult: (id: string, correct: boolean) => void;
  onMove: (at: number) => void;
}) => {
  const [at, setAt] = useState(start);
  const [chosen, setChosen] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);

  const right = questions.filter(
    (entry) => results[entry.id] === "solved",
  ).length;
  const asked = questions.filter((entry) => results[entry.id]).length;

  useEffect(() => {
    onMove(at);
  }, [at, onMove]);

  const question = questions[at];
  if (!question) return null;

  const multi = isMulti(question);
  const keys = keysOf(question);
  const correct =
    chosen.length === keys.length && keys.every((id) => chosen.includes(id));

  const settle = (picks: string[]) => {
    setAnswered(true);
    const hit =
      picks.length === keys.length && keys.every((id) => picks.includes(id));
    onResult(question.id, hit);
  };

  const toggle = (id: string) => {
    if (answered) return;
    if (!multi) {
      setChosen([id]);
      settle([id]);
      return;
    }
    setChosen((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
    );
  };

  const clear = () => {
    setChosen([]);
    setAnswered(false);
  };

  const next = () => {
    if (at + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setAt(at + 1);
    clear();
  };

  const again = () => {
    setAt(start);
    clear();
    setDone(false);
  };

  if (done) {
    const pct = Math.round((right / Math.max(1, asked)) * 100);
    return (
      <div className="animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 text-center shadow-xl">
        <h3 className="mb-2 text-2xl">{label} complete</h3>
        <p className="mb-6 text-lg">
          You scored{" "}
          <span className="font-bold text-[var(--title-color)]">
            {right} of {asked}
          </span>{" "}
          ({pct}%)
        </p>
        <button type="button" onClick={again} className={button}>
          Redo
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 shadow-xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
            {at + 1} of {questions.length}
          </span>
          {multi && (
            <span className="rounded-full bg-[hsl(219,100%,91%)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--title-color)]">
              Select all that apply
            </span>
          )}
          <span className="rounded-full bg-[var(--body-color)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
            {question.topic}
          </span>
          <span className="text-xs uppercase tracking-wide text-[#b6b3ce]">
            {question.difficulty}
          </span>
        </span>

        <span className="text-sm text-[#8b88b1]">
          {right} / {asked}
        </span>
      </div>

      <p className="mb-6 text-lg sm:text-base">{question.stem}</p>

      <div className="mb-6 grid gap-y-3">
        {question.options.map((option) => (
          <Option
            key={option.id}
            option={option}
            chosen={chosen.includes(option.id)}
            answered={answered}
            multi={multi}
            onToggle={toggle}
          />
        ))}
      </div>

      {multi && !answered && (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={!chosen.length}
            onClick={() => settle(chosen)}
            className={button}
          >
            Check answer
          </button>
          <span className="text-sm text-[#8b88b1]">
            {chosen.length} selected
          </span>
        </div>
      )}

      {answered && (
        <div className="animate-fadeIn">
          <Verdict correct={correct} multi={multi} />

          <div className="mb-6 grid gap-y-4 rounded-2xl bg-[var(--body-color)] p-5">
            <Aside label="Takeaway" body={question.takeaway} />
            <Aside label="Strategy" body={question.strategy} italic />
          </div>

          <div className="flex flex-wrap gap-4">
            <button type="button" onClick={next} className={button}>
              {at + 1 >= questions.length ? "See score" : "Next question"}
            </button>
            <button type="button" onClick={clear} className={ghost}>
              Redo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
