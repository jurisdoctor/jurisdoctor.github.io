"use client";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { PiCaretDownBold } from "react-icons/pi";
import Shapes from "../Home/Shapes";
import { useSaved } from "../DosageCalculations/Saved";
import {
  EXAMS,
  EXAM_KEY,
  EXAM_TITLES,
  ExamId,
  isExamId,
  KAPLAN_EXAM_KEY,
  KaplanExamType,
  loadBank,
  loadKaplanBank,
  loadKaplanExams,
} from "./Bank";
import ChapterSet, {
  firstToDo,
  LensType,
  PickType,
  ResultType,
} from "./ChapterSet";
import Flash from "./Flash";
import {
  ChapterType,
  DerivedBank,
  displayNumberOf,
  isStory,
  labelOf,
  QuestionType,
} from "./Questions";
import Quiz from "./Quiz";
import Swap from "./Swap";
import TypedText, { Segment } from "../Typed/TypedText";

type SectionType = "chapters" | "skills" | "cases" | "judgment" | "favorites";

interface StartType {
  pick: PickType;
  at: number;
}

const tab = "rounded-md px-6 py-2 text-sm font-bold duration-300 lg:px-5";

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

const freshHashes = (): Record<string, string> => ({});

const validHashes = (saved: Record<string, string>) =>
  !!saved &&
  typeof saved === "object" &&
  !Array.isArray(saved) &&
  Object.values(saved).every((entry) => typeof entry === "string");

const SECTIONS: SectionType[] = [
  "chapters",
  "skills",
  "cases",
  "judgment",
  "favorites",
];

const freshStars = (): Record<string, true> => ({});

const validStars = (saved: Record<string, true>) =>
  !!saved &&
  typeof saved === "object" &&
  !Array.isArray(saved) &&
  Object.values(saved).every((entry) => entry === true);

const TITLES: Record<SectionType, string> = {
  chapters: "Chapters",
  skills: "Skills",
  cases: "Case studies",
  judgment: "Clinical judgment",
  favorites: "Favorites",
};

export type SetKind = "nclex" | "kaplan";

interface SetType {
  scope: string;
  examKey: string;
  heading: Segment[];
  names: Partial<Record<SectionType, string>>;
  nouns: Partial<Record<SectionType, string>>;
  picks: Partial<Record<SectionType, string>>;
}

const SETS: Record<SetKind, SetType> = {
  nclex: {
    scope: "nclex",
    examKey: EXAM_KEY,
    heading: [
      { text: "NCLEX-" },
      { text: "style", className: "italic" },
      { text: " Questions" },
    ],
    names: {},
    nouns: {},
    picks: {},
  },
  kaplan: {
    scope: "kaplan",
    examKey: KAPLAN_EXAM_KEY,
    heading: [{ text: "Kaplan Questions" }],
    names: { skills: "Topics" },
    nouns: { skills: "topics" },
    picks: { skills: "a topic" },
  },
};

const validView = (saved: ViewType) =>
  !!saved &&
  SECTIONS.includes(saved.section) &&
  (saved.lens === "all" || saved.lens === "incomplete");

const Loading = () => (
  <div className="mb-8 rounded-2xl bg-[var(--container-color)] p-7 text-center">
    <p className="text-[var(--muted-color)]">Loading questions…</p>
  </div>
);

// Every piece of state here is scoped to one exam (via the storage keys) and
// the whole component remounts on exam switch (see `key={exam}` below), so
// progress and tab choice never leak between exams that happen to share
// question ids.
const ExamView = ({
  set,
  exam,
  examTitle,
  bank,
}: {
  set: SetType;
  exam: string;
  examTitle: string;
  bank: DerivedBank;
}) => {
  const names = { ...TITLES, ...set.names };
  const [view, setView] = useSaved<ViewType>(
    `${set.scope}:view:v1:${exam}`,
    freshView,
    validView,
  );
  const { lens } = view;
  const setSection = (next: SectionType) =>
    setView((prev) => ({ ...prev, section: next }));
  const setLens = (next: LensType) =>
    setView((prev) => ({ ...prev, lens: next }));

  const [stars, setStars, starsReady] = useSaved<Record<string, true>>(
    `${set.scope}:favorites:v1:${exam}`,
    freshStars,
    validStars,
  );
  const toggleStar = useCallback(
    (id: string) =>
      setStars((prev) => {
        const next = { ...prev };
        if (next[id]) delete next[id];
        else next[id] = true;
        return next;
      }),
    [setStars],
  );
  const known = useMemo(
    () =>
      new Set(
        [...bank.Chapters, ...bank.Skills, ...bank.Cases, ...bank.Judgment]
          .flatMap((entry) => entry.questions)
          .map((entry) => entry.id),
      ),
    [bank],
  );
  const starCount = Object.keys(stars).filter((id) => known.has(id)).length;

  const [favoritesSeen, setFavoritesSeen] = useState(false);
  useEffect(() => {
    if (view.section === "favorites" && starCount > 0) setFavoritesSeen(true);
    if (view.section !== "favorites") setFavoritesSeen(false);
  }, [view.section, starCount]);
  const showFavorites =
    starCount > 0 ||
    (view.section === "favorites" && (!starsReady || favoritesSeen));

  const available = useMemo(
    () =>
      SECTIONS.filter((entry) => {
        if (entry === "favorites") return showFavorites;
        if (entry === "skills") return bank.Skills.length > 0;
        if (entry === "cases") return bank.Cases.length > 0;
        if (entry === "judgment") return bank.Judgment.length > 0;
        return bank.Chapters.length > 0;
      }),
    [bank, showFavorites],
  );
  const section = available.includes(view.section)
    ? view.section
    : available[0];

  const [started, setStarted] = useState<StartType | null>(null);
  const [results, setResults, resultsReady] = useSaved<
    Record<string, ResultType>
  >(`${set.scope}:results:v1:${exam}`, freshMarks, validMarks);
  const [hashes, setHashes, hashesReady] = useSaved<Record<string, string>>(
    `${set.scope}:hashes:v2:${exam}`,
    freshHashes,
    validHashes,
  );
  const [deck, setDeck] = useState<QuestionType[]>([]);
  useEffect(() => {
    if (section && section !== view.section) {
      setSection(section);
      setStarted(null);
      setDeck([]);
    }
  }, [section, view.section]);
  const [at, setAt] = useState(0);
  const [pass, setPass] = useState(0);
  const pick = started?.pick ?? null;

  const mark = useCallback((id: string, correct: boolean) => {
    setResults((prev) => ({ ...prev, [id]: correct ? "solved" : "missed" }));
  }, []);

  useEffect(() => {
    if (!resultsReady || !hashesReady) return;
    const current = bank.ContentHashes;
    const stale = Object.keys(hashes).filter(
      (id) => current[id] && current[id] !== hashes[id],
    );
    if (stale.length > 0) {
      setResults((prev) => {
        const next = { ...prev };
        stale.forEach((id) => delete next[id]);
        return next;
      });
    }
    setHashes(current);
  }, [bank, resultsReady, hashesReady]);

  const { favoriteGroups, favoriteLabels } = useMemo(() => {
    const groupsOut: ChapterType[] = [];
    const labels = new Map<string, string>();
    const sources: [SectionType, ChapterType[]][] = [
      ["chapters", bank.Chapters],
      ["skills", bank.Skills],
      ["cases", bank.Cases],
      ["judgment", bank.Judgment],
    ];
    sources.forEach(([from, list]) => {
      list.forEach((entry) => {
        const questions = entry.questions.filter((item) => stars[item.id]);
        if (!questions.length) return;
        const id = `${from}:${entry.id}`;
        labels.set(
          id,
          from === "chapters" || from === "judgment"
            ? labelOf(entry)
            : from === "cases"
              ? `Chapter ${entry.id} · ${entry.title}`
              : entry.title,
        );
        groupsOut.push({
          ...entry,
          id,
          numberLabel: String(displayNumberOf(entry)),
          questions,
        });
      });
    });
    return { favoriteGroups: groupsOut, favoriteLabels: labels };
  }, [bank, stars]);

  const groups =
    section === "skills"
      ? bank.Skills
      : section === "cases"
        ? bank.Cases
        : section === "judgment"
          ? bank.Judgment
          : section === "favorites"
            ? favoriteGroups
            : bank.Chapters;
  const noun =
    section === "skills"
      ? (set.nouns.skills ?? "skills")
      : section === "cases"
        ? "cases"
        : section === "favorites"
          ? "favorites"
          : "chapters";
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
      : view.flatMap((entry) => entry.questions);

    const target = pool[index];
    const story =
      section !== "cases" &&
      section !== "favorites" &&
      target &&
      isStory(target)
        ? groups
            .flatMap((entry) => entry.questions)
            .filter((step) => step.caseId === target.caseId)
            .sort((a, b) => (a.caseStep ?? 0) - (b.caseStep ?? 0))
            .map((step) => ({ ...step, ordinal: step.caseStep }))
        : undefined;

    const run = story ?? pool;
    const sequential =
      !!story ||
      (section !== "favorites" &&
        run.some((entry) => entry.caseId && !isStory(entry)));
    const resume = run.findIndex((entry) => results[entry.id] !== "solved");
    const fallback = story
      ? Math.max(
          0,
          story.findIndex((step) => step.id === target?.id),
        )
      : index;
    const startAt = sequential && resume !== -1 ? resume : fallback;

    setDeck(run);
    setAt(startAt);
    setStarted({ pick: next, at: startAt });
  };

  // Starts the whole set of the current tab at the first question not yet
  // answered, so it picks up where the learner left off.
  const run = (which: LensType) => {
    setLens(which);
    const list = viewFor(which);
    const pool = list.flatMap((entry) => entry.questions);
    open("all", firstToDo(pool, results), list);
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
      section === "favorites"
        ? (favoriteLabels.get(entry.id) ?? entry.title)
        : section === "chapters" || section === "judgment"
          ? labelOf(entry)
          : section === "cases"
            ? `Chapter ${entry.id} · ${entry.title}`
            : entry.title,
    [section, favoriteLabels],
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

  const [arriving, setArriving] = useState<SectionType | null>(null);
  const swap = (next: SectionType) => {
    setSection(next);
    setStarted(null);
    setDeck([]);
    setAt(0);
    setArriving(next);
  };
  useEffect(() => {
    if (arriving === null || section !== arriving) return;
    setArriving(null);
    if (groups.length > 0) run(lens);
  }, [arriving, section]);

  if (!section) {
    return (
      <div className="mb-8 rounded-2xl bg-[var(--container-color)] p-7 text-center">
        <p className="text-[var(--muted-color)]">
          {examTitle} doesn&apos;t have any questions yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {available.length > 1 && (
        <div className="mb-6 lg:flex lg:justify-center">
          <div className="ml-3.5 inline-flex gap-x-1 rounded-md bg-[var(--container-color)] p-1 lg:ml-0">
            {available.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => swap(entry)}
                aria-pressed={section === entry}
                className={`${tab} ${
                  section === entry
                    ? "bg-[var(--chip-blue)] text-[var(--title-color)] shadow-lg"
                    : "text-[var(--muted-color)] hover:text-[var(--title-color)]"
                }`}
              >
                {names[entry]}
                {entry === "favorites" && starsReady && starCount > 0
                  ? ` (${starCount})`
                  : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      <h2 className="relative mb-1 ml-3.5 text-3xl font-bold lg:ml-0 lg:text-center">
        <TypedText text={names[section]} reserve={Object.values(names)} />
      </h2>

      {shown.length === 0 ? (
        <div className="mb-8 rounded-2xl bg-[var(--container-color)] p-7 text-center">
          {section === "favorites" && empty ? (
            <>
              <p className="mb-1 text-lg font-bold text-[var(--title-color)]">
                No favorites yet.
              </p>
              <p className="text-[var(--muted-color)]">
                Tap the star on any question to save it here.
              </p>
            </>
          ) : empty ? (
            <>
              <p className="mb-1 text-lg font-bold text-[var(--title-color)]">
                Not in {examTitle}.
              </p>
              <p className="text-[var(--muted-color)]">
                This exam doesn&apos;t include {noun}. Try another tab.
              </p>
            </>
          ) : (
            <>
              <p className="mb-4 text-lg font-bold text-[var(--title-color)]">
                Nothing left here.
              </p>
              <p className="text-[var(--muted-color)]">
                Every question in {noun} is answered correctly. Switch back to
                All to run them again.
              </p>
              <button
                type="button"
                onClick={() => setLens("all")}
                className="mt-5 inline-block rounded-md border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-[var(--on-primary)] shadow-lg"
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
          picker={section === "skills" ? "select" : "grid"}
          placeholder={`Choose ${set.picks.skills ?? "a skill"}…`}
          starred={stars}
        />
      )}

      <Swap
        token={`${section}-${lens}-${String(pick)}-${deck[started?.at ?? -1]?.id ?? "none"}`}
      >
        {started === null || deck.length === 0 ? (
          <p className="ml-3.5 text-[var(--muted-color)] lg:ml-0 lg:text-center">
            Pick{" "}
            {section === "skills"
              ? (set.picks.skills ?? "a skill")
              : section === "cases"
                ? "a case"
                : "a chapter"}{" "}
            above to see its questions, or hit All to run the whole set.
          </p>
        ) : (
          <>
            <h3 className="mb-6 ml-3.5 text-xl lg:ml-0 lg:text-center">
              {group?.members && group.members.length > 1 ? (
                <>
                  Chapter{" "}
                  <Flash
                    items={group.members.map((member) =>
                      String(member.chapterNumber),
                    )}
                  />{" "}
                  · {group.title}
                </>
              ) : (
                label
              )}
            </h3>
            <Quiz
              key={`${section}-${lens}-${String(pick)}-${deck[started.at]?.id}-${pass}`}
              label={label}
              questions={deck}
              start={started.at}
              results={results}
              onResult={mark}
              onMove={setAt}
              starred={stars}
              onStar={toggleStar}
            />
          </>
        )}
      </Swap>
    </>
  );
};

const Nclex = ({ kind = "nclex" }: { kind?: SetKind }) => {
  const set = SETS[kind];
  const [exams, setExams] = useState<KaplanExamType[]>(
    kind === "nclex" ? EXAMS.map((id) => ({ id, title: EXAM_TITLES[id] })) : [],
  );
  const [saved, setExam] = useSaved<string>(
    set.examKey,
    () => (kind === "nclex" ? "exam1" : ""),
    (value) => typeof value === "string",
  );
  const exam =
    exams.find((entry) => entry.id === saved)?.id ?? exams[0]?.id ?? "";
  const examTitle = exams.find((entry) => entry.id === exam)?.title ?? "";
  const [bank, setBank] = useState<DerivedBank | null>(null);

  useEffect(() => {
    if (kind !== "kaplan") return;
    let alive = true;
    loadKaplanExams().then((list) => {
      if (alive) setExams(list);
    });
    return () => {
      alive = false;
    };
  }, [kind]);

  useEffect(() => {
    if (!exam) return;
    let alive = true;
    setBank(null);
    const load =
      kind === "kaplan" ? loadKaplanBank(exam) : loadBank(exam as ExamId);
    load.then((next) => {
      if (alive) setBank(next);
    });
    return () => {
      alive = false;
    };
  }, [kind, exam]);

  return (
    <>
      <div className="pointer-events-none fixed inset-y-0 left-20 right-0 -z-[5] overflow-hidden lg:left-0">
        <Shapes />
      </div>

      <section className="relative mx-auto max-w-[1080px] animate-fadeIn px-10 pb-24 pt-28 lg:pt-12 md:px-6">
        <div className="relative z-10">
          <div className="mb-2 flex items-start justify-between gap-x-4 lg:flex-col lg:items-center lg:gap-y-3">
            <h1 className="relative ml-3.5 text-4xl font-bold lg:ml-0 lg:text-center">
              <TypedText segments={set.heading} typeOnMount />
            </h1>

            <div className="relative shrink-0">
              <select
                value={exam}
                onChange={(event) => {
                  setExam(event.target.value);
                }}
                aria-label="Exam"
                className="h-10 cursor-pointer appearance-none rounded-md border-none bg-[var(--container-color)] pl-5 pr-11 text-sm font-bold text-[var(--title-color)] shadow-inner outline-none"
              >
                {exams.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.title}
                  </option>
                ))}
              </select>
              <PiCaretDownBold
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-color)]"
              />
            </div>
          </div>

          <p className="mb-10 ml-3.5 lg:ml-0 lg:text-center">
            {bank ? bank.Course : ` `}
          </p>

          {bank ? (
            <ExamView
              key={`${kind}-${exam}`}
              set={set}
              exam={exam}
              examTitle={examTitle}
              bank={bank}
            />
          ) : (
            <Loading />
          )}
        </div>
      </section>
    </>
  );
};

export default Nclex;
