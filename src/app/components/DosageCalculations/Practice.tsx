"use client";
import { useRef, useState } from "react";
import { FamilyType, Ladders, numeric, Rules, RuleType } from "./Data";
interface WorkType {
  givenValue: string;
  givenUnit: string;
  topValue: string;
  topUnit: string;
  bottomValue: string;
  bottomUnit: string;
  answerValue: string;
  answerUnit: string;
}
interface QuestionType {
  group: string;
  family: FamilyType;
  given: string;
  unit: string;
  answer: number;
  work: WorkType;
}
type Status = "answering" | "solved" | "missed";
const format = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(n);
const tidy = (n: number) => Math.round(n * 1e6) / 1e6;
const buildQuestion = (previous?: QuestionType): QuestionType => {
  const rule: RuleType = Rules[Math.floor(Math.random() * Rules.length)];
  const step = rule.steps[Math.floor(Math.random() * rule.steps.length)];
  const flipped = Math.random() < 0.5;
  const from = flipped ? rule.to : rule.from;
  const to = flipped ? rule.from : rule.to;
  const givenValue = format(tidy(from.value * step));
  const answer = tidy(to.value * step);
  const question: QuestionType = {
    group: rule.group,
    family: rule.family,
    given: `${givenValue} ${from.unit}`,
    unit: to.unit,
    answer,
    work: {
      givenValue,
      givenUnit: from.unit,
      topValue: format(to.value),
      topUnit: to.unit,
      bottomValue: format(from.value),
      bottomUnit: from.unit,
      answerValue: format(answer),
      answerUnit: to.unit,
    },
  };
  if (previous && previous.given === question.given) {
    return buildQuestion(previous);
  }
  return question;
};
const mentions = (key: string, unit: string) =>
  new RegExp(`(^|[\\s=])${unit.replace("/", "\\/")}($|\\s|,)`).test(key);
const relevant = (keys: string[], units: string[]) => {
  const both = keys.filter((key) => units.every((unit) => mentions(key, unit)));
  return both.length
    ? both
    : keys.filter((key) => units.some((unit) => mentions(key, unit)));
};
const Help = ({ family, units }: { family: FamilyType; units: string[] }) => {
  const ladder = Ladders.find((l) => l.family === family);
  if (!ladder) return null;
  const keys = relevant(ladder.keys, units);
  if (!keys.length && !ladder.chain) return null;
  return (
    <div className="mt-5 rounded-2xl bg-[var(--body-color)] p-5">
      <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
        {ladder.chain ? `${ladder.title} ladder` : `${ladder.title} equalities`}
      </span>

      {ladder.chain && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-bold text-[var(--title-color)] sm:text-sm">
          {ladder.chain.map((rung, id) => (
            <span key={rung} className="flex items-center gap-x-2">
              {id > 0 && (
                <span className="font-normal text-[var(--primary-color)]">
                  =
                </span>
              )}
              {rung}
            </span>
          ))}
        </div>
      )}

      {keys.length > 0 && (
        <div className="mt-3 grid gap-y-1">
          {keys.map((key) => (
            <span key={key} className="text-sm">
              {key}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
const Cancelled = ({ unit }: { unit: string }) => (
  <span className="relative inline-block">
    {unit}
    <span className="absolute left-0 top-1/2 h-[2px] w-full animate-strike bg-[var(--primary-color)] motion-reduce:animate-none" />
  </span>
);
const Work = ({ work }: { work: WorkType }) => (
  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-lg sm:text-base">
    <span>
      {work.givenValue} <Cancelled unit={work.givenUnit} />
    </span>

    <span className="text-[#8b88b1]">×</span>

    <span className="inline-flex flex-col text-center leading-tight">
      <span className="px-3 pb-1">
        {work.topValue} {work.topUnit}
      </span>
      <span className="border-t border-solid border-[var(--text-color)] px-3 pt-1">
        {work.bottomValue} <Cancelled unit={work.bottomUnit} />
      </span>
    </span>

    <span className="text-[#8b88b1]">=</span>

    <span className="font-bold text-[var(--title-color)]">
      {work.answerValue} {work.answerUnit}
    </span>
  </div>
);
const Practice = () => {
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [entry, setEntry] = useState("");
  const [status, setStatus] = useState<Status>("answering");
  const [score, setScore] = useState({ right: 0, asked: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const start = () => {
    setQuestion(buildQuestion());
    setEntry("");
    setStatus("answering");
    setScore({ right: 0, asked: 0 });
  };
  const next = () => {
    setQuestion((prev) => buildQuestion(prev ?? undefined));
    setEntry("");
    setStatus("answering");
    inputRef.current?.focus();
  };
  const check = () => {
    if (!question) return;
    const given = Number(entry.replace(/,/g, "").trim());
    if (entry.trim() === "" || Number.isNaN(given)) return;
    const isRight = Math.abs(tidy(given) - question.answer) < 1e-6;
    setStatus(isRight ? "solved" : "missed");
    setScore((prev) => ({
      right: prev.right + (isRight ? 1 : 0),
      asked: prev.asked + 1,
    }));
    inputRef.current?.focus();
  };
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "answering") {
      check();
    } else {
      next();
    }
  };
  const button =
    "inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse";
  return (
    <section className="mb-8" id="practice">
      <h2 className="relative mb-8 ml-3.5 text-3xl font-bold lg:ml-0 lg:text-center">
        Practice
      </h2>

      <div className="mx-auto max-w-[600px] animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 shadow-xl">
        {!question ? (
          <div className="text-center">
            <p className="mb-6">
              Work through the conversions above one at a time. Miss one and it
              gets worked out for you.
            </p>
            <button type="button" onClick={start} className={button}>
              Start 🧮
            </button>
          </div>
        ) : (
          <form method="dialog" onSubmit={onSubmit}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
                {question.group}
              </span>
              <span className="text-sm text-[#8b88b1]">
                {score.right} / {score.asked}
              </span>
            </div>

            <h3 className="mb-6 text-2xl sm:text-xl">
              {question.given} = ______ {question.unit}
            </h3>

            <div className="mb-4 flex items-center gap-x-4 sm:flex-col sm:items-stretch sm:gap-y-4">
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={entry}
                readOnly={status !== "answering"}
                onChange={(e) => setEntry(numeric(e.target.value))}
                placeholder={`Answer in ${question.unit}`}
                className={`h-14 w-full min-w-0 flex-1 rounded-2xl border-none bg-[var(--body-color)] px-[1.875rem] py-[0.625rem] text-[var(--text-color)] shadow-inner outline-none sm:flex-none ${status === "answering" ? "" : "opacity-60"}`}
              />

              <button type="submit" className={`${button} shrink-0`}>
                {status === "answering" ? "Check" : "Next"}
              </button>
            </div>

            {status !== "answering" && (
              <div className="animate-fadeIn">
                <div
                  className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl p-5 ${
                    status === "solved"
                      ? "bg-[rgba(68,215,182,0.12)]"
                      : "bg-[hsla(353,100%,65%,0.1)]"
                  }`}
                >
                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white ${
                      status === "solved"
                        ? "bg-[rgb(68,215,182)]"
                        : "bg-[var(--primary-color)]"
                    }`}
                  >
                    {status === "solved" ? "Correct ✅" : "Not quite"}
                  </span>

                  <span className="text-lg font-bold text-[var(--title-color)]">
                    {format(question.answer)} {question.unit}
                  </span>
                </div>

                {status === "missed" && (
                  <>
                    <Work work={question.work} />
                    <Help
                      family={question.family}
                      units={[question.work.givenUnit, question.unit]}
                    />
                  </>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  );
};
export default Practice;
