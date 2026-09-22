"use client";
import { useEffect, useState } from "react";
import { useSaved } from "../DosageCalculations/Saved";
import { ExamId } from "./Bank";
import { ResultType } from "./ChapterSet";

interface LabOptionType {
  id: string;
  text: string;
  correct: boolean;
  rationale: string;
}
interface LabStage1Type {
  prompt: string;
  unit: string;
  question: string;
  options: LabOptionType[];
  answer: string;
}
interface LabStage2Type {
  question: string;
  options: LabOptionType[];
  answer: string[];
}
interface LabItemType {
  id: string;
  section: string;
  sectionName: string;
  unit: string;
  note: string;
  normalRange?: { low: number; high: number; display?: string };
  critical: boolean;
  stage1: LabStage1Type;
  stage2: LabStage2Type;
  takeaway: string;
}
interface LabBankType {
  meta: { title: string; course: string };
  items: LabItemType[];
}

// Some display strings carry inline HTML (subscripts, &middot;) meant for
// rich rendering; plain text nodes can't render that, so flatten it.
const plainText = (html?: string) =>
  (html ?? "")
    .replace(/&middot;/g, "·")
    .replace(/<sub>(.*?)<\/sub>/g, "$1")
    .replace(/<\/?[^>]+>/g, "");

// The ABG items don't carry a single low/high range (pH, PaCO2, and HCO3
// each have their own), so there's nothing to build for those.
const rangeText = (item: LabItemType) => {
  if (!item.normalRange) return null;
  if (item.normalRange.display) return plainText(item.normalRange.display);
  return `${item.normalRange.low} to ${item.normalRange.high} ${item.unit}`.trim();
};

const validMarks = (saved: Record<string, ResultType>) =>
  !!saved &&
  typeof saved === "object" &&
  !Array.isArray(saved) &&
  Object.values(saved).every(
    (entry) => entry === "solved" || entry === "missed",
  );

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id) => b.includes(id));

const Choice = ({
  option,
  chosen,
  answered,
  onPick,
  shape,
}: {
  option: LabOptionType;
  chosen: boolean;
  answered: boolean;
  onPick: () => void;
  shape: "round" | "square";
}) => {
  const wrongPick = answered && chosen && !option.correct;
  const missed = answered && !chosen && option.correct;
  const won = answered && chosen && option.correct;

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
        type="button"
        disabled={answered}
        aria-pressed={chosen}
        onClick={onPick}
        className={`flex w-full items-start gap-x-4 rounded-2xl border-2 border-solid p-4 text-left duration-300 ${shell}`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold duration-300 ${
            shape === "round" ? "rounded-full" : "rounded-md"
          } ${badge}`}
        >
          {option.id}
        </span>
        <span className="min-w-0 flex-1 leading-7">{option.text}</span>
        {won && <span className="shrink-0 leading-7">✅</span>}
        {wrongPick && <span className="shrink-0 leading-7">❌</span>}
        {missed && (
          <span className="flex h-7 shrink-0 items-center rounded-full bg-[rgba(68,215,182,0.18)] px-2 text-[10px] font-bold uppercase tracking-wide text-[var(--title-color)]">
            Missed
          </span>
        )}
      </button>
      {answered && chosen && (
        <p className="mt-2 px-1 text-sm text-[#8b88b1]">{option.rationale}</p>
      )}
    </div>
  );
};

const Labs = ({ exam }: { exam: ExamId }) => {
  const [bank, setBank] = useState<LabBankType | null>(null);
  const [index, setIndex] = useState(0);
  const [stage1Pick, setStage1Pick] = useState<string | null>(null);
  const [stage2Picks, setStage2Picks] = useState<string[]>([]);
  const [stage2Answered, setStage2Answered] = useState(false);

  const [results, setResults] = useSaved<Record<string, ResultType>>(
    `nclex:labs:results:v1:${exam}`,
    () => ({}),
    validMarks,
  );

  useEffect(() => {
    let alive = true;
    import("./labs.json").then((mod) => {
      if (alive) setBank(mod.default as unknown as LabBankType);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!bank) {
    return (
      <div className="mb-8 rounded-2xl bg-[var(--body-color)] p-7 text-center">
        <p className="text-[#8b88b1]">Loading labs…</p>
      </div>
    );
  }

  const items = bank.items;
  const item = items[index];
  const stage1Answered = stage1Pick !== null;
  const stage1Correct = stage1Pick === item.stage1.answer;
  const unlocked = stage1Answered && stage1Correct;
  const solved = items.filter((entry) => results[entry.id] === "solved").length;

  const goItem = (next: number) => {
    setIndex(next);
    setStage1Pick(null);
    setStage2Picks([]);
    setStage2Answered(false);
  };

  const pickStage1 = (id: string) => {
    if (stage1Answered) return;
    setStage1Pick(id);
    if (id !== item.stage1.answer) {
      setResults((prev) => ({ ...prev, [item.id]: "missed" }));
    }
  };

  const toggleStage2 = (id: string) => {
    if (stage2Answered) return;
    setStage2Picks((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
    );
  };

  const submitStage2 = () => {
    setStage2Answered(true);
    const hit = sameSet(stage2Picks, item.stage2.answer);
    setResults((prev) => ({ ...prev, [item.id]: hit ? "solved" : "missed" }));
  };

  return (
    <>
      <div className="mb-1 rounded-2xl bg-[var(--body-color)] p-5">
      <div className="mb-6 flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
        <span className="text-xs text-[#8b88b1]">
          {solved} of {items.length} mastered
        </span>
      </div>

      <div className="mb-6 grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2">
        {items.map((entry, entryIndex) => {
          const state = results[entry.id];
          const here = entryIndex === index;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => goItem(entryIndex)}
              aria-current={here}
              className={`relative h-10 rounded-lg border-2 border-solid text-xs font-bold duration-300 ${
                here
                  ? "border-[var(--primary-color)]"
                  : state
                    ? "border-transparent"
                    : "border-[#d3d0e4] hover:border-[hsl(219,100%,72%)]"
              } ${
                state === "solved"
                  ? "bg-[rgb(68,215,182)] text-white"
                  : state === "missed"
                    ? "bg-[var(--primary-color)] text-white"
                    : "bg-[var(--container-color)] text-[#8b88b1] hover:text-[var(--title-color)]"
              }`}
            >
              {entryIndex + 1}
              {entry.critical && (
                <span
                  aria-label="High-risk value"
                  title="High-risk value"
                  className="pointer-events-none absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[hsl(38,100%,55%)]"
                />
              )}
            </button>
          );
        })}
      </div>
      </div>

      <div className="rounded-2xl bg-[var(--container-color)] p-5 shadow-lg">
        <p className="mb-1 text-lg font-bold text-[var(--title-color)]">
          {item.stage1.prompt}
        </p>
        <p className="mb-4 text-[#8b88b1]">{item.stage1.question}</p>

        {stage1Answered && (
          <p className="mb-4 animate-fadeIn text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
            {rangeText(item) ? `Normal range: ${rangeText(item)}` : item.note}
          </p>
        )}

        <div className="grid gap-y-3">
          {item.stage1.options.map((option) => (
            <Choice
              key={option.id}
              option={option}
              chosen={stage1Pick === option.id}
              answered={stage1Answered}
              onPick={() => pickStage1(option.id)}
              shape="round"
            />
          ))}
        </div>

        {stage1Answered && !stage1Correct && (
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-[var(--body-color)] p-4">
            <p className="text-sm text-[#8b88b1]">
              Not quite. Findings stay locked until this is right.
            </p>
            <button
              type="button"
              onClick={() => setStage1Pick(null)}
              className="text-xs font-bold uppercase tracking-wide text-[var(--primary-color)]"
            >
              Try again
            </button>
          </div>
        )}

        {unlocked && (
          <div className="mt-6 animate-fadeIn border-t border-solid border-[var(--body-color)] pt-6">
            <p className="mb-1 text-lg font-bold text-[var(--title-color)]">
              {item.stage2.question}
            </p>
            <p className="mb-4 text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
              Select all that apply
            </p>

            <div className="grid gap-y-3">
              {item.stage2.options.map((option) => (
                <Choice
                  key={option.id}
                  option={option}
                  chosen={stage2Picks.includes(option.id)}
                  answered={stage2Answered}
                  onPick={() => toggleStage2(option.id)}
                  shape="square"
                />
              ))}
            </div>

            {!stage2Answered ? (
              <button
                type="button"
                disabled={stage2Picks.length === 0}
                onClick={submitStage2}
                className="mt-6 inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                Check answer
              </button>
            ) : (
              <div className="mt-6 rounded-2xl bg-[var(--body-color)] p-4">
                <p className="text-sm font-bold text-[var(--title-color)]">
                  {item.takeaway}
                </p>
              </div>
            )}
          </div>
        )}

        {(stage2Answered || (stage1Answered && !stage1Correct)) && (
          <button
            type="button"
            onClick={() => goItem((index + 1) % items.length)}
            className="mt-6 inline-block rounded-[1.875rem] border-[1px] border-solid border-[var(--primary-color)] bg-transparent px-8 py-3 font-bold leading-4 text-[var(--primary-color)] hover:animate-pulse"
          >
            Next value
          </button>
        )}
      </div>
    </>
  );
};

export default Labs;
