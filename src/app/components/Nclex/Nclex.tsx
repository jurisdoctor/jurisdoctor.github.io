"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import Shapes from "../Home/Shapes";
import { useSaved } from "../DosageCalculations/Saved";
import {
  EXAMS,
  EXAM_KEY,
  EXAM_TITLES,
  ExamId,
  isExamId,
  loadBank,
} from "./Bank";
import ChapterSet, { LensType, PickType, ResultType } from "./ChapterSet";
import Flash from "./Flash";
import {
  ChapterType,
  DerivedBank,
  displayNumberOf,
  labelOf,
  QuestionType,
} from "./Questions";
import Quiz from "./Quiz";
import Swap from "./Swap";

type SectionType = "chapters" | "skills" | "cases" | "judgment" | "favorites";

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

const validView = (saved: ViewType) =>
  !!saved &&
  SECTIONS.includes(saved.section) &&
  (saved.lens === "all" || saved.lens === "incomplete");

const Loading = () => (
  <div className="mb-8 rounded-2xl bg-[var(--body-color)] p-7 text-center">
    <p className="text-[var(--muted-color)]">Loading questions…</p>
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

  const [stars, setStars, starsReady] = useSaved<Record<string, true>>(
    `nclex:favorites:v1:${exam}`,
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
  const starCount = Object.keys(stars).length;

  // Favorites only gets a tab while there is something in it. Two cases keep
  // it around past that: before the saved stars have loaded (otherwise a
  // saved Favorites tab would be bumped to Chapters for a frame and the
  // choice overwritten), and after un-starring the last one while still
  // looking at the tab, so the page doesn't change under the learner — it
  // goes as soon as they move to another tab.
  const [favoritesSeen, setFavoritesSeen] = useState(false);
  useEffect(() => {
    if (view.section === "favorites" && starCount > 0) setFavoritesSeen(true);
    if (view.section !== "favorites") setFavoritesSeen(false);
  }, [view.section, starCount]);
  const showFavorites =
    starCount > 0 ||
    (view.section === "favorites" && (!starsReady || favoritesSeen));

  // Only offer tabs this exam actually has content for.
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
  >(`nclex:results:v1:${exam}`, freshMarks, validMarks);
  const [hashes, setHashes, hashesReady] = useSaved<Record<string, string>>(
    `nclex:hashes:v1:${exam}`,
    freshHashes,
    validHashes,
  );
  const [deck, setDeck] = useState<QuestionType[]>([]);
  useEffect(() => {
    if (section && section !== view.section) {
      setSection(section);
      // A run that belonged to the tab being left (e.g. Favorites, once it
      // empties and goes away) has nothing to show on the new one.
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

  // A question keeps its id across data drops even when its content is
  // edited, so a saved result can go stale without ever looking invalid.
  // Once both stores have loaded, drop the mark for any id whose content
  // hash no longer matches what it was last time, then record the new
  // baseline. First run ever (hashes still empty) sees nothing stale and
  // just establishes the baseline, so no one's existing progress is wiped.
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

  // Favorites is a view across every other tab: each starred question is
  // gathered back under the chapter, skill, case or judgment group it came
  // from. The ids are prefixed by tab because the tabs reuse ids (a chapter
  // and its judgment group share one), and the label each came from is
  // kept so the tile and heading still read as "Chapter 27 · ..." etc.
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
      ? "skills"
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
      section !== "cases" && section !== "favorites" && target?.caseId
        ? bank.Cases.find((entry) =>
            entry.questions.some((step) => step.id === target.id),
          )
        : undefined;

    const run = story ? story.questions : pool;
    const sequential =
      section !== "favorites" && run.some((entry) => entry.caseId);
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

  const swap = (next: SectionType) => {
    setSection(next);
    setStarted(null);
    setDeck([]);
    setAt(0);
  };

  if (!section) {
    return (
      <div className="mb-8 rounded-2xl bg-[var(--body-color)] p-7 text-center">
        <p className="text-[var(--muted-color)]">
          {EXAM_TITLES[exam]} doesn&apos;t have any questions yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {available.length > 1 && (
        <div className="mb-6 lg:flex lg:justify-center">
          <div className="ml-3.5 inline-flex gap-x-1 rounded-[1.875rem] bg-[var(--body-color)] p-1 lg:ml-0">
            {available.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => swap(entry)}
                aria-pressed={section === entry}
                className={`${tab} ${
                  section === entry
                    ? "bg-[var(--container-color)] text-[var(--title-color)] shadow-lg"
                    : "text-[var(--muted-color)] hover:text-[var(--title-color)]"
                }`}
              >
                {TITLES[entry]}
                {entry === "favorites" && starsReady && starCount > 0
                  ? ` (${starCount})`
                  : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      <Swap
        token={section}
        className="relative mb-1 ml-3.5 text-3xl font-bold lg:ml-0 lg:text-center"
      >
        <h2>{TITLES[section]}</h2>
      </Swap>

      {shown.length === 0 ? (
        <div className="mb-8 rounded-2xl bg-[var(--body-color)] p-7 text-center">
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
                Not in {EXAM_TITLES[exam]}.
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
          picker={section === "skills" ? "select" : "grid"}
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
              ? "a skill"
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
                    items={group.members.map((member, memberIndex) => (
                      <span key={memberIndex}>{member.chapterNumber}</span>
                    ))}
                  />{" "}
                  · {group.title}
                </>
              ) : (
                label
              )}
            </h3>
            {/* Keyed by the actual question id, not started.at: under the
                Incomplete lens the pool shrinks as items are solved, so
                "the next question" often lands back at index 0. Keying on
                that raw index let two different questions share a key,
                which kept Quiz mounted and leaked its answered/chosen state
                from the old question onto the new one. */}
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
    <>
      {/* This layer must stay a sibling of the section below, not a child:
        the section runs animate-fadeIn with fill-mode "both", which leaves a
        transform on it permanently, and any element with a transform becomes
        the containing block for its `fixed` descendants. Nested inside, this
        "fixed" layer was really sized to the section's own box — 1080px wide
        and only as tall as the content — so shapes hit an invisible wall at
        its edges instead of roaming the viewport. left-20 matches the
        sidebar's own width (see Sidebar.tsx's "ml-20 lg:ml-0" convention). */}
      <div className="pointer-events-none fixed inset-y-0 left-20 right-0 z-0 overflow-hidden lg:left-0">
        <Shapes />
      </div>

      <section className="relative mx-auto max-w-[1080px] animate-fadeIn px-10 pb-24 pt-28 lg:pt-12 md:px-6">
        <div className="relative z-10">
          <div className="mb-2 flex items-start justify-between gap-x-4 lg:flex-col lg:items-center lg:gap-y-3">
            <h1 className="relative ml-3.5 text-4xl font-bold lg:ml-0 lg:text-center">
              NCLEX-<em>style</em> Questions
            </h1>

            <div className="relative shrink-0">
              <select
                value={exam}
                onChange={(event) => {
                  const next = event.target.value;
                  if (isExamId(next)) setExam(next);
                }}
                aria-label="Exam"
                className="h-10 cursor-pointer appearance-none rounded-[1.875rem] border-none bg-[var(--body-color)] pl-5 pr-11 text-sm font-bold text-[var(--title-color)] shadow-inner outline-none"
              >
                {EXAMS.map((id) => (
                  <option key={id} value={id}>
                    {EXAM_TITLES[id]}
                  </option>
                ))}
              </select>
              <LuChevronDown
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-color)]"
              />
            </div>
          </div>

          <p className="mb-10 ml-3.5 lg:ml-0 lg:text-center">
            {bank ? bank.Course : ` `}
          </p>

          {bank ? <ExamView key={exam} exam={exam} bank={bank} /> : <Loading />}
        </div>
      </section>
    </>
  );
};

export default Nclex;
