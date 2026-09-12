"use client";
import { useCallback, useMemo, useState } from "react";
import Shapes from "../Home/Shapes";
import { useSaved } from "../DosageCalculations/Saved";
import ChapterSet, { LensType, PickType, ResultType } from "./ChapterSet";
import Quiz from "./Quiz";
import Swap from "./Swap";
import {
  Cases,
  ChapterType,
  Chapters,
  Course,
  Judgment,
  labelOf,
  QuestionType,
  Skills,
  Textbook,
} from "./Questions";

const shuffle = (items: QuestionType[]) => {
  const order = [...items];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

type SectionType = "chapters" | "skills" | "cases" | "judgment";

interface StartType {
  pick: PickType;
  at: number;
}

const tab =
  "rounded-[1.875rem] px-6 py-2 text-sm font-bold duration-300 lg:px-5";

const MARKS = "nclex:results:v1";
const VIEW = "nclex:view:v1";

interface ViewType {
  section: SectionType;
  lens: LensType;
}

const freshMarks = (): Record<string, ResultType> => ({});
const freshView = (): ViewType => ({ section: "chapters", lens: "all" });

const validMarks = (saved: Record<string, ResultType>) =>
  !!saved &&
  typeof saved === "object" &&
  !Array.isArray(saved) &&
  Object.values(saved).every(
    (entry) => entry === "solved" || entry === "missed",
  );

const SECTIONS: SectionType[] = ["chapters", "skills", "cases", "judgment"];

const TITLES: Record<SectionType, string> = {
  chapters: "Chapters",
  skills: "Skills",
  cases: "Case studies",
  judgment: "Clinical judgment",
};

const validView = (saved: ViewType) =>
  !!saved &&
  SECTIONS.includes(saved.section) &&
  (saved.lens === "all" || saved.lens === "incomplete");

const Nclex = () => {
  const [view, setView] = useSaved<ViewType>(VIEW, freshView, validView);
  const { section, lens } = view;
  const setSection = (next: SectionType) =>
    setView((prev) => ({ ...prev, section: next }));
  const setLens = (next: LensType) =>
    setView((prev) => ({ ...prev, lens: next }));
  const [started, setStarted] = useState<StartType | null>(null);
  const [results, setResults] = useSaved<Record<string, ResultType>>(
    MARKS,
    freshMarks,
    validMarks,
  );
  const [deck, setDeck] = useState<QuestionType[]>([]);
  const [at, setAt] = useState(0);
  const [pass, setPass] = useState(0);
  const pick = started?.pick ?? null;

  const mark = useCallback((id: string, correct: boolean) => {
    setResults((prev) => ({ ...prev, [id]: correct ? "solved" : "missed" }));
  }, []);

  const groups =
    section === "skills"
      ? Skills
      : section === "cases"
        ? Cases
        : section === "judgment"
          ? Judgment
          : Chapters;
  const noun =
    section === "skills" ? "skills" : section === "cases" ? "cases" : "chapters";

  const viewFor = useCallback(
    (which: LensType) =>
      which === "all"
        ? groups
        : groups
            .map((group) => ({
              ...group,
              questions: group.questions.filter(
                (entry) => results[entry.id] !== "solved",
              ),
            }))
            .filter((group) => group.questions.length > 0),
    [groups, results],
  );

  const shown = useMemo(() => viewFor(lens), [viewFor, lens]);

  const total = groups.reduce((sum, group) => sum + group.questions.length, 0);
  const left = viewFor("incomplete").reduce(
    (sum, group) => sum + group.questions.length,
    0,
  );

  const open = (next: PickType, index: number, view: ChapterType[]) => {
    const group = view.find((entry) => entry.id === next);
    const pool = group
      ? group.questions
      : shuffle(view.flatMap((entry) => entry.questions));

    const target = pool[index];
    const story =
      section !== "cases" && target?.caseId
        ? Cases.find((entry) =>
            entry.questions.some((step) => step.id === target.id),
          )
        : undefined;

    const run = story ? story.questions : pool;
    const sequential = run.some((entry) => entry.caseId);
    const resume = run.findIndex((entry) => results[entry.id] !== "solved");
    const fallback = story ? 0 : index;
    const startAt = sequential && resume !== -1 ? resume : fallback;

    setDeck(run);
    setAt(startAt);
    setStarted({ pick: next, at: startAt });
  };

  const run = (which: LensType) => {
    setLens(which);
    open("all", 0, viewFor(which));
  };

  const progressOf = useCallback(
    (id: string) => {
      const group = groups.find((entry) => entry.id === id);
      const questions = group?.questions ?? [];
      return {
        solved: questions.filter((entry) => results[entry.id] === "solved")
          .length,
        missed: questions.filter((entry) => results[entry.id] === "missed")
          .length,
        total: questions.length,
      };
    },
    [groups, results],
  );

  const labelFor = useCallback(
    (entry: ChapterType) =>
      section === "chapters" || section === "judgment"
        ? labelOf(entry)
        : section === "cases"
          ? `Chapter ${entry.id} · ${entry.title}`
          : entry.title,
    [section],
  );

  const group = pick ? shown.find((entry) => entry.id === pick) : undefined;

  const label = group
    ? labelFor(group)
    : lens === "incomplete"
      ? `Incomplete ${noun}`
      : `All ${noun}`;

  const reset = () => {
    setResults({});
    setAt(started?.at ?? 0);
    setPass((prev) => prev + 1);
  };

  const swap = (next: SectionType) => {
    setSection(next);
    setStarted(null);
    setDeck([]);
    setAt(0);
  };

  return (
    <section className="relative mx-auto max-w-[1080px] animate-fadeIn px-10 pb-24 pt-28 lg:pt-12 md:px-6">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Shapes />
      </div>

      <div className="relative z-10">
        <h1 className="relative mb-2 ml-3.5 text-4xl font-bold lg:ml-0 lg:text-center">
          NCLEX-<em>style</em> Questions
        </h1>
        <p className="mb-10 ml-3.5 lg:ml-0 lg:text-center">
          {Course}. Questions follow {Textbook}.
        </p>

        <div className="mb-6 ml-3.5 inline-flex gap-x-1 rounded-[1.875rem] bg-[var(--body-color)] p-1 lg:ml-0 lg:flex lg:justify-center">
          {SECTIONS.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => swap(entry)}
              aria-pressed={section === entry}
              className={`${tab} ${
                section === entry
                  ? "bg-[var(--container-color)] text-[var(--title-color)] shadow-lg"
                  : "text-[#8b88b1] hover:text-[var(--title-color)]"
              }`}
            >
              {TITLES[entry]}
            </button>
          ))}
        </div>

        <Swap
          token={section}
          className="relative mb-4 ml-3.5 text-3xl font-bold lg:ml-0 lg:text-center"
        >
          <h2>{TITLES[section]}</h2>
        </Swap>

        {shown.length === 0 ? (
          <div className="mb-8 rounded-2xl bg-[var(--body-color)] p-7 text-center">
            <p className="mb-4 text-lg font-bold text-[var(--title-color)]">
              Nothing left here.
            </p>
            <p className="text-[#8b88b1]">
              Every question in {noun} is answered correctly. Switch back to All
              to run them again.
            </p>
            <button
              type="button"
              onClick={() => setLens("all")}
              className="mt-5 inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse"
            >
              Show all
            </button>
          </div>
        ) : (
          <ChapterSet
            chapters={shown}
            active={pick}
            results={results}
            current={deck[at]?.id ?? null}
            lens={lens}
            onRun={run}
            noun={noun}
            labelFor={labelFor}
            progressOf={progressOf}
            total={total}
            left={left}
            onStart={(next, index) => open(next, index, shown)}
            onReset={reset}
          />
        )}

        <Swap token={`${section}-${lens}-${String(pick)}-${started?.at ?? -1}`}>
          {started === null || deck.length === 0 ? (
            <p className="ml-3.5 text-[#8b88b1] lg:ml-0 lg:text-center">
              Pick{" "}
              {section === "skills"
                ? "a skill"
                : section === "cases"
                  ? "a case"
                  : "a chapter"}{" "}
              above to see its questions, or hit All to run the whole set.
            </p>
          ) : (
            <>
              <h3 className="mb-4 ml-3.5 text-xl lg:ml-0 lg:text-center">
                {label}
              </h3>
              <Quiz
                key={`${section}-${lens}-${String(pick)}-${started.at}-${pass}`}
                label={label}
                questions={deck}
                start={started.at}
                results={results}
                onResult={mark}
                onMove={setAt}
              />
            </>
          )}
        </Swap>
      </div>
    </section>
  );
};

export default Nclex;
