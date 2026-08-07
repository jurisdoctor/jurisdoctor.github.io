"use client";
import { Fragment, RefObject, useEffect, useRef, useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { numeric } from "./Data";
import ProblemSet, { MARKS } from "./ProblemSet";
import { useSaved } from "./Saved";
import {
  FormulaType,
  RoundingType,
  ScenarioType,
  Scenarios,
  StepType,
  TermType,
} from "./Scenarios";
type Status = "answering" | "solved" | "missed";
interface SavedType {
  position: number;
  entry: string;
  status: Status;
  done: Record<string, Status>;
}
const formatAnswer = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n);
const accepted = (given: number, answer: number, tolerance: number) =>
  Math.abs(given - answer) <= tolerance ||
  [1, 2, 3].some(
    (places) => Math.abs(given - Number(answer.toFixed(places))) < 1e-9,
  );
const UNIT = /^[A-Za-z]+(?:\s[A-Za-z]+)?(?:\/[A-Za-z]+)*$/;
const unitOf = (text: string) => text.replace(/^[\d.,\s]+/, "").trim();
const split = (unit: string) => {
  const [over, ...under] = unit.split("/");
  return { over: over ? [over] : [], under };
};
const cancelled = (chain: TermType[]) => {
  const over: string[] = [];
  const under: string[] = [];
  const add = (text: string | undefined, flipped: boolean) => {
    const unit = unitOf(text ?? "");
    if (!UNIT.test(unit)) return;
    const { over: o, under: u } = split(unit);
    over.push(...(flipped ? u : o));
    under.push(...(flipped ? o : u));
  };
  for (const term of chain) {
    add(term.value, false);
    add(term.top, false);
    add(term.bottom, true);
  }
  return new Set(over.filter((unit) => under.includes(unit)));
};
const Strike = ({ unit }: { unit: string }) => (
  <span className="relative inline-block">
    {unit}
    <span className="absolute left-0 top-1/2 h-[2px] w-full animate-strike bg-[var(--primary-color)] motion-reduce:animate-none" />
  </span>
);
const Token = ({ unit, cancel }: { unit: string; cancel: Set<string> }) =>
  cancel.has(unit) ? <Strike unit={unit} /> : <>{unit}</>;
const Value = ({ text, cancel }: { text: string; cancel: Set<string> }) => {
  const unit = unitOf(text);
  if (!UNIT.test(unit)) return <span>{text}</span>;
  const lead = text.slice(0, text.length - unit.length);
  return (
    <span>
      {lead}
      {unit.split("/").map((token, id) => (
        <Fragment key={token + id}>
          {id > 0 && "/"}
          <Token unit={token} cancel={cancel} />
        </Fragment>
      ))}
    </span>
  );
};
const line = "border-t border-solid border-[var(--text-color)]";
const Quantity = ({ text, cancel }: { text: string; cancel: Set<string> }) => {
  const unit = unitOf(text);
  const tokens = unit.split("/");
  if (!UNIT.test(unit) || tokens.length === 1) {
    return <Value text={text} cancel={cancel} />;
  }
  const lead = text.slice(0, text.length - unit.length);
  const [over, ...under] = tokens;
  return (
    <span className="inline-flex flex-col text-center leading-tight">
      <span className="px-2 pb-1">
        {lead}
        <Token unit={over} cancel={cancel} />
      </span>
      <span className={`${line} px-2 pt-1`}>
        {under.map((token, id) => (
          <Fragment key={token + id}>
            {id > 0 && "/"}
            <Token unit={token} cancel={cancel} />
          </Fragment>
        ))}
      </span>
    </span>
  );
};
const Term = ({ term, cancel }: { term: TermType; cancel: Set<string> }) => {
  if (term.value) {
    return <Quantity text={term.value} cancel={cancel} />;
  }
  return (
    <span className="inline-flex flex-col text-center leading-tight">
      <span className="px-3 pb-1">
        <Value text={term.top ?? ""} cancel={cancel} />
      </span>
      <span className={`${line} px-3 pt-1`}>
        <Value text={term.bottom ?? ""} cancel={cancel} />
      </span>
    </span>
  );
};
const rearrangeOf = (chain: TermType[]) => {
  const frac = chain.find((term) => term.top && term.bottom);
  if (!frac?.top || !frac.bottom) return null;

  const topUnit = unitOf(frac.top);
  const perUnit = unitOf(frac.bottom);
  if (!UNIT.test(topUnit) || !UNIT.test(perUnit)) return null;

  const [amountUnit, ...rest] = topUnit.split("/");
  if (!rest.length) return null;

  const lead = frac.top.slice(0, frac.top.length - topUnit.length);

  return {
    amount: `${lead}${amountUnit}`,
    first: perUnit,
    second: rest.join("/"),
  };
};

const travel = (distance: number, axis: "x" | "y") => {
  const move =
    axis === "x" ? `translateX(${distance}px)` : `translateY(${distance}px)`;
  return [
    { transform: "translate(0)", offset: 0 },
    { transform: "translate(0)", offset: 0.2 },
    { transform: move, offset: 0.45 },
    { transform: move, offset: 0.7 },
    { transform: "translate(0)", offset: 0.95 },
    { transform: "translate(0)", offset: 1 },
  ];
};

const useSwap = (
  aRef: RefObject<HTMLSpanElement>,
  bRef: RefObject<HTMLSpanElement>,
  axis: "x" | "y",
  tokens: string,
) => {
  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    let running: Animation[] = [];

    const start = () => {
      running.forEach((animation) => animation.cancel());
      running = [];

      if (axis === "x") {
        a.style.width = "";
        b.style.width = "";
        const widest = Math.max(
          a.getBoundingClientRect().width,
          b.getBoundingClientRect().width,
        );
        a.style.width = `${widest}px`;
        b.style.width = `${widest}px`;
      }

      const from = a.getBoundingClientRect();
      const to = b.getBoundingClientRect();
      const distance = axis === "x" ? to.left - from.left : to.top - from.top;

      if (!distance) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const timing = {
        duration: 3400,
        iterations: Infinity,
        easing: "ease-in-out",
      };

      running = [
        a.animate(travel(distance, axis), timing),
        b.animate(travel(-distance, axis), timing),
      ];
    };

    start();
    window.addEventListener("resize", start);
    return () => {
      window.removeEventListener("resize", start);
      running.forEach((animation) => animation.cancel());
    };
  }, [aRef, bRef, axis, tokens]);
};

const Swap = ({ first, second }: { first: string; second: string }) => {
  const firstRef = useRef<HTMLSpanElement>(null);
  const secondRef = useRef<HTMLSpanElement>(null);
  useSwap(firstRef, secondRef, "x", `${first}/${second}`);

  return (
    <span className="inline-flex items-center gap-x-1 whitespace-nowrap">
      <span ref={firstRef} className="inline-block text-center">
        {first}
      </span>
      <span>×</span>
      <span ref={secondRef} className="inline-block text-center">
        {second}
      </span>
    </span>
  );
};

const Nested = ({
  amount,
  first,
  second,
}: {
  amount: string;
  first: string;
  second: string;
}) => {
  const firstRef = useRef<HTMLSpanElement>(null);
  const secondRef = useRef<HTMLSpanElement>(null);
  useSwap(firstRef, secondRef, "y", `${first}/${second}`);

  return (
    <span className="inline-flex flex-col text-center leading-tight">
      <span className="px-3 pb-1">
        <span className="inline-flex flex-col text-center leading-tight">
          <span className="px-2 pb-1 text-[#8b88b1]">{amount}</span>
          <span className={`${line} px-2 pt-1`}>
            <span ref={firstRef} className="inline-block">
              {first}
            </span>
          </span>
        </span>
      </span>
      <span className={`${line} px-3 pt-1`}>
        <span ref={secondRef} className="inline-block">
          {second}
        </span>
      </span>
    </span>
  );
};

const flipOf = (tip: string) => {
  const parts = tip.match(/^(.+?) per (.+?) is the same as/);
  return parts ? { top: parts[1], bottom: parts[2] } : null;
};

const Flip = ({ top, bottom }: { top: string; bottom: string }) => {
  const topRef = useRef<HTMLSpanElement>(null);
  const bottomRef = useRef<HTMLSpanElement>(null);
  useSwap(topRef, bottomRef, "y", `${top}/${bottom}`);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <span className="inline-flex flex-col text-center leading-tight">
        <span className="px-3 pb-1">
          <span ref={topRef} className="inline-block">
            {top}
          </span>
        </span>
        <span className={`${line} px-3 pt-1`}>
          <span ref={bottomRef} className="inline-block">
            {bottom}
          </span>
        </span>
      </span>
    </div>
  );
};

const Rearrange = ({
  amount,
  first,
  second,
}: {
  amount: string;
  first: string;
  second: string;
}) => (
  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
    <span className="text-[#8b88b1]">
      {amount}/{first}/{second}
    </span>
    <span className="text-[#8b88b1]">=</span>
    <span className="inline-flex flex-col text-center leading-tight">
      <span className="px-3 pb-1">{amount}</span>
      <span className={`${line} px-3 pt-1`}>
        <Swap first={first} second={second} />
      </span>
    </span>
    <span className="text-[#8b88b1]">=</span>
    <Nested amount={amount} first={first} second={second} />
  </div>
);

const SWAP_TIP = "swap round";

const Step = ({ step, firstTip }: { step: StepType; firstTip: number }) => {
  const cancel = cancelled(step.chain);
  const rearrange = rearrangeOf(step.chain);
  return (
    <div className="mb-7 last:mb-0">
      <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
        {step.label}
      </span>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 sm:text-sm">
        {step.chain.map((term, id) => (
          <span key={id} className="flex items-center gap-x-3">
            {id > 0 && <span className="text-[#8b88b1]">×</span>}
            <Term term={term} cancel={cancel} />
          </span>
        ))}

        <span className="text-[#8b88b1]">=</span>
        <span className="font-bold text-[var(--title-color)]">
          {step.result}
        </span>
      </div>

      <div className="mt-3 grid gap-y-3">
        {step.tips.map((tip, id) => {
          const flip = flipOf(tip);
          return (
            <div key={tip} className="flex gap-x-3">
              <span className="-mt-0.5 shrink-0 self-start rounded-full bg-[hsla(43,100%,68%,0.25)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--title-color)]">
                Step {firstTip + id}
              </span>
              <div className="min-w-0 flex-1">
                <p className="max-w-[70ch] text-sm text-[#8b88b1]">{tip}</p>
                {rearrange && tip.includes(SWAP_TIP) && (
                  <Rearrange {...rearrange} />
                )}
                {flip && <Flip {...flip} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
const BLUE = "rgb(64,132,255)";
const markAt = (exact: string, place: string) => {
  const dot = exact.indexOf(".");
  if (dot < 0) return -1;
  if (place.startsWith("whole")) return dot - 1;
  if (place.startsWith("hundredth")) return dot + 2;
  return dot + 1;
};
const Round = ({
  rounding,
  step,
}: {
  rounding: RoundingType;
  step: number;
}) => {
  const at = markAt(rounding.exact, rounding.place);
  const before = at < 0 ? rounding.exact : rounding.exact.slice(0, at);
  const digit = at < 0 ? "" : rounding.exact[at];
  const after = at < 0 ? "" : rounding.exact.slice(at + 1);
  return (
    <div className="mb-7 last:mb-0">
      <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
        Round
      </span>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 sm:text-sm">
        <span>
          {before}
          <span className="relative inline-block">
            <span style={{ color: BLUE }} className="font-bold">
              {digit}
            </span>
            <span
              style={{ backgroundColor: BLUE }}
              className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left animate-mark motion-reduce:animate-none"
            />
          </span>
          {after}
        </span>

        <span className="text-[#8b88b1]">=</span>
        <span className="font-bold text-[var(--title-color)]">
          {rounding.rounded}
        </span>
      </div>

      <div className="mt-3 flex gap-x-3">
        <span className="-mt-0.5 shrink-0 self-start rounded-full bg-[hsla(43,100%,68%,0.25)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--title-color)]">
          Step {step}
        </span>
        <p className="max-w-[70ch] text-sm text-[#8b88b1]">
          Remember, the question asks you to round to the nearest{" "}
          {rounding.place}. The marked digit is the one you keep.
        </p>
      </div>
    </div>
  );
};
const Formula = ({ formula }: { formula: FormulaType }) => (
  <div className="mb-7">
    <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
      Formula
    </span>
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 sm:text-sm">
      <span className="inline-flex flex-col text-center leading-tight">
        <span className="px-3 pb-1">{formula.top}</span>
        <span className={`${line} px-3 pt-1`}>{formula.bottom}</span>
      </span>
    </div>
  </div>
);
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
const Solution = ({ scenario }: { scenario: ScenarioType }) => {
  const { setup } = scenario;
  return (
    <div className="grid gap-y-5">
      <Question
        number={1}
        title="Determine the unit you are calculating."
        answer={setup.unit}
      />

      <Question
        number={2}
        title="Do you need to convert units?"
        answer={setup.convert}
      />

      <Question number={3} title="Set up the problem and solve.">
        <div className="mt-4">
          {scenario.formula && <Formula formula={scenario.formula} />}

          {scenario.steps.map((step, id) => (
            <Step
              key={id}
              step={step}
              firstTip={
                scenario.steps
                  .slice(0, id)
                  .reduce((n, prev) => n + prev.tips.length, 0) + 1
              }
            />
          ))}

          {scenario.rounding && (
            <Round
              rounding={scenario.rounding}
              step={
                scenario.steps.reduce((n, step) => n + step.tips.length, 0) + 1
              }
            />
          )}
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
    className={`mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl p-5 last:mb-0 ${correct ? "bg-[rgba(68,215,182,0.12)]" : "bg-[hsla(353,100%,65%,0.1)]"}`}
  >
    <span
      className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white ${correct ? "bg-[rgb(68,215,182)]" : "bg-[var(--primary-color)]"}`}
    >
      {correct ? "Correct ✅" : "Not quite"}
    </span>

    <span className="text-lg font-bold text-[var(--title-color)]">
      {answer}
    </span>
  </div>
);
const KEY = "dosage:scenarios:v3";
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
  saved.position < Scenarios.length;
const ScenarioPractice = () => {
  const [saved, setSaved] = useSaved(KEY, fresh, valid);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scenario = Scenarios[saved.position];
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
      position: (prev.position + 1) % Scenarios.length,
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
    if (!scenario) return;
    const given = Number(saved.entry.replace(/,/g, "").trim());
    if (saved.entry.trim() === "" || Number.isNaN(given)) return;
    const isRight = accepted(given, scenario.answer, scenario.tolerance);
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
    <section className="mb-16" id="scenarios">
      <h2 className="relative mb-2 ml-3.5 text-3xl font-bold lg:ml-0 lg:text-center">
        Nursing Dosages
      </h2>

      <div className="animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 shadow-xl">
        <form method="dialog" onSubmit={onSubmit}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
                {saved.position + 1} of {Scenarios.length}
                {scenario.mark && (
                  <span className={`ml-1.5 ${MARKS[scenario.mark].tone}`}>
                    {MARKS[scenario.mark].char}
                  </span>
                )}
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
              marks={(index) => {
                const flag = Scenarios[index]?.mark;
                return flag ? MARKS[flag] : undefined;
              }}
              total={Scenarios.length}
              position={saved.position}
              done={saved.done}
              onPick={jump}
              onReset={reset}
            />
          )}

          <p className="mb-6 text-lg sm:text-base">{scenario.prompt}</p>

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
              placeholder={`Answer in ${scenario.unit}`}
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
              <Verdict
                correct={saved.status === "solved"}
                answer={`${formatAnswer(scenario.answer)} ${scenario.unit}`}
              />

              {saved.status === "missed" && <Solution scenario={scenario} />}

              {scenario.note && (
                <p className="mt-4 text-sm text-[#8b88b1]">{scenario.note}</p>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
};
export default ScenarioPractice;
