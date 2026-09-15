"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Shapes from "../Home/Shapes";
import { useSaved } from "../DosageCalculations/Saved";
import { EXAMS, EXAM_KEY, EXAM_TITLES, ExamId, isExamId, loadBank } from "./Bank";
import ChapterSet, { LensType, PickType, ResultType } from "./ChapterSet";
import { ChapterType, DerivedBank, labelOf, QuestionType } from "./Questions";
import Quiz from "./Quiz";
import Swap from "./Swap";

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

const Loading = () => (
  <div className="mb-8 rounded-2xl bg-[var(--body-color)] p-7 text-center">
    <p className="text-[#8b88b1]">Loading questions…</p>
  </div>
);

// Every piece of state here is scoped to one exam (via the storage keys) and
// the whole component remounts on exam switch (see `key={exam}` below), so
// progress and tab choice never leak between exams that happen to share
// question ids.
const ExamView = ({ exam, bank }: { exam: ExamId; bank: DerivedBank }) => {
  const [view, setView] = useSaved<ViewType>(
    `nclex:view:v1:${exam}`,
    freshView,
    validView,
  );
  const { lens } = view;
  const setSection = (next: SectionType) =>
    setView((prev) => ({ ...prev, section: next }));
  const setLens = (next: LensType) =>
    setView((prev) => ({ ...prev, lens: next }));

  // Only offer tabs this exam actually has content for.
  const available = useMemo(
    () =>
      SECTIONS.filter((entry) => {
        if (entry === "skills") return bank.Skills.length > 0;
        if (entry === "cases") return bank.Cases.length > 0;
        if (entry === "judgment") return bank.Judgment.length > 0;
        return bank.Chapters.length > 0;
      }),
    [bank],
  );
  const section = available.includes(view.section) ? view.section : available[0];
  useEffect(() => {
    if (section && section !== view.section) setSection(section);
  }, [section, view.section]);

  const [started, setStarted] = useState<StartType | null>(null);
  const [results, setResults] = useSaved<Record<string, ResultType>>(
    `nclex:results:v1:${exam}`,
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
      ? bank.Skills
      : section === "cases"
        ? bank.Cases
        : section === "judgment"
          ? bank.Judgment
          : bank.Chapters;
  const noun =
    section === "skills" ? "skills" : section === "cases" ? "cases" : "chapters";
  const empty = groups.length === 0;

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
        ? bank.Cases.find((entry) =>
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

  if (!section) {
    return (
      <div className="mb-8 rounded-2xl bg-[var(--body-color)] p-7 text-center">
        <p className="text-[#8b88b1]">
          {EXAM_TITLES[exam]} doesn&apos;t have any questions yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {available.length > 1 && (
        <div className="mb-6 ml-3.5 inline-flex gap-x-1 rounded-[1.875rem] bg-[var(--body-color)] p-1 lg:ml-0 lg:flex lg:justify-center">
          {available.map((entry) => (
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
      )}

      <Swap
        token={section}
        className="relative mb-4 ml-3.5 text-3xl font-bold lg:ml-0 lg:text-center"
      >
        <h2>{TITLES[section]}</h2>
      </Swap>

      {shown.length === 0 ? (
        <div className="mb-8 rounded-2xl bg-[var(--body-color)] p-7 text-center">
          {empty ? (
            <>
              <p className="mb-1 text-lg font-bold text-[var(--title-color)]">
                Not in {EXAM_TITLES[exam]}.
              </p>
              <p className="text-[#8b88b1]">
                This exam doesn&apos;t include {noun}. Try another tab.
              </p>
            </>
          ) : (
            <>
              <p className="mb-4 text-lg font-bold text-[var(--title-color)]">
                Nothing left here.
              </p>
              <p className="text-[#8b88b1]">
                Every question in {noun} is answered correctly. Switch back to
                All to run them again.
              </p>
              <button
                type="button"
                onClick={() => setLens("all")}
                className="mt-5 inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse"
              >
                Show all
              </button>
            </>
          )}
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
    </>
  );
};

const Nclex = () => {
  const [exam, setExam] = useSaved<ExamId>(EXAM_KEY, () => "exam1", isExamId);
  const [bank, setBank] = useState<DerivedBank | null>(null);

  useEffect(() => {
    let alive = true;
    setBank(null);
    loadBank(exam).then((next) => {
      if (alive) setBank(next);
    });
    return () => {
      alive = false;
    };
  }, [exam]);

  return (
    <section className="relative mx-auto max-w-[1080px] animate-fadeIn px-10 pb-24 pt-28 lg:pt-12 md:px-6">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Shapes />
      </div>

      <div className="relative z-10">
        <div className="mb-2 flex items-start justify-between gap-x-4 lg:flex-col lg:items-center lg:gap-y-3">
          <h1 className="relative ml-3.5 text-4xl font-bold lg:ml-0 lg:text-center">
            NCLEX-<em>style</em> Questions
          </h1>

          <select
            value={exam}
            onChange={(event) => {
              const next = event.target.value;
              if (isExamId(next)) setExam(next);
            }}
            aria-label="Exam"
            className="h-10 shrink-0 rounded-[1.875rem] border-none bg-[var(--body-color)] px-5 text-sm font-bold text-[var(--title-color)] shadow-inner outline-none"
          >
            {EXAMS.map((id) => (
              <option key={id} value={id}>
                {EXAM_TITLES[id]}
              </option>
            ))}
          </select>
        </div>

        <p className="mb-10 ml-3.5 lg:ml-0 lg:text-center">
          {bank
            ? `${bank.Course}. Questions follow ${bank.Textbook}.`
            : ` `}
        </p>

        {bank ? <ExamView key={exam} exam={exam} bank={bank} /> : <Loading />}
      </div>
    </section>
  );
};

export default Nclex;
