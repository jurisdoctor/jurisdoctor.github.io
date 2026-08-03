"use client";
import { useRef, useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { FamilyType, Ladders, numeric, Rules, RuleType } from "./Data";
import ProblemSet from "./ProblemSet";
import { useSaved } from "./Saved";
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
interface SavedType {
  position: number;
  entry: string;
  status: Status;
  done: Record<string, Status>;
}
const format = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(n);
const tidy = (n: number) => Math.round(n * 1e6) / 1e6;
const makeQuestion = (
  rule: RuleType,
  step: number,
  flipped: boolean,
): QuestionType => {
  const from = flipped ? rule.to : rule.from;
  const to = flipped ? rule.from : rule.to;
  const givenValue = format(tidy(from.value * step));
  const answer = tidy(to.value * step);
  return {
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
};
const Questions: QuestionType[] = Rules.flatMap((rule) =>
  rule.steps.flatMap((step) => [
    makeQuestion(rule, step, false),
    makeQuestion(rule, step, true),
  ]),
);
const mentions = (key: string, unit: string) =>
  new RegExp(`(^|[\\s=])${unit.replace("/", "\\/")}($|\\s|,)`).test(key);
const relevant = (keys: string[], units: string[]) => {
  const both = keys.filter((key) => units.every((unit) => mentions(key, unit)));
  return both.length
    ? both
    : keys.filter((key) => units.some((unit) => mentions(key, unit)));
};
const Help = ({
  family,
  units,
  group,
}: {
  family: FamilyType;
  units: string[];
  group: string;
}) => {
  const ladder = Ladders.find((l) => l.family === family);
  if (!ladder) return null;
  const keys = relevant(ladder.keys, units);
  const chain = group === "Metric" ? ladder.chain : undefined;
  if (!keys.length && !chain) return null;
  return (
    <div className="mt-5 rounded-2xl bg-[var(--body-color)] p-5">
      <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
        {chain ? `${ladder.title} ladder` : `${ladder.title} equalities`}
      </span>

      {chain && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-bold text-[var(--title-color)] sm:text-sm">
          {chain.map((rung, id) => (
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
const KEY = "dosage:practice:v2";
const fresh = (): SavedType => ({
  position: 0,
  entry: "",
  status: "answering",
  done: {},
});
const valid = (saved: SavedType) =>
  !!saved &&
  !!saved.done &&
  typeof saved.done === "object" &&
  Number.isInteger(saved.position) &&
  saved.position >= 0 &&
  saved.position < Questions.length;
const Practice = () => {
  const [saved, setSaved] = useSaved(KEY, fresh, valid);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const question = Questions[saved.position];
  const asked = Object.keys(saved.done).length;
  const right = Object.values(saved.done).filter(
    (state) => state === "solved",
  ).length;
  const jump = (index: number) => {
    setSaved((prev) => ({
      ...prev,
      position: index,
      entry: "",
      status: "answering",
    }));
    inputRef.current?.focus();
  };
  const reset = () => setSaved(fresh());
  const next = () => {
    setSaved((prev) => ({
      ...prev,
      position: (prev.position + 1) % Questions.length,
      entry: "",
      status: "answering",
    }));
    inputRef.current?.focus();
  };
  const retry = () => {
    setSaved((prev) => ({ ...prev, entry: "", status: "answering" }));
    inputRef.current?.focus();
  };
  const check = () => {
    if (!question) return;
    const given = Number(saved.entry.replace(/,/g, "").trim());
    if (saved.entry.trim() === "" || Number.isNaN(given)) return;
    const isRight = Math.abs(tidy(given) - question.answer) < 1e-6;
    setSaved((prev) => ({
      ...prev,
      status: isRight ? "solved" : "missed",
      done: { ...prev.done, [prev.position]: isRight ? "solved" : "missed" },
    }));
    inputRef.current?.focus();
  };
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saved.status === "answering") {
      check();
    } else {
      next();
    }
  };
  const button =
    "inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse";
  const ghost =
    "inline-block rounded-[1.875rem] border-[1px] border-solid border-[var(--primary-color)] bg-transparent px-8 py-3 font-bold leading-4 text-[var(--primary-color)] hover:animate-pulse";
  return (
    <section className="mb-8" id="practice">
      <h2 className="relative mb-8 ml-3.5 text-3xl font-bold lg:ml-0 lg:text-center">
        Practice
      </h2>

      <div className="mx-auto max-w-[600px] animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 shadow-xl">
        <form method="dialog" onSubmit={onSubmit}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
                {saved.position + 1} of {Questions.length}
              </span>

              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                className={`flex items-center gap-x-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide duration-300 ${
                  open
                    ? "bg-[var(--primary-color)] text-white"
                    : "bg-[var(--body-color)] text-[#8b88b1] hover:text-[var(--title-color)]"
                }`}
              >
                Problem set
                <LuChevronDown
                  className={`duration-300 ${open ? "rotate-180" : ""}`}
                />
              </button>
            </span>

            <span className="text-sm text-[#8b88b1]">
              {right} / {asked}
            </span>
          </div>

          {open && (
            <ProblemSet
              total={Questions.length}
              position={saved.position}
              done={saved.done}
              onPick={jump}
              onReset={reset}
            />
          )}

          <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
            {question.group}
          </span>

          <h3 className="mb-6 mt-1 text-2xl sm:text-xl">
            {question.given} = ______ {question.unit}
          </h3>

          <div className="mb-4 flex items-center gap-x-4 sm:flex-col sm:items-stretch sm:gap-y-4">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={saved.entry}
              readOnly={saved.status !== "answering"}
              onChange={(e) =>
                setSaved((prev) => ({
                  ...prev,
                  entry: numeric(e.target.value),
                }))
              }
              placeholder={`Answer in ${question.unit}`}
              className={`h-14 w-full min-w-0 flex-1 rounded-2xl border-none bg-[var(--body-color)] px-[1.875rem] py-[0.625rem] text-[var(--text-color)] shadow-inner outline-none sm:flex-none ${saved.status === "answering" ? "" : "opacity-60"}`}
            />

            {saved.status === "missed" && (
              <button
                type="button"
                onClick={retry}
                className={`${ghost} shrink-0`}
              >
                Try again
              </button>
            )}

            <button type="submit" className={`${button} shrink-0`}>
              {saved.status === "answering" ? "Check" : "Next"}
            </button>
          </div>

          {saved.status !== "answering" && (
            <div className="animate-fadeIn">
              <div
                className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl p-5 ${
                  saved.status === "solved"
                    ? "bg-[rgba(68,215,182,0.12)]"
                    : "bg-[hsla(353,100%,65%,0.1)]"
                }`}
              >
                <span
                  className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white ${
                    saved.status === "solved"
                      ? "bg-[rgb(68,215,182)]"
                      : "bg-[var(--primary-color)]"
                  }`}
                >
                  {saved.status === "solved" ? "Correct ✅" : "Not quite"}
                </span>

                <span className="text-lg font-bold text-[var(--title-color)]">
                  {format(question.answer)} {question.unit}
                </span>
              </div>

              {saved.status === "missed" && (
                <>
                  <Work work={question.work} />
                  <Help
                    family={question.family}
                    units={[question.work.givenUnit, question.unit]}
                    group={question.group}
                  />
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
};
export default Practice;
