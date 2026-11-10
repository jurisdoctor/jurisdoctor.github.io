"use client";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { PiArrowLeftBold, PiUsersThreeBold } from "react-icons/pi";
import Results from "./Results";
import Shell from "./Shell";
import Winner from "./Winner";
import {
  CARDS,
  CardId,
  DIGEST,
  FLIP_MS,
  PLAYERS,
  SKIP_SECONDS,
  TEAMS,
  categoryOf,
  dealCards,
  field,
  ghost,
  hash,
  ordinal,
  primary,
  standings,
  useGame,
} from "./game";

const LIMIT = 3;

const SHAKE = [
  { transform: "translateX(0)" },
  { transform: "translateX(-9px)" },
  { transform: "translateX(8px)" },
  { transform: "translateX(-5px)" },
  { transform: "translateX(3px)" },
  { transform: "translateX(0)" },
];

const RULES: ReactNode[] = [
  "Split up into groups of 7",
  "Each group will get 3 words → pick which 3 people will be the ones guessing the word",
  <>
    The rest of the group will be giving hints to guess <em>that</em> word
  </>,
  <>
    You have the option to{" "}
    <strong className="text-[var(--title-color)]">Skip</strong> but skipping
    adds +{SKIP_SECONDS} seconds
  </>,
  "Winning Team will guess 3 words in the shortest amount of time!",
];

const Panel = ({ children }: { children: ReactNode }) => (
  <div className="w-full animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 shadow-xl md:p-5">
    {children}
  </div>
);

// A party-game page for the culture project: a password first, then the rules
// to confirm, a screen to name the five teams of seven, and a table of five
// face-down cards. Each card hides a category; flipping one starts that
// team's round. Progress is kept in this browser so a refresh never sends
// anyone back to the start.
const HeadsUp = () => {
  const [state, setState, ready] = useGame();
  const [word, setWord] = useState("");
  const [wrong, setWrong] = useState(0);
  const [flipped, setFlipped] = useState<CardId | null>(null);
  const cardRef = useRef<HTMLFormElement>(null);
  const timer = useRef<number | null>(null);
  const router = useRouter();

  const open = state.key === DIGEST;

  useEffect(() => {
    if (!ready || !open || flipped || state.stage !== "cards") return;
    if (state.active) router.replace(`/headsup/${state.active.slug}`);
  }, [ready, open, flipped, state.stage, state.active, router]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  if (!ready) return null;

  const unlock = async (event: FormEvent) => {
    event.preventDefault();
    if (!word.trim()) return;
    if ((await hash(word.trim().toLowerCase())) === DIGEST) {
      setState((prev) => ({ ...prev, key: DIGEST }));
      return;
    }
    const missed = wrong + 1;
    setWrong(missed);
    setWord("");
    if (missed >= LIMIT) {
      router.replace("/");
      return;
    }
    const card = cardRef.current;
    if (
      card &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      card.animate(SHAKE, { duration: 520, easing: "ease-out" });
    }
  };

  if (!open) {
    const left = LIMIT - wrong;
    return (
      <Shell>
        <form
          ref={cardRef}
          onSubmit={unlock}
          className="w-full max-w-[420px] animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 text-center shadow-xl"
        >
          <p className="mb-5 text-sm text-[var(--muted-color)]">
            enter the password to start
          </p>
          <input
            type="password"
            autoFocus
            autoComplete="off"
            value={word}
            onChange={(event) => setWord(event.target.value)}
            placeholder="Password"
            aria-label="Password"
            className={`${field} mb-4 text-center`}
          />
          {wrong > 0 && (
            <p className="mb-4 text-sm font-bold text-[var(--primary-color)]">
              not that one, {left} {left === 1 ? "try" : "tries"} left
            </p>
          )}
          <button type="submit" className={primary}>
            Enter
          </button>
        </form>
      </Shell>
    );
  }

  if (state.stage === "rules") {
    return (
      <Shell>
        <Panel>
          <h2 className="mb-5 text-2xl font-bold text-[var(--title-color)]">
            Rules
          </h2>
          <ol className="grid gap-y-4">
            {RULES.map((rule, index) => (
              <li key={index} className="flex items-start gap-x-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--chip-blue)] text-xs font-bold text-[var(--title-color)]">
                  {index + 1}
                </span>
                <span className="pt-0.5 text-lg leading-7">{rule}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, stage: "teams" }))}
              className={primary}
            >
              Confirm
            </button>
          </div>
        </Panel>
      </Shell>
    );
  }

  if (state.stage === "teams") {
    const named = state.teams.every((team) => team.trim());
    const rename = (index: number, value: string) =>
      setState((prev) => ({
        ...prev,
        teams: prev.teams.map((team, at) => (at === index ? value : team)),
      }));
    return (
      <Shell>
        <Panel>
          <h2 className="mb-1 text-2xl font-bold text-[var(--title-color)]">
            Team names
          </h2>
          <p className="mb-5 text-sm text-[var(--muted-color)]">
            {TEAMS} teams of {PLAYERS}, give each one a name
          </p>
          <div className="grid gap-y-3">
            {state.teams.map((team, index) => (
              <label key={index} className="flex items-center gap-x-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--chip-blue)] text-sm font-bold text-[var(--title-color)]">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={team}
                  onChange={(event) => rename(index, event.target.value)}
                  maxLength={32}
                  placeholder={`Team ${index + 1}`}
                  aria-label={`Team ${index + 1} name`}
                  className={field}
                />
                <span className="flex shrink-0 items-center gap-x-1.5 text-xs text-[var(--muted-color)] sm:hidden">
                  <PiUsersThreeBold aria-hidden />
                  {PLAYERS}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, stage: "rules" }))}
              className={ghost}
            >
              <PiArrowLeftBold aria-hidden />
              Rules
            </button>
            <button
              type="button"
              disabled={!named}
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  stage: "cards",
                  deal: prev.deal ?? dealCards(),
                }))
              }
              className={primary}
            >
              Save teams
            </button>
          </div>
        </Panel>
      </Shell>
    );
  }

  const deal = state.deal ?? dealCards();
  const remaining = CARDS.filter(
    (card) => !state.turns.some((turn) => turn.card === card.id),
  );
  const next = state.turns.length;
  const finished = remaining.length === 0;
  const winner = finished ? standings(state.turns)[0] : null;

  const pick = (card: CardId) => {
    if (flipped || finished) return;
    const slug = deal[card];
    setFlipped(card);
    setState((prev) => ({
      ...prev,
      deal: prev.deal ?? deal,
      active: { team: prev.turns.length, card, slug },
    }));
    timer.current = window.setTimeout(
      () => router.push(`/headsup/${slug}`),
      FLIP_MS,
    );
  };

  const restart = () =>
    setState((prev) => ({
      ...prev,
      deal: dealCards(),
      turns: [],
      active: null,
    }));

  return (
    <Shell wide>
      {winner ? (
        <Winner
          turn={winner}
          team={state.teams[winner.team] || `Team ${winner.team + 1}`}
        />
      ) : (
        <div className="w-full animate-fadeIn text-center">
          <h2 className="mb-2 text-3xl font-bold text-[var(--title-color)]">
            Heads Up! Categories
          </h2>
          <p className="mb-8 text-lg">
            <span className="font-bold text-[var(--title-color)]">
              {ordinal(next)} Team {state.teams[next]}
            </span>
            <span className="text-[var(--muted-color)]">, pick a card</span>
          </p>
        </div>
      )}

      {!finished && (
        <div className="grid w-full grid-cols-5 gap-4 lg:grid-cols-3 sm:grid-cols-2">
          {remaining.map((card) => {
            const category = categoryOf(deal[card.id]);
            const up = flipped === card.id;
            return (
              <button
                key={card.id}
                type="button"
                disabled={!!flipped && !up}
                onClick={() => pick(card.id)}
                aria-label={`${card.label} card`}
                className={`flip-card aspect-[3/4] w-full ${up ? "flipped" : ""} ${
                  flipped && !up ? "opacity-40" : ""
                } duration-300`}
              >
                <span className="flip-inner">
                  <span
                    className="flip-face"
                    style={{
                      backgroundColor: card.color,
                      backgroundImage:
                        "linear-gradient(160deg, rgba(255,255,255,0.28), rgba(0,0,0,0.18))",
                    }}
                  />
                  <span
                    className="flip-face flip-back flex-col gap-y-2 px-3 text-center"
                    style={{ backgroundColor: card.color }}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                      {card.label}
                    </span>
                    <span className="text-xl font-bold leading-tight text-white">
                      {category?.name}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {state.turns.length > 0 && (
        <Results
          turns={finished ? standings(state.turns) : state.turns}
          teams={state.teams}
          heading={finished ? "Final standings" : "Teams that went"}
          ranked={finished}
        />
      )}

      <div className="mt-8 flex w-full flex-wrap items-center justify-between gap-3">
        {state.turns.length === 0 && !flipped ? (
          <button
            type="button"
            onClick={() => setState((prev) => ({ ...prev, stage: "teams" }))}
            className={ghost}
          >
            <PiArrowLeftBold aria-hidden />
            Team names
          </button>
        ) : (
          <span />
        )}
        {finished && (
          <button type="button" onClick={restart} className={primary}>
            Play again
          </button>
        )}
      </div>
    </Shell>
  );
};

export default HeadsUp;
