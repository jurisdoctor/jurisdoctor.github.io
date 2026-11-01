"use client";
import { ReactNode, useMemo, useState } from "react";
import { PiCaretDownBold } from "react-icons/pi";
import { ResultType } from "./ChapterSet";
import { ChapterType, DerivedBank, labelOf, QuestionType } from "./Questions";

export interface AttemptType {
  tries: number;
  wrong: number;
  at: number;
}

interface EntryType {
  label: string;
  questions: QuestionType[];
}

interface TallyType {
  total: number;
  solved: number;
  missed: number;
  attempted: number;
}

interface ConceptType {
  name: string;
  where: string;
  tally: TallyType;
  missedQuestions: QuestionType[];
}

const FORMATS: Record<string, string> = {
  multiple_choice: "Multiple choice",
  sata: "Select all that apply",
  matrix: "Matrix",
  matrix_multiple_response: "Matrix",
  trend_matrix: "Matrix",
  highlight: "Highlight",
  ordered_response: "Place in order",
  cloze: "Drop-down",
  bowtie: "Bow tie",
  matching: "Matching",
  select_n: "Select N",
  extended_response: "Extended response",
};

const card = "rounded-xl bg-[var(--container-color)] p-6 shadow-xl md:p-5";
const heading = "mb-1 text-xl font-bold text-[var(--title-color)]";
const hint = "mb-4 text-sm text-[var(--muted-color)]";
const action =
  "inline-block rounded-md border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-5 py-2.5 text-sm font-bold leading-4 text-[var(--on-primary)] shadow-lg";
const ghost =
  "inline-block rounded-md border-[1px] border-solid border-transparent bg-[color-mix(in_srgb,var(--primary-color)_16%,transparent)] px-4 py-2 text-xs font-bold leading-4 text-[var(--primary-color)]";

const tallyOf = (
  questions: QuestionType[],
  results: Record<string, ResultType>,
): TallyType => {
  const solved = questions.filter((q) => results[q.id] === "solved").length;
  const missed = questions.filter((q) => results[q.id] === "missed").length;
  return {
    total: questions.length,
    solved,
    missed,
    attempted: solved + missed,
  };
};

const percent = (tally: TallyType) =>
  tally.attempted ? Math.round((tally.solved / tally.attempted) * 100) : null;

const shorten = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;

const Bar = ({ tally }: { tally: TallyType }) => (
  <span className="flex h-2 w-full overflow-hidden rounded-sm bg-[var(--track-color)]">
    <span
      className="h-full bg-[rgb(0,212,127)] duration-500"
      style={{ width: `${(tally.solved / Math.max(1, tally.total)) * 100}%` }}
    />
    <span
      className="h-full bg-[var(--primary-color)] duration-500"
      style={{ width: `${(tally.missed / Math.max(1, tally.total)) * 100}%` }}
    />
  </span>
);

const Stat = ({
  value,
  label,
  note,
}: {
  value: ReactNode;
  label: string;
  note?: string;
}) => (
  <div className="rounded-xl bg-[var(--body-color)] p-4">
    <p className="text-3xl font-bold leading-none text-[var(--title-color)]">
      {value}
    </p>
    <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
      {label}
    </p>
    {note && <p className="mt-1 text-xs text-[var(--muted-color)]">{note}</p>}
  </div>
);

const Row = ({
  name,
  tally,
  onPractice,
}: {
  name: string;
  tally: TallyType;
  onPractice?: () => void;
}) => {
  const rate = percent(tally);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5">
      <span className="min-w-0 truncate text-sm text-[var(--title-color)]">
        {name}
      </span>
      <span className="flex items-center gap-x-3 text-xs text-[var(--muted-color)]">
        {tally.attempted > 0
          ? `${rate}% · ${tally.solved}/${tally.attempted}`
          : `0/${tally.total}`}
        {onPractice && tally.missed > 0 && (
          <button type="button" onClick={onPractice} className={ghost}>
            Redo {tally.missed}
          </button>
        )}
      </span>
      <span className="col-span-2">
        <Bar tally={tally} />
      </span>
    </div>
  );
};

// A study helper built from the answers already saved in this browser: how
// much has been tried, what share was right, which concepts keep being
// missed, and one-tap drills that rerun exactly those questions.
const Progress = ({
  bank,
  results,
  attempts,
  onPractice,
}: {
  bank: DerivedBank;
  results: Record<string, ResultType>;
  attempts: Record<string, AttemptType>;
  onPractice: (questions: QuestionType[], label: string) => void;
}) => {
  const view = useMemo(() => {
    const entries: EntryType[] = [
      ...bank.Chapters.map((entry: ChapterType) => ({
        label: labelOf(entry),
        questions: entry.questions,
      })),
      ...bank.Skills.map((entry) => ({
        label: entry.title,
        questions: entry.questions,
      })),
      ...bank.Cases.map((entry) => ({
        label: `Case · ${entry.title}`,
        questions: entry.questions,
      })),
      ...bank.Judgment.map((entry) => ({
        label: `Clinical judgment · ${labelOf(entry)}`,
        questions: entry.questions,
      })),
    ].filter((entry) => entry.questions.length > 0);

    const seen = new Set<string>();
    const all: { question: QuestionType; where: string }[] = [];
    entries.forEach((entry) =>
      entry.questions.forEach((question) => {
        if (seen.has(question.id)) return;
        seen.add(question.id);
        all.push({ question, where: entry.label });
      }),
    );
    const questions = all.map((item) => item.question);
    const overall = tallyOf(questions, results);

    const concepts = new Map<string, ConceptType>();
    all.forEach(({ question, where }) => {
      if (!results[question.id]) return;
      const name = question.objective?.trim() || "Other questions";
      const key = `${where}||${name}`;
      const found = concepts.get(key) ?? {
        name,
        where,
        tally: { total: 0, solved: 0, missed: 0, attempted: 0 },
        missedQuestions: [],
      };
      found.tally.total += 1;
      found.tally.attempted += 1;
      if (results[question.id] === "solved") found.tally.solved += 1;
      else {
        found.tally.missed += 1;
        found.missedQuestions.push(question);
      }
      concepts.set(key, found);
    });
    const byRate = (a: ConceptType, b: ConceptType) =>
      b.tally.missed / b.tally.attempted - a.tally.missed / a.tally.attempted ||
      b.tally.missed - a.tally.missed;
    const failing = Array.from(concepts.values())
      .filter((concept) => concept.tally.missed > 0)
      .sort(byRate);
    const sections = Array.from(
      failing.reduce(
        (map, concept) =>
          map.set(concept.where, [...(map.get(concept.where) ?? []), concept]),
        new Map<string, ConceptType[]>(),
      ),
    )
      .map(([label, list]) => ({
        label,
        concepts: list,
        missed: list.reduce((sum, concept) => sum + concept.tally.missed, 0),
        attempted: list.reduce(
          (sum, concept) => sum + concept.tally.attempted,
          0,
        ),
        missedQuestions: list.flatMap((concept) => concept.missedQuestions),
      }))
      .sort((a, b) => b.missed - a.missed);

    const grouped = (pick: (question: QuestionType) => string | undefined) => {
      const map = new Map<string, QuestionType[]>();
      questions.forEach((question) => {
        const key = pick(question);
        if (!key) return;
        map.set(key, [...(map.get(key) ?? []), question]);
      });
      return Array.from(map.entries())
        .map(([name, list]) => ({ name, tally: tallyOf(list, results) }))
        .filter((row) => row.tally.attempted > 0)
        .sort((a, b) => (percent(a.tally) ?? 0) - (percent(b.tally) ?? 0));
    };

    const missedAll = all.filter(
      ({ question }) => results[question.id] === "missed",
    );

    const triesOf = (id: string) =>
      attempts[id]?.tries ?? (results[id] ? 1 : 0);
    const redone = questions.filter((question) => triesOf(question.id) > 1);
    const turned = questions.filter(
      (question) =>
        results[question.id] === "solved" &&
        (attempts[question.id]?.wrong ?? 0) > 0,
    );
    const stuck = redone.filter(
      (question) => results[question.id] === "missed",
    );

    return {
      redo: { redone, turned, stuck },
      entries: entries
        .map((entry) => ({
          label: entry.label,
          questions: entry.questions,
          tally: tallyOf(entry.questions, results),
        }))
        .filter((entry) => entry.tally.attempted > 0),
      overall,
      focus: failing,
      sections,
      formats: grouped(
        (question) => FORMATS[question.type ?? ""] ?? question.type,
      ),
      steps: grouped((question) => question.cjmm),
      missedAll,
    };
  }, [bank, results, attempts]);

  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const isOpen = (label: string) =>
    opened[label] ?? view.sections[0]?.label === label;
  const toggle = (label: string) =>
    setOpened((prev) => ({ ...prev, [label]: !isOpen(label) }));

  const { overall } = view;
  const rate = percent(overall);

  if (overall.attempted === 0) {
    return (
      <div className="mb-8 mt-4 rounded-2xl bg-[var(--container-color)] p-7 text-center">
        <p className="mb-1 text-lg font-bold text-[var(--title-color)]">
          nothing to show yet
        </p>
        <p className="text-[var(--muted-color)]">
          Answer a few questions in Chapters or Skills and this page will track
          your score and point you at what to study next.
        </p>
      </div>
    );
  }

  const top = view.focus[0];

  return (
    <div className="mb-8 mt-4 grid gap-y-5">
      <div className="grid grid-cols-4 gap-3 md:grid-cols-2">
        <Stat
          value={`${rate}%`}
          label="Correct"
          note={`${overall.solved} of ${overall.attempted} tried`}
        />
        <Stat
          value={overall.attempted}
          label="Attempted"
          note={`of ${overall.total} questions`}
        />
        <Stat
          value={overall.missed}
          label="Missed"
          note="latest answer wrong"
        />
        <Stat
          value={overall.total - overall.attempted}
          label="Not tried"
          note={`${Math.round((overall.attempted / overall.total) * 100)}% done`}
        />
      </div>

      <div className={card}>
        <h3 className={heading}>Redo tracker</h3>
        <p className={hint}>
          A question counts as redone when you answer it more than once. Turned
          around means you missed it at least once and have it right now.
        </p>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
          <Stat
            value={view.redo.redone.length}
            label="Redone"
            note="answered more than once"
          />
          <Stat
            value={view.redo.turned.length}
            label="Turned around"
            note="missed, then got right"
          />
          <Stat
            value={view.redo.stuck.length}
            label="Still missing"
            note="redone and still wrong"
          />
        </div>
        {view.redo.stuck.length > 0 && (
          <button
            type="button"
            onClick={() =>
              onPractice(view.redo.stuck, "Still missing after redo")
            }
            className={`${action} mt-4`}
          >
            Practice the ones still missing
          </button>
        )}
      </div>

      {top && (
        <div className={card}>
          <h3 className={heading}>Focus on this next</h3>
          <p className={hint}>
            Every concept you have missed at least once, grouped by chapter with
            the chapter you struggle with most first. Redo a concept to rerun
            only the questions you got wrong.
          </p>
          <div className="mb-5 rounded-xl bg-[color-mix(in_srgb,var(--primary-color)_14%,transparent)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
              Start here
            </p>
            <p className="mt-1 font-bold text-[var(--title-color)]">
              {top.name}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-color)]">
              You missed {top.tally.missed} of {top.tally.attempted} here ·{" "}
              {top.where}.
            </p>
            <button
              type="button"
              onClick={() => onPractice(top.missedQuestions, top.name)}
              className={`${action} mt-3`}
            >
              Practice this concept
            </button>
          </div>
          <div className="grid gap-y-2">
            {view.sections.map((section) => {
              const here = isOpen(section.label);
              return (
                <div
                  key={section.label}
                  className="rounded-xl bg-[var(--body-color)]"
                >
                  <div className="flex items-center gap-x-3 p-3">
                    <button
                      type="button"
                      aria-expanded={here}
                      onClick={() => toggle(section.label)}
                      className="flex min-w-0 flex-1 items-center gap-x-3 text-left"
                    >
                      <PiCaretDownBold
                        aria-hidden
                        className={`shrink-0 text-[var(--muted-color)] duration-300 ${
                          here ? "" : "-rotate-90"
                        }`}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-[var(--title-color)]">
                          {section.label}
                        </span>
                        <span className="block text-xs text-[var(--muted-color)]">
                          {section.concepts.length}{" "}
                          {section.concepts.length === 1
                            ? "concept"
                            : "concepts"}{" "}
                          to review · {section.missed} missed of{" "}
                          {section.attempted} tried
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onPractice(section.missedQuestions, section.label)
                      }
                      className={ghost}
                    >
                      Redo {section.missed}
                    </button>
                  </div>
                  {here && (
                    <div className="grid gap-y-4 px-3 pb-4 pl-9">
                      {section.concepts.map((concept) => (
                        <Row
                          key={concept.name}
                          name={concept.name}
                          tally={concept.tally}
                          onPractice={() =>
                            onPractice(concept.missedQuestions, concept.name)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={card}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div>
            <h3 className={heading}>By chapter</h3>
            <p className="text-sm text-[var(--muted-color)]">
              green is correct, the accent colour is missed, grey is untried
            </p>
          </div>
        </div>
        <div className="grid gap-y-4">
          {view.entries.map((entry) => (
            <Row
              key={entry.label}
              name={entry.label}
              tally={entry.tally}
              onPractice={() =>
                onPractice(
                  entry.questions.filter((q) => results[q.id] === "missed"),
                  entry.label,
                )
              }
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-1">
        <div className={card}>
          <h3 className={heading}>By question type</h3>
          <p className={hint}>how you score on each kind of question</p>
          <div className="grid gap-y-4">
            {view.formats.map((row) => (
              <Row key={row.name} name={row.name} tally={row.tally} />
            ))}
          </div>
        </div>
        {view.steps.length > 0 && (
          <div className={card}>
            <h3 className={heading}>By judgment step</h3>
            <p className={hint}>the clinical judgment skill each item tests</p>
            <div className="grid gap-y-4">
              {view.steps.map((row) => (
                <Row key={row.name} name={row.name} tally={row.tally} />
              ))}
            </div>
          </div>
        )}
      </div>

      {view.missedAll.length > 0 && (
        <div className={card}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div>
              <h3 className={heading}>Missed questions</h3>
              <p className="text-sm text-[var(--muted-color)]">
                {view.missedAll.length} questions where your latest answer was
                wrong
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onPractice(
                  view.missedAll.map((item) => item.question),
                  "Missed questions",
                )
              }
              className={action}
            >
              Practice all missed
            </button>
          </div>
          <div className="grid gap-y-2">
            {view.missedAll.slice(0, 30).map(({ question, where }) => (
              <div
                key={question.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 rounded-xl bg-[var(--body-color)] p-3"
              >
                <span className="min-w-0">
                  <span className="block text-sm text-[var(--title-color)]">
                    {shorten(question.stem, 130)}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--muted-color)]">
                    {question.objective ?? where}
                    {(attempts[question.id]?.tries ?? 1) > 1
                      ? ` · tried ${attempts[question.id]?.tries}×`
                      : ""}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onPractice([question], where)}
                  className={ghost}
                >
                  Retry
                </button>
              </div>
            ))}
          </div>
          {view.missedAll.length > 30 && (
            <p className="mt-3 text-xs text-[var(--muted-color)]">
              Showing 30 of {view.missedAll.length}. Practice all missed runs
              every one.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Progress;
