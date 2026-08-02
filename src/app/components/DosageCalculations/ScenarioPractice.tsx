"use client";

import { useEffect, useRef, useState } from "react";
import { ScenarioType, Scenarios, StepType, TermType } from "./Scenarios";

/** fisher-yates over the indexes, so every scenario comes up once per pass */
const shuffled = () => {
  const order = Scenarios.map((_, id) => id);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

type Status = "answering" | "solved" | "missed";

const formatAnswer = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n);

/**
 * Counts as correct if it's within the scenario's tolerance, or if it's the
 * exact answer rounded the way you'd actually chart it — 11.25 mL typed as
 * 11.3 is right, not wrong.
 */
const accepted = (given: number, answer: number, tolerance: number) =>
  Math.abs(given - answer) <= tolerance ||
  [1, 2, 3].some(
    (places) => Math.abs(given - Number(answer.toFixed(places))) < 1e-9,
  );

const Term = ({ term }: { term: TermType }) => {
  if (term.value) {
    return <span>{term.value}</span>;
  }

  return (
    <span className="inline-flex flex-col text-center leading-tight">
      <span className="px-3 pb-1">{term.top}</span>
      <span className="border-t border-solid border-[var(--text-color)] px-3 pt-1">
        {term.bottom}
      </span>
    </span>
  );
};

const Step = ({ step, number }: { step: StepType; number: number }) => (
  <div className="mb-6 last:mb-0">
    <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
      {step.label}
    </span>

    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 sm:text-sm">
      {step.chain.map((term, id) => (
        <span key={id} className="flex items-center gap-x-3">
          {id > 0 && <span className="text-[#8b88b1]">×</span>}
          <Term term={term} />
        </span>
      ))}

      <span className="text-[#8b88b1]">=</span>
      <span className="font-bold text-[var(--title-color)]">{step.result}</span>
    </div>

    <div className="mt-3 flex gap-x-3">
      <span className="mt-0.5 shrink-0 self-start rounded-full bg-[hsla(43,100%,68%,0.25)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--title-color)]">
        Tip {number}
      </span>
      <p className="max-w-[70ch] text-sm text-[#8b88b1]">{step.why}</p>
    </div>
  </div>
);

/** one numbered row of the six-question set-up */
const Question = ({
  number,
  title,
  answer,
  children,
}: {
  number: number;
  title: string;
  answer?: string;
  children?: React.ReactNode;
}) => (
  <div className="flex gap-x-4">
    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-solid border-[var(--primary-color)] text-xs font-bold text-[var(--primary-color)]">
      {number}
    </span>

    <div className="min-w-0 flex-1">
      <p className="font-bold text-[var(--title-color)]">{title}</p>
      {answer && (
        <p className="mt-1 font-bold text-[var(--primary-color)]">{answer}</p>
      )}
      {children}
    </div>
  </div>
);

/** the same six questions as the reference card, filled in for this scenario */
const Solution = ({ scenario }: { scenario: ScenarioType }) => {
  const { setup } = scenario;
  const convertAt = setup.lookups.length + 2;

  return (
    <div className="grid gap-y-5">
      <Question
        number={1}
        title="Determine the unit you are calculating."
        answer={setup.unit}
      />

      {setup.lookups.map((lookup, id) => (
        <Question
          key={lookup.label}
          number={id + 2}
          title={`Determine the ${lookup.label.toLowerCase()}.`}
          answer={lookup.value}
        />
      ))}

      <Question
        number={convertAt}
        title="Do you need to convert units?"
        answer={setup.convert}
      />

      <Question number={convertAt + 1} title="Set up the problem and solve.">
        <div className="mt-4">
          {scenario.steps.map((step, id) => (
            <Step key={id} step={step} number={id + 1} />
          ))}
        </div>
      </Question>
    </div>
  );
};

const Verdict = ({
  correct,
  answer,
}: {
  correct: boolean;
  answer: React.ReactNode;
}) => (
  <div
    className={`mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl p-5 ${
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
      {answer}
    </span>
  </div>
);

const ScenarioPractice = () => {
  // the order is drawn on the client so the prerendered html still hydrates
  const [order, setOrder] = useState<number[] | null>(null);
  const [position, setPosition] = useState(0);
  const [entry, setEntry] = useState("");
  const [status, setStatus] = useState<Status>("answering");
  const [score, setScore] = useState({ right: 0, asked: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setOrder(shuffled()), []);

  const scenario = order ? Scenarios[order[position]] : null;

  const next = () => {
    setPosition((prev) => {
      // reshuffle once you've been through the whole set
      if (prev + 1 >= Scenarios.length) {
        setOrder(shuffled());
        return 0;
      }
      return prev + 1;
    });
    setEntry("");
    setStatus("answering");
    inputRef.current?.focus();
  };

  const check = () => {
    if (!scenario) return;

    const given = Number(entry.replace(/,/g, "").trim());
    if (entry.trim() === "" || Number.isNaN(given)) return;

    const isRight = accepted(given, scenario.answer, scenario.tolerance);

    setStatus(isRight ? "solved" : "missed");
    setScore((prev) => ({
      right: prev.right + (isRight ? 1 : 0),
      asked: prev.asked + 1,
    }));

    // clicking Check moves focus to the button — put it back so enter carries on
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
    <section className="mb-16" id="scenarios">
      <h2 className="relative mb-2 ml-3.5 text-3xl font-bold lg:ml-0 lg:text-center">
        Nursing Scenarios
      </h2>
      <p className="mb-8 ml-3.5 text-sm lg:ml-0 lg:text-center">
        Word problems from the floor, in random order. Miss one and the
        dimensional analysis gets worked out step by step.
      </p>

      <div className="animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 shadow-xl">
        {!scenario ? (
          <p className="py-6 text-center text-[#8b88b1]">
            Shuffling {Scenarios.length} scenarios…
          </p>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="mb-3 flex items-center justify-between gap-x-4">
              <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
                {position + 1} of {Scenarios.length}
              </span>
              <span className="text-sm text-[#8b88b1]">
                {score.right} / {score.asked}
              </span>
            </div>

            <h3 className="mb-3 text-xl">{scenario.title}</h3>
            <p className="mb-6">{scenario.prompt}</p>

            <div className="mb-4 flex items-center gap-x-4 sm:flex-col sm:items-stretch sm:gap-y-4">
              <div className="relative h-14 flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={entry}
                  // read-only rather than disabled so it keeps focus and
                  // enter still moves on to the next scenario
                  readOnly={status !== "answering"}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder={`Answer in ${scenario.unit}`}
                  className={`absolute left-0 top-0 z-10 h-full w-full rounded-2xl border-none bg-[var(--body-color)] px-[1.875rem] py-[0.625rem] text-[var(--text-color)] shadow-inner outline-none ${
                    status === "answering" ? "" : "opacity-60"
                  }`}
                />
              </div>

              <button type="submit" className={button}>
                {status === "answering" ? "Check" : "Next"}
              </button>
            </div>

            {status !== "answering" && (
              <div className="animate-fadeIn">
                <Verdict
                  correct={status === "solved"}
                  answer={`${formatAnswer(scenario.answer)} ${scenario.unit}`}
                />

                {status === "missed" && <Solution scenario={scenario} />}

                {scenario.note && (
                  <p className="mt-4 text-sm text-[#8b88b1]">{scenario.note}</p>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  );
};

export default ScenarioPractice;
