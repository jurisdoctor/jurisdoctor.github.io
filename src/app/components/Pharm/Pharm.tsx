"use client";
import { ReactNode, useRef, useState } from "react";
import { LuChevronDown, LuCheck, LuLock } from "react-icons/lu";
import { useSaved } from "../DosageCalculations/Saved";
import { ResultType } from "../Nclex/ChapterSet";
import Quiz from "../Nclex/Quiz";
import RevealBox from "../Reveal";
import {
  Checklist,
  Fields,
  FlipCards,
  Mcq,
  NameField,
  OrderActivity,
  ReadinessQuiz,
  Reveal,
  SortActivity,
} from "./Activities";
import { LAST_INDEX, REFERENCES, STEPS } from "./content";
import { blockDone, stepDone, stepTasks } from "./logic";
import { Block } from "./types";

interface ProgressType {
  name: string;
  cur: number;
  max: number;
  d: Record<string, any>;
  doneAt: string | null;
}

const KEY = "pharm:progress:v2";
const fresh = (): ProgressType => ({ name: "", cur: 0, max: 0, d: {}, doneAt: null });
const valid = (saved: ProgressType) =>
  !!saved &&
  typeof saved === "object" &&
  Number.isInteger(saved.cur) &&
  saved.cur >= 0 &&
  saved.cur < STEPS.length &&
  Number.isInteger(saved.max) &&
  !!saved.d &&
  typeof saved.d === "object";

const button =
  "inline-block rounded-xl border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:brightness-100";
const ghost =
  "inline-block rounded-xl border-[1px] border-solid border-[var(--primary-color)] bg-transparent px-8 py-3 font-bold leading-4 text-[var(--primary-color)] duration-200 hover:bg-[var(--primary-color)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--primary-color)]";

const calloutClass: Record<string, string> = {
  tip: "border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)]",
  critical: "border-[var(--primary-color)] bg-[var(--chip-amber)]",
  idea: "border-[var(--chip-blue-border)] bg-[var(--chip-blue)]",
  takeaway: "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.08)]",
  reference: "border-[var(--muted-color)] bg-[var(--body-color)]",
};

const Finale = ({
  state,
  onReview,
}: {
  state: ProgressType;
  onReview: () => void;
}) => {
  const when = state.doneAt
    ? new Date(state.doneAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const habit = state.d.exit?.habit as string | undefined;
  const first = (state.name || "").trim().split(" ")[0];

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold text-[var(--title-color)]">
        You did it{first ? `, ${first}` : ""}! 🎉
      </h2>
      <p className="mb-6 text-sm text-[var(--muted-color)]">
        All lessons, activities, and cases are complete.
      </p>

      <div className="mb-6 rounded-xl border border-dashed border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)] p-8 text-center">
        <div className="mb-2 text-4xl">🏆</div>
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--case-label-color)]">
          Certificate of completion
        </p>
        <h2 className="mt-1 text-xl font-bold text-[var(--title-color)]">
          Medication Safety Foundations
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-color)]">
          Pharmacology Crash Course 1 · awarded to
        </p>
        <p className="mt-2 text-lg font-bold text-[var(--title-color)]">
          {state.name || "Student"}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-color)]">{when}</p>
      </div>

      <div className="grid gap-y-4">
        {habit && (
          <div
            className={`rounded-lg border-l-4 px-4 py-3 text-sm text-[var(--title-color)] ${calloutClass.idea}`}
          >
            <span className="mr-1 font-semibold">Your commitment:</span>
            {habit}
          </div>
        )}
        <div
          className={`rounded-lg border-l-4 px-4 py-3 text-sm text-[var(--title-color)] ${calloutClass.takeaway}`}
        >
          <span className="mr-1 font-semibold">Remember:</span>
          check → think → act → recheck. Every med, every time.
        </div>

        <h3 className="text-lg font-semibold text-[var(--title-color)]">
          References
        </h3>
        <ul className="grid gap-y-2 text-sm text-[var(--text-color)]">
          {REFERENCES.map((reference, index) => (
            <li key={index} className="flex items-start gap-x-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--chip-blue-border)] bg-transparent text-[10px] font-bold text-[var(--chip-blue-border)]">
                {index + 1}
              </span>
              <span className="leading-relaxed">{reference}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs italic text-[var(--muted-color)]">
          Always verify specific drugs in a current drug reference and
          follow facility policy and protocols.
        </p>

        <div className="flex flex-wrap gap-4">
          <button type="button" onClick={() => window.print()} className={button}>
            🖨 Print certificate
          </button>
          <button type="button" onClick={onReview} className={ghost}>
            Review Top 10
          </button>
        </div>
      </div>
    </div>
  );
};

const Pharm = () => {
  const [state, setState, ready] = useSaved(KEY, fresh, valid);
  const rootRef = useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = useState(false);

  const setData = (id: string, value: any) => {
    setState((prev) => {
      const resolved = typeof value === "function" ? value(prev.d[id]) : value;
      // Quiz.tsx fires onMove(at) from a [at, onMove] effect, so a fresh
      // onMove closure on every render would otherwise retrigger the effect
      // forever. Bailing out when nothing actually changed keeps setState
      // from handing back a new object every time and breaks that loop.
      if (resolved === prev.d[id]) return prev;
      return { ...prev, d: { ...prev.d, [id]: resolved } };
    });
  };

  const patch = (
    partial:
      | Partial<ProgressType>
      | ((prev: ProgressType) => Partial<ProgressType>),
  ) => {
    setState((prev) => ({
      ...prev,
      ...(typeof partial === "function" ? partial(prev) : partial),
    }));
  };

  if (!ready) return null;

  const i = Math.min(state.cur, state.max);
  const step = STEPS[i];
  const tasks = stepTasks(step);
  const left = tasks.filter((block) => !blockDone(block, state.d, state.name))
    .length;
  const canContinue = stepDone(step, state.d, state.name);
  const pct = Math.round((Math.min(state.max, LAST_INDEX) / LAST_INDEX) * 100);

  const scrollTop = () => {
    const top = (rootRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const go = (index: number) => {
    if (index < 0 || index > state.max) return;
    patch({ cur: index });
    setNavOpen(false);
    scrollTop();
  };

  const next = () => {
    if (!canContinue) return;
    const finishing = i + 1 === LAST_INDEX;
    patch((prev) => ({
      cur: i + 1,
      max: Math.max(prev.max, i + 1),
      doneAt: finishing && !prev.doneAt ? new Date().toISOString() : prev.doneAt,
    }));
    scrollTop();
  };

  const confirmReset = () => {
    if (
      window.confirm("Reset all progress and answers? This cannot be undone.")
    ) {
      setState(fresh());
    }
  };

  const renderBlock = (block: Block, key: number): ReactNode => {
    switch (block.type) {
      case "heading":
        return (
          <h3
            key={key}
            className="mt-2 text-lg font-semibold text-[var(--title-color)] first:mt-0"
          >
            {block.text}
          </h3>
        );

      case "p":
        return (
          <p key={key} className="text-[var(--text-color)]">
            {block.text}
          </p>
        );

      case "callout":
        return (
          <div
            key={key}
            className={`rounded-lg border-l-4 px-4 py-3 text-sm text-[var(--title-color)] ${calloutClass[block.tone]}`}
          >
            <span className="mr-1 font-semibold">{block.title}:</span>
            {block.text}
          </div>
        );

      case "list": {
        const Tag = block.ordered ? "ol" : "ul";
        return (
          <Tag key={key} className="grid gap-y-2.5">
            {block.items.map((item, itemIndex) => (
              <li
                key={itemIndex}
                className="flex items-start gap-x-3 text-[var(--text-color)]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--chip-blue-border)] bg-transparent text-[10px] font-bold text-[var(--chip-blue-border)]">
                  {block.ordered ? itemIndex + 1 : "✓"}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </Tag>
        );
      }

      case "table":
        return (
          <div
            key={key}
            className="overflow-x-auto rounded-lg border border-[var(--border-color)]"
          >
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[var(--chip-blue-soft)]">
                  {block.headers.map((header, headerIndex) => (
                    <th
                      key={headerIndex}
                      className="border-b border-[var(--border-color)] px-3 py-2 font-semibold text-[var(--title-color)]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-[var(--border-color)] last:border-b-0"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-3 py-2 align-top text-[var(--text-color)]"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "node":
        return <div key={key}>{block.node}</div>;

      case "name":
        return (
          <NameField
            key={key}
            value={state.name}
            onChange={(name) => patch({ name })}
            ok={blockDone(block, state.d, state.name)}
          />
        );

      case "mcq":
        return (
          <Mcq
            key={key}
            q={block.q}
            options={block.options}
            answer={block.answer}
            explain={block.explain}
            data={state.d[block.id]}
            setData={(value) => setData(block.id, value)}
          />
        );

      case "reveal":
        return (
          <Reveal
            key={key}
            q={block.q}
            answer={block.answer}
            data={state.d[block.id]}
            setData={(value) => setData(block.id, value)}
          />
        );

      case "flip":
        return (
          <FlipCards
            key={key}
            items={block.items}
            data={state.d[block.id]}
            setData={(value) => setData(block.id, value)}
          />
        );

      case "sort":
        return (
          <SortActivity
            key={key}
            q={block.q}
            buckets={block.buckets}
            items={block.items}
            data={state.d[block.id]}
            setData={(value) => setData(block.id, value)}
          />
        );

      case "order":
        return (
          <OrderActivity
            key={key}
            id={block.id}
            q={block.q}
            items={block.items}
            data={state.d[block.id]}
            setData={(value) => setData(block.id, value)}
          />
        );

      case "check":
        return (
          <Checklist
            key={key}
            q={block.q}
            items={block.items}
            data={state.d[block.id]}
            setData={(value) => setData(block.id, value)}
          />
        );

      case "fields":
        return (
          <Fields
            key={key}
            items={block.items}
            data={state.d[block.id]}
            setData={(value) => setData(block.id, value)}
            ok={blockDone(block, state.d, state.name)}
          />
        );

      case "readinessQuiz":
        return (
          <ReadinessQuiz
            key={key}
            questions={block.questions}
            data={state.d[block.id]}
            setData={(value) => setData(block.id, value)}
          />
        );

      case "nclexQuiz": {
        const results: Record<string, ResultType> = state.d[block.id] ?? {};
        return (
          <div
            key={key}
            className="rounded-xl ring-1 ring-[var(--chip-blue-border)] ring-offset-2 ring-offset-[var(--container-color)]"
          >
            <Quiz
              key={block.id}
              label={block.label}
              questions={block.questions}
              // Quiz's own "again" (the completion-screen Redo) resets back
              // to this prop, not to 0 — it must stay fixed at the real
              // start, never tracked live from onMove, or a finished quiz's
              // last-viewed question becomes the redo target instead of
              // question 1.
              start={0}
              results={results}
              onResult={(id, correct) =>
                setData(block.id, (prev: Record<string, ResultType>) => ({
                  ...(prev ?? {}),
                  [id]: correct ? "solved" : "missed",
                }))
              }
              onMove={() => {}}
              // Every question must be solved to pass, so a partial redo
              // (clearing just one question) would leave stale results from
              // a prior failed attempt sitting behind it — clear the whole
              // set for a clean restart.
              onRedo={() => setData(block.id, {})}
            />
          </div>
        );
      }

      case "after":
        return canContinue ? (
          <div key={key} className="rounded-xl bg-[var(--chip-blue-soft)] p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--case-label-color)]">
              {block.title}
            </p>
            <div className="text-[var(--title-color)]">{block.node}</div>
          </div>
        ) : (
          <div
            key={key}
            className="rounded-xl border border-dashed border-[var(--border-color)] p-4 text-sm text-[var(--muted-color)]"
          >
            🔒 Finish the activities above to see the facilitator&apos;s
            answer.
          </div>
        );

      default:
        return null;
    }
  };

  let lastSection = "";

  return (
    <section
      className="min-h-screen px-6 py-16 lg:px-10 sm:px-4 sm:py-10"
      ref={rootRef}
    >
      <div className="mx-auto max-w-5xl">
        <RevealBox>
          <h1 className="text-3xl font-bold text-[var(--title-color)]">
            Pharmacology Crash Course
          </h1>
          <p className="mt-1 text-[var(--muted-color)]">
            Medication Safety Foundations
          </p>
        </RevealBox>

        <RevealBox delay={80} className="my-6">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
            <span>Course progress</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--track-color)]">
            <div
              className="h-full rounded-full bg-[var(--primary-color)] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </RevealBox>

        <RevealBox delay={140} className="flex items-start gap-8 xl:flex-col xl:gap-6">
          <nav className="sticky top-8 w-72 shrink-0 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 shadow-xl backdrop-blur-xl xl:static xl:w-full">
            {/* Only shown once the layout has stacked (xl: and below) —
                side-by-side on desktop there's room for the full step list
                always open, but stacked on top of the content on tablet and
                phone, 24 steps of outline is a lot to scroll past just to
                reach the lesson. Collapsed by default there, tap to open. */}
            <button
              type="button"
              onClick={() => setNavOpen((open) => !open)}
              className="hidden w-full items-center justify-between gap-x-3 rounded-lg px-3 py-2.5 text-left text-sm duration-150 xl:flex"
            >
              <span className="flex min-w-0 items-center gap-x-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--chip-blue)] text-[11px] font-bold text-[var(--title-color)]">
                  {i + 1}
                </span>
                <span className="truncate font-bold text-[var(--title-color)]">
                  {step.title}
                </span>
              </span>
              <LuChevronDown
                className={`shrink-0 text-[var(--muted-color)] duration-150 ${navOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div className={navOpen ? "mt-2" : "xl:hidden"}>
            {STEPS.map((entry, index) => {
              const sectionHeading =
                entry.section !== lastSection ? entry.section : null;
              lastSection = entry.section;
              const unlocked = index <= state.max;
              const current = index === i;
              const complete =
                !current &&
                (index < state.max || (!!entry.final && !!state.doneAt));

              return (
                <div key={entry.id} className="mt-1 first:mt-0">
                  {sectionHeading && (
                    <p className="mb-2 mt-6 px-3 text-[11px] font-bold uppercase tracking-wide text-[var(--muted-color)] first:mt-0">
                      {sectionHeading}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => go(index)}
                    className={`flex w-full items-center gap-x-3 rounded-lg px-3 py-2.5 text-left text-sm leading-snug duration-150 ${
                      current
                        ? "bg-[var(--chip-blue)] font-bold text-[var(--title-color)]"
                        : unlocked
                          ? "text-[var(--text-color)] hover:bg-[var(--body-color)]"
                          : "cursor-not-allowed text-[var(--muted-color)] opacity-50"
                    }`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--body-color)] text-[11px]">
                      {!unlocked ? (
                        <LuLock />
                      ) : complete ? (
                        <LuCheck className="text-[rgb(68,215,182)]" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="truncate">{entry.title}</span>
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={confirmReset}
              className="mt-6 w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[var(--muted-color)] hover:text-[var(--primary-color)]"
            >
              Reset progress
            </button>
            </div>
          </nav>

          <div className="min-w-0 flex-1 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-7 shadow-xl backdrop-blur-xl xl:w-full sm:p-4">
            {step.final ? (
              <Finale state={state} onReview={() => go(1)} />
            ) : (
              <>
                <div className="mb-1 flex items-center gap-x-2 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                  <span>{step.icon}</span>
                  <span>{step.section}</span>
                </div>
                <h2 className="mb-1 text-2xl font-bold text-[var(--title-color)]">
                  {step.title}
                </h2>
                {step.meta && (
                  <p className="mb-6 text-sm text-[var(--muted-color)]">
                    {step.meta}
                  </p>
                )}

                <div className="grid gap-y-5">
                  {step.blocks.map((block, index) => renderBlock(block, index))}
                </div>

                <div className="mt-8 flex items-center justify-between gap-2 border-t border-[var(--border-color)] pt-6 sm:gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => go(i - 1)}
                    className={`${ghost} min-w-0 shrink px-5 sm:px-3`}
                  >
                    ← Back
                  </button>

                  {tasks.length > 0 && (
                    <span
                      title={
                        canContinue
                          ? "All activities complete"
                          : `${left} ${left === 1 ? "activity" : "activities"} left to unlock the next step`
                      }
                      className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${
                        canContinue
                          ? "text-[rgb(68,215,182)]"
                          : "text-[var(--muted-color)]"
                      }`}
                    >
                      {canContinue
                        ? "✓"
                        : `🔒 ${tasks.length - left}/${tasks.length}`}
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={!canContinue}
                    onClick={next}
                    className={`${button} min-w-0 shrink px-5 sm:px-3`}
                  >
                    {i === 0
                      ? "Start course →"
                      : i + 1 === LAST_INDEX
                        ? "Finish course 🏆"
                        : "Continue →"}
                  </button>
                </div>
              </>
            )}
          </div>
        </RevealBox>
      </div>
    </section>
  );
};

export default Pharm;
