"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PiCheckBold, PiFastForwardBold } from "react-icons/pi";
import Shell from "./Shell";
import {
  DIGEST,
  NEEDED,
  SKIP_SECONDS,
  CategoryType,
  clock,
  ghost,
  ordinal,
  primary,
  shuffled,
  useGame,
} from "./game";

type Phase = "ready" | "running" | "paused" | "done";

// One team's round on a category: a stopwatch, one word at a time, Correct to
// move on and Skip to move on at a cost of extra seconds. The round ends when
// the team has guessed enough words or the words run out, and the result is
// saved the moment it ends so a refresh cannot lose it.
const Round = ({ category }: { category: CategoryType }) => {
  const [state, setState, ready] = useGame();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("ready");
  const [deck, setDeck] = useState<string[]>([]);
  const [at, setAt] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState(0);
  const [bump, setBump] = useState(0);
  const accrued = useRef(0);
  const segment = useRef(0);
  const saved = useRef(false);

  const open = state.key === DIGEST;
  const turn =
    state.active && state.active.slug === category.slug ? state.active : null;

  useEffect(() => {
    if (!ready) return;
    if (!open || (!turn && phase !== "done")) router.replace("/headsup");
  }, [ready, open, turn, phase, router]);

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(
      () => setNow(accrued.current + performance.now() - segment.current),
      100,
    );
    return () => window.clearInterval(id);
  }, [phase]);

  if (!ready || !open || (!turn && phase !== "done")) return null;

  const team = turn?.team ?? state.turns[state.turns.length - 1]?.team ?? 0;
  const name = state.teams[team] || `Team ${team + 1}`;
  const elapsed = now / 1000 + penalty;

  const finish = (right: number, extra: number) => {
    const seconds =
      (accrued.current + performance.now() - segment.current) / 1000 + extra;
    setResult(seconds);
    setPhase("done");
    if (saved.current || !turn) return;
    saved.current = true;
    setState((prev) => ({
      ...prev,
      active: null,
      turns: [
        ...prev.turns,
        {
          team: turn.team,
          card: turn.card,
          slug: turn.slug,
          seconds,
          correct: right,
        },
      ],
    }));
  };

  const start = () => {
    setDeck(shuffled(category.words));
    setAt(0);
    setCorrect(0);
    setPenalty(0);
    setNow(0);
    accrued.current = 0;
    segment.current = performance.now();
    setPhase("running");
  };

  const pause = () => {
    accrued.current += performance.now() - segment.current;
    setNow(accrued.current);
    setPhase("paused");
  };

  const resume = () => {
    segment.current = performance.now();
    setPhase("running");
  };

  const advance = (right: number, extra: number) => {
    if (right >= NEEDED || at + 1 >= deck.length) {
      finish(right, extra);
      return;
    }
    setAt(at + 1);
    pause();
  };

  const onCorrect = () => {
    const right = correct + 1;
    setCorrect(right);
    advance(right, penalty);
  };

  const onSkip = () => {
    const extra = penalty + SKIP_SECONDS;
    setPenalty(extra);
    setBump((prev) => prev + 1);
    advance(correct, extra);
  };

  return (
    <Shell title={category.name}>
      <div className="w-full animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 text-center shadow-xl md:p-5">
        <p className="text-sm text-[var(--muted-color)]">
          {ordinal(team)} Team · {name}
        </p>
        {category.note && (
          <p className="mt-1 text-xs text-[var(--muted-color)]">
            {category.note}
          </p>
        )}

        <p
          key={bump}
          className={`my-6 text-7xl font-bold tabular-nums leading-none text-[var(--title-color)] md:text-6xl ${
            bump > 0 && phase === "running" ? "animate-fadeIn" : ""
          }`}
        >
          {clock(phase === "done" ? result : elapsed)}
        </p>

        {phase === "ready" && (
          <button type="button" onClick={start} className={primary}>
            Start
          </button>
        )}

        {(phase === "running" || phase === "paused") && (
          <>
            <div className="mb-4 flex justify-center gap-x-2" aria-hidden>
              {Array.from({ length: NEEDED }).map((_, index) => (
                <span
                  key={index}
                  className={`h-2.5 w-10 rounded-sm duration-300 ${
                    index < correct
                      ? "bg-[rgb(0,212,127)]"
                      : "bg-[var(--track-color)]"
                  }`}
                />
              ))}
            </div>
            <p className="mb-8 flex min-h-[8rem] items-center justify-center rounded-xl bg-[var(--body-color)] px-6 py-8 text-4xl font-bold leading-tight text-[var(--title-color)] md:text-3xl">
              {phase === "paused" ? (
                <span className="text-xl font-normal text-[var(--muted-color)]">
                  timer paused
                </span>
              ) : (
                deck[at]
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={onCorrect}
                disabled={phase === "paused"}
                className={`${primary} inline-flex items-center gap-x-2 !bg-[rgb(0,212,127)] !text-[#06251a]`}
              >
                <PiCheckBold aria-hidden />
                Correct
              </button>
              <button
                type="button"
                onClick={onSkip}
                disabled={phase === "paused"}
                className={`${ghost} px-8 disabled:opacity-40`}
              >
                <PiFastForwardBold aria-hidden />
                Skip +{SKIP_SECONDS}s
              </button>
            </div>
          </>
        )}

        {phase === "paused" && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Ready for next word?"
            className="fixed inset-0 z-20 flex items-center justify-center bg-[rgba(0,0,0,0.55)] px-6"
          >
            <div className="w-full max-w-[380px] animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 text-center shadow-xl">
              <h2 className="mb-2 text-2xl font-bold text-[var(--title-color)]">
                Ready for next word?
              </h2>
              <p className="mb-6 text-sm text-[var(--muted-color)]">
                Switching guessers?
              </p>
              <button
                type="button"
                autoFocus
                onClick={resume}
                className={primary}
              >
                Ready
              </button>
            </div>
          </div>
        )}

        {phase === "done" && (
          <>
            <p className="mb-6 text-lg">
              <span className="font-bold text-[var(--title-color)]">
                {correct} of {NEEDED} words
              </span>
              <span className="text-[var(--muted-color)]">
                {penalty > 0 ? `, includes +${penalty}s for skips` : ""}
              </span>
            </p>
            <button
              type="button"
              onClick={() => router.push("/headsup")}
              className={primary}
            >
              Next
            </button>
          </>
        )}
      </div>
    </Shell>
  );
};

export default Round;
