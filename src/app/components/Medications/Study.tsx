"use client";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { LuCheck, LuSearch, LuX } from "react-icons/lu";
import { useSaved } from "../DosageCalculations/Saved";
import {
  Card,
  CardKind,
  cardForPairKey,
  Grade,
  interactionCards,
  KINDS,
  makeCard,
  planInteractions,
  shuffle,
  supports,
} from "./Cards";
import { IndexType, indexOf, loadInteractions } from "./Interactions";
import { GroupType, MedFile, MedType } from "./types";

// A study mode, not a reference page: pick a deck, flip, grade yourself, and
// whatever you miss comes back sooner. Every card is assembled from fields in
// the data (see Cards.ts); nothing is written here.

type Scope = "all" | "groups" | "pick";
type Order = "shuffled" | "sequential";

interface Prefs {
  scope: Scope;
  groups: string[];
  picked: string[];
  kinds: CardKind[];
  order: Order;
}

const ALL_KINDS = KINDS.map((entry) => entry.kind);
const freshPrefs = (): Prefs => ({
  scope: "all",
  groups: [],
  picked: [],
  kinds: ALL_KINDS,
  order: "shuffled",
});
const validPrefs = (saved: Prefs) =>
  !!saved &&
  ["all", "groups", "pick"].includes(saved.scope) &&
  Array.isArray(saved.groups) &&
  Array.isArray(saved.picked) &&
  Array.isArray(saved.kinds) &&
  saved.kinds.every((kind) => ALL_KINDS.includes(kind)) &&
  ["shuffled", "sequential"].includes(saved.order);

type Grades = Record<string, Grade>;
const freshGrades = (): Grades => ({});
const validGrades = (saved: Grades) =>
  !!saved &&
  typeof saved === "object" &&
  !Array.isArray(saved) &&
  Object.values(saved).every(
    (entry) => entry === "got" || entry === "shaky" || entry === "missed",
  );

const MISSED_BACK = 5;
const SHAKY_BACK = 15;

const calm = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clock = (ms: number) => {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const btn =
  "rounded-[1.875rem] px-6 py-3 text-base font-bold leading-4 duration-300 disabled:cursor-not-allowed disabled:opacity-40";

// ----------------------------------------------------------------- the card
const Chip = ({ group, accent }: { group: string; accent: string }) => (
  <span className="inline-flex max-w-full items-center gap-x-2 rounded-full bg-[var(--body-color)] px-3 py-1 text-xs font-bold text-[var(--muted-color)]">
    <span
      aria-hidden
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ background: accent }}
    />
    <span className="truncate">{group}</span>
  </span>
);

const Back = ({ card, pick }: { card: Card; pick: string | null }) => (
  <div className="grid gap-y-5">
    {card.options && pick !== null && (
      <p
        className={`text-sm font-bold ${
          pick === card.answer
            ? "text-[hsl(150,62%,46%)]"
            : "text-[var(--primary-color)]"
        }`}
      >
        {pick === card.answer ? `You picked ${pick}.` : `You picked ${pick}.`}
      </p>
    )}
    {card.blocks.map((block, index) => (
      <div key={index}>
        {block.heading && (
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
            {block.heading}
          </p>
        )}
        {block.bullets ? (
          <ul className="grid gap-y-2.5">
            {block.lines.map((line, position) => (
              <li
                key={position}
                className={`flex gap-x-3 text-xl leading-snug sm:text-lg ${
                  block.tone === "danger"
                    ? "text-[var(--title-color)]"
                    : "text-[var(--text-color)]"
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-[0.6em] h-2 w-2 shrink-0 rounded-full ${
                    block.tone === "danger"
                      ? "bg-[var(--primary-color)]"
                      : "bg-[var(--chip-blue-border)]"
                  }`}
                />
                <span className="min-w-0">{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          block.lines.map((line, position) => (
            <p
              key={position}
              className={`leading-snug ${
                block.tone === "strong"
                  ? "text-3xl font-bold text-[var(--title-color)] sm:text-2xl"
                  : block.tone === "danger"
                    ? "text-2xl font-bold text-[var(--primary-color)] sm:text-xl"
                    : "text-xl text-[var(--text-color)] sm:text-lg"
              }`}
            >
              {line}
            </p>
          ))
        )}
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------- the session
interface Tally {
  got: number;
  shaky: number;
  missed: number;
}

const Session = ({
  deck,
  accentFor,
  groups,
  onGrade,
  onFinish,
}: {
  deck: Card[];
  accentFor: (group: string) => string;
  groups: GroupType[];
  onGrade: (key: string, grade: Grade) => void;
  onFinish: (again: Card[] | null) => void;
}) => {
  const total = deck.length;
  const [queue, setQueue] = useState<Card[]>(deck);
  const [face, setFace] = useState<"front" | "back">("front");
  const [turn, setTurn] = useState<"idle" | "out" | "in">("idle");
  const [pick, setPick] = useState<string | null>(null);
  const [tally, setTally] = useState<Tally>({ got: 0, shaky: 0, missed: 0 });
  const [weak, setWeak] = useState<Map<string, Grade>>(new Map());
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const started = useRef(Date.now());
  const seen = useRef(new Map<string, Card>());
  const timer = useRef<number | null>(null);

  deck.forEach((card) => seen.current.set(card.key, card));
  const card = queue[0];
  const gotCount = total - queue.length;

  const reveal = useCallback(() => {
    if (face === "back" || turn !== "idle" || !card) return;
    if (calm()) {
      setFace("back");
      return;
    }
    setTurn("out");
    timer.current = window.setTimeout(() => {
      setFace("back");
      setTurn("in");
      timer.current = window.setTimeout(() => setTurn("idle"), 170);
    }, 160);
  }, [face, turn, card]);

  const grade = useCallback(
    (result: Grade) => {
      if (face !== "back" || !card) return;
      onGrade(card.key, result);
      setTally((prev) => ({ ...prev, [result]: prev[result] + 1 }));
      if (result !== "got") {
        setWeak((prev) => {
          const next = new Map(prev);
          // "missed" outranks "shaky" if a card is graded both ways.
          if (next.get(card.key) !== "missed") next.set(card.key, result);
          return next;
        });
      }
      const rest = queue.slice(1);
      if (result === "missed")
        rest.splice(Math.min(MISSED_BACK, rest.length), 0, card);
      if (result === "shaky")
        rest.splice(Math.min(SHAKY_BACK, rest.length), 0, card);
      setQueue(rest);
      setFace("front");
      setTurn("idle");
      setPick(null);
      if (rest.length === 0) {
        setElapsed(Date.now() - started.current);
        setDone(true);
      }
    },
    [face, card, queue, onGrade],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (done) return;
      if (event.key === "Escape") {
        onFinish(null);
        return;
      }
      if (event.key === " " || event.key === "Enter") {
        if (face === "front") {
          event.preventDefault();
          reveal();
        }
        return;
      }
      if (face === "back") {
        if (event.key === "1") grade("got");
        if (event.key === "2") grade("shaky");
        if (event.key === "3") grade("missed");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, face, reveal, grade, onFinish]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const attempts = tally.got + tally.shaky + tally.missed;
  const percent = attempts ? Math.round((tally.got / attempts) * 100) : 0;

  // ------------------------------------------------------------- end screen
  if (done) {
    const byGroup = groups
      .map((group) => ({
        group,
        rows: Array.from(weak.entries())
          .map(([key, result]) => ({ card: seen.current.get(key)!, result }))
          .filter((row) => row.card && row.card.group === group.name),
      }))
      .filter((entry) => entry.rows.length > 0);
    const weakCards = Array.from(weak.keys())
      .map((key) => seen.current.get(key))
      .filter((entry): entry is Card => !!entry);

    return (
      <div className="mx-auto flex min-h-full w-full max-w-[40rem] flex-col justify-center px-5 py-10">
        <p className="text-center text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
          Session complete
        </p>
        <p className="mt-2 text-center text-7xl font-bold text-[var(--title-color)] sm:text-6xl">
          {percent}%
        </p>
        <p className="mt-1 text-center text-[var(--text-color)]">
          of your answers were Got it
        </p>
        <dl className="mt-6 grid grid-cols-4 gap-3 text-center sm:grid-cols-2">
          {(
            [
              ["Cards", String(total)],
              ["Got it", String(tally.got)],
              ["Shaky", String(tally.shaky)],
              ["Missed", String(tally.missed)],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl bg-[var(--container-color)] px-3 py-3"
            >
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                {label}
              </dt>
              <dd className="text-2xl font-bold text-[var(--title-color)]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-center text-sm text-[var(--muted-color)]">
          Time {clock(elapsed)}
        </p>

        {byGroup.length > 0 ? (
          <div className="mt-8">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
              To go back over, by category
            </h2>
            <div className="grid gap-y-4">
              {byGroup.map(({ group, rows }) => (
                <div
                  key={group.name}
                  className="rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-x-3">
                    <Chip group={group.name} accent={accentFor(group.name)} />
                    <span className="text-xs text-[var(--muted-color)]">
                      {rows.length} {rows.length === 1 ? "card" : "cards"}
                    </span>
                  </div>
                  <ul className="grid gap-y-1.5">
                    {rows.map(({ card: row, result }) => (
                      <li
                        key={row.key}
                        className="flex items-baseline gap-x-2 text-sm"
                      >
                        <span
                          aria-hidden
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            background:
                              result === "missed"
                                ? "hsl(353, 100%, 66%)"
                                : "hsl(38, 96%, 54%)",
                          }}
                        />
                        <span className="min-w-0 text-[var(--text-color)]">
                          <span className="font-bold text-[var(--title-color)]">
                            {row.subject}
                          </span>
                          <span className="text-[var(--muted-color)]">
                            {" "}
                            · {row.prompt}
                          </span>
                          <span className="sr-only">
                            {result === "missed" ? " (missed)" : " (shaky)"}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-8 text-center text-lg font-bold text-[var(--title-color)]">
            Nothing missed. Nice.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {weakCards.length > 0 && (
            <button
              type="button"
              onClick={() => onFinish(shuffle(weakCards))}
              className={`${btn} bg-[var(--primary-color)] text-white shadow-lg hover:animate-pulse`}
            >
              Study the {weakCards.length} again
            </button>
          )}
          <button
            type="button"
            onClick={() => onFinish(null)}
            className={`${btn} border border-solid border-[var(--border-color)] bg-[var(--container-color)] text-[var(--title-color)] hover:border-[var(--chip-blue-border)]`}
          >
            Back to setup
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------- study screen
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[46rem] flex-col px-5 pb-6 pt-4 sm:px-3">
      <div className="flex items-center gap-x-4">
        <button
          type="button"
          onClick={() => onFinish(null)}
          aria-label="End session"
          title="End session (Esc)"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--muted-color)] duration-300 hover:bg-[var(--container-color)] hover:text-[var(--title-color)]"
        >
          <LuX size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <div
            className="h-2 overflow-hidden rounded-full bg-[var(--track-color)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={gotCount}
            aria-label="Cards done"
          >
            <div
              className="h-full rounded-full bg-[hsl(150,62%,46%)] duration-500"
              style={{ width: `${(gotCount / total) * 100}%` }}
            />
          </div>
        </div>
        <p className="shrink-0 whitespace-nowrap text-sm font-bold text-[var(--muted-color)]">
          {queue.length} left
          {attempts > 0 && <span> · {percent}% got it</span>}
        </p>
      </div>

      <div
        className="flex flex-1 items-center justify-center py-5"
        style={{ perspective: 1400 }}
      >
        <div
          key={`${card.key}-${total - queue.length}-${queue.length}`}
          className={`w-full ${turn === "out" ? "flip-out" : turn === "in" ? "flip-in" : "animate-fadeIn"}`}
        >
          <div className="rounded-3xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-8 shadow-2xl sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-x-3">
              <Chip group={card.group} accent={accentFor(card.group)} />
              <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                {face === "front" ? "Question" : "Answer"}
              </span>
            </div>

            {face === "front" ? (
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--muted-color)]">
                  {card.prompt}
                </p>
                <p className="mt-3 break-words text-4xl font-bold leading-tight text-[var(--title-color)] sm:text-3xl">
                  {card.subject}
                </p>
                {card.options && (
                  <ul
                    className="mt-6 grid gap-y-2.5"
                    role="radiogroup"
                    aria-label="Choose one, then show the answer"
                  >
                    {card.options.map((option) => (
                      <li key={option}>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={pick === option}
                          onClick={() => setPick(option)}
                          className={`w-full rounded-xl border-2 border-solid px-4 py-3 text-left text-lg font-bold duration-300 ${
                            pick === option
                              ? "border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)] text-[var(--title-color)]"
                              : "border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--chip-blue-border)]"
                          }`}
                        >
                          {option}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div>
                <p className="mb-4 text-sm font-bold uppercase tracking-wide text-[var(--muted-color)]">
                  {card.prompt} ·{" "}
                  <span className="normal-case">{card.subject}</span>
                </p>
                <Back card={card} pick={pick} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pb-2">
        {face === "front" ? (
          <button
            type="button"
            onClick={reveal}
            className={`${btn} w-full bg-[var(--primary-color)] py-4 text-lg text-white shadow-lg`}
          >
            Show answer{" "}
            <span className="ml-2 text-sm font-normal opacity-70 sm:hidden">
              space
            </span>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ["got", "Got it", "1", "bg-[hsl(150,62%,40%)] text-white"],
                [
                  "shaky",
                  "Shaky",
                  "2",
                  "bg-[hsl(38,96%,50%)] text-[hsl(30,90%,12%)]",
                ],
                [
                  "missed",
                  "Missed",
                  "3",
                  "bg-[var(--primary-color)] text-white",
                ],
              ] as const
            ).map(([value, label, key, tone]) => (
              <button
                key={value}
                type="button"
                onClick={() => grade(value)}
                className={`${btn} py-4 text-lg ${tone} hover:brightness-110`}
              >
                {label}
                <span className="ml-2 text-sm font-normal opacity-70 sm:hidden">
                  {key}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------------- setup
const Row = ({
  on,
  onToggle,
  children,
  hint,
  count,
}: {
  on: boolean;
  onToggle: () => void;
  children: ReactNode;
  hint?: string;
  count?: ReactNode;
}) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={on}
    onClick={onToggle}
    className={`flex w-full items-center gap-x-3 rounded-xl border-2 border-solid px-4 py-3 text-left duration-300 ${
      on
        ? "border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)]"
        : "border-[var(--border-color)] bg-[var(--container-color)] opacity-70 hover:opacity-100"
    }`}
  >
    <span
      aria-hidden
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-solid ${
        on
          ? "border-[var(--chip-blue-border)] bg-[var(--chip-blue-border)] text-white"
          : "border-[var(--border-color)]"
      }`}
    >
      {on && <LuCheck size={14} strokeWidth={3} />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block font-bold text-[var(--title-color)]">
        {children}
      </span>
      {hint && (
        <span className="block text-sm text-[var(--muted-color)]">{hint}</span>
      )}
    </span>
    {count !== undefined && (
      <span className="shrink-0 text-sm font-bold text-[var(--muted-color)]">
        {count}
      </span>
    )}
  </button>
);

const Segmented = <T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: [T, string][];
  onChange: (next: T) => void;
  label: string;
}) => (
  <div
    role="radiogroup"
    aria-label={label}
    className="inline-flex flex-wrap gap-1 rounded-[1.875rem] bg-[var(--body-color)] p-1"
  >
    {options.map(([id, text]) => (
      <button
        key={id}
        type="button"
        role="radio"
        aria-checked={value === id}
        onClick={() => onChange(id)}
        className={`rounded-[1.875rem] px-5 py-2 text-sm font-bold duration-300 ${
          value === id
            ? "bg-[var(--container-color)] text-[var(--title-color)] shadow-lg"
            : "text-[var(--muted-color)] hover:text-[var(--title-color)]"
        }`}
      >
        {text}
      </button>
    ))}
  </div>
);

const Heading = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
    {children}
  </h2>
);

const Study = ({
  guide,
  accentFor,
}: {
  guide: MedFile;
  accentFor: (group: string) => string;
}) => {
  const [prefs, setPrefs] = useSaved<Prefs>(
    "meds:study:v1",
    freshPrefs,
    validPrefs,
  );
  const [grades, setGrades] = useSaved<Grades>(
    "meds:cards:v1",
    freshGrades,
    validGrades,
  );
  const [index, setIndex] = useState<IndexType | null>(null);
  const [onlyWeak, setOnlyWeak] = useState(false);
  const [find, setFind] = useState("");
  const [session, setSession] = useState<Card[] | null>(null);
  const [run, setRun] = useState(0);

  useEffect(() => {
    let alive = true;
    loadInteractions()
      .then((file) => alive && setIndex(indexOf(file)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const meds = guide.medications;
  const chosen = useMemo(() => {
    const ids = new Set<string>();
    meds.forEach((med) => {
      if (
        prefs.scope === "all" ||
        (prefs.scope === "groups" && prefs.groups.includes(med.group)) ||
        (prefs.scope === "pick" && prefs.picked.includes(med.id))
      )
        ids.add(med.id);
    });
    return ids;
  }, [meds, prefs]);

  const inScope = useMemo(
    () => meds.filter((med) => chosen.has(med.id)),
    [meds, chosen],
  );
  const kinds = useMemo(() => new Set(prefs.kinds), [prefs.kinds]);
  const weak = (key: string) =>
    grades[key] === "missed" || grades[key] === "shaky";

  // How many cards of each kind the current drug choice supports, counted the
  // same way the deck is built so the number shown is the deck you get.
  const counts = useMemo(() => {
    const out = {} as Record<CardKind, number | null>;
    KINDS.forEach(({ kind }) => {
      if (kind === "interaction") {
        if (!index) {
          out[kind] = null;
          return;
        }
        if (onlyWeak) {
          out[kind] = Object.keys(grades).filter(
            (key) =>
              key.endsWith(":interaction") &&
              weak(key) &&
              !!cardForPairKey(key, meds, index) &&
              key
                .split(":")[0]
                .split("+")
                .some((id) => chosen.has(id)),
          ).length;
        } else {
          out[kind] = planInteractions(index, chosen, meds).perHalf * 2;
        }
        return;
      }
      out[kind] = inScope.filter(
        (med) =>
          supports(med, kind) && (!onlyWeak || weak(`${med.id}:${kind}`)),
      ).length;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inScope, index, onlyWeak, grades, chosen, meds]);

  const total = KINDS.reduce(
    (sum, { kind }) => sum + (kinds.has(kind) ? (counts[kind] ?? 0) : 0),
    0,
  );

  const weakAvailable = useMemo(() => {
    let n = 0;
    inScope.forEach((med) =>
      KINDS.forEach(({ kind }) => {
        if (
          kind !== "interaction" &&
          supports(med, kind) &&
          weak(`${med.id}:${kind}`)
        )
          n += 1;
      }),
    );
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inScope, grades]);

  const build = (): Card[] => {
    const cards: Card[] = [];
    inScope.forEach((med) =>
      KINDS.forEach(({ kind }) => {
        if (kind === "interaction" || !kinds.has(kind)) return;
        if (onlyWeak && !weak(`${med.id}:${kind}`)) return;
        const card = makeCard(med, kind, meds);
        if (card) cards.push(card);
      }),
    );
    if (kinds.has("interaction") && index) {
      if (onlyWeak) {
        Object.keys(grades).forEach((key) => {
          if (!key.endsWith(":interaction") || !weak(key)) return;
          if (
            !key
              .split(":")[0]
              .split("+")
              .some((id) => chosen.has(id))
          )
            return;
          const card = cardForPairKey(key, meds, index);
          if (card) cards.push(card);
        });
      } else {
        cards.push(...interactionCards(index, chosen, meds));
      }
    }
    return prefs.order === "shuffled" ? shuffle(cards) : cards;
  };

  const set = (patch: Partial<Prefs>) =>
    setPrefs((prev) => ({ ...prev, ...patch }));
  const toggle = <T,>(list: T[], item: T) =>
    list.includes(item)
      ? list.filter((entry) => entry !== item)
      : [...list, item];

  const recordGrade = useCallback(
    (key: string, grade: Grade) =>
      setGrades((prev) => ({ ...prev, [key]: grade })),
    [setGrades],
  );

  const finish = useCallback((again: Card[] | null) => {
    if (again && again.length) {
      setRun((prev) => prev + 1);
      setSession(again);
    } else {
      setSession(null);
    }
  }, []);

  const matches = useMemo(() => {
    const q = find.trim().toLowerCase();
    return meds.filter(
      (med) =>
        !q ||
        med.generic.toLowerCase().includes(q) ||
        med.brand.some((brand) => brand.toLowerCase().includes(q)),
    );
  }, [meds, find]);

  // The whole screen is the session while one runs: nothing else shows.
  // It is drawn straight into <body>: the page section animates in and so
  // carries a transform, and a `fixed` element inside a transformed one is
  // sized to that element instead of the screen.
  if (session) {
    return createPortal(
      <div className="fixed inset-0 z-40 overflow-y-auto bg-[var(--body-color)]">
        <Session
          key={run}
          deck={session}
          accentFor={accentFor}
          groups={guide.groups}
          onGrade={recordGrade}
          onFinish={finish}
        />
      </div>,
      document.body,
    );
  }

  const needIndex = kinds.has("interaction") && !index;
  const disabled = total === 0 || needIndex;

  return (
    <div className="grid gap-y-8 pt-3">
      <section>
        <Heading>Which drugs</Heading>
        <Segmented
          label="Which drugs"
          value={prefs.scope}
          onChange={(scope) => set({ scope })}
          options={[
            ["all", `All ${meds.length}`],
            ["groups", "By category"],
            ["pick", "Pick drugs"],
          ]}
        />

        {prefs.scope === "groups" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {guide.groups.map((group) => {
              const on = prefs.groups.includes(group.name);
              return (
                <button
                  key={group.name}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    set({ groups: toggle(prefs.groups, group.name) })
                  }
                  className={`inline-flex items-center gap-x-2 rounded-full border-2 border-solid px-4 py-2 text-sm font-bold duration-300 ${
                    on
                      ? "border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)] text-[var(--title-color)]"
                      : "border-[var(--border-color)] bg-[var(--container-color)] text-[var(--text-color)] hover:border-[var(--chip-blue-border)]"
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: accentFor(group.name) }}
                  />
                  {group.name}
                  <span className="font-normal text-[var(--muted-color)]">
                    {group.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {prefs.scope === "pick" && (
          <div className="mt-4 rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-3">
            <div className="relative mb-3">
              <LuSearch
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-color)]"
              />
              <input
                type="text"
                value={find}
                onChange={(event) => setFind(event.target.value)}
                placeholder="Find a drug…"
                aria-label="Find a drug"
                autoComplete="off"
                className="h-11 w-full rounded-[1.875rem] border border-solid border-[var(--border-color)] bg-[var(--body-color)] pl-11 pr-4 text-[var(--title-color)] outline-none placeholder:text-[var(--muted-color)] focus:border-[var(--chip-blue-border)]"
              />
            </div>
            <div className="mb-2 flex items-center justify-between px-1 text-sm">
              <span className="text-[var(--muted-color)]">
                {prefs.picked.length} picked
              </span>
              {prefs.picked.length > 0 && (
                <button
                  type="button"
                  onClick={() => set({ picked: [] })}
                  className="font-bold text-[var(--muted-color)] hover:text-[var(--primary-color)]"
                >
                  Clear
                </button>
              )}
            </div>
            <ul className="grid max-h-72 grid-cols-3 gap-1.5 overflow-y-auto pr-1 lg:grid-cols-2 sm:grid-cols-1">
              {matches.map((med) => {
                const on = prefs.picked.includes(med.id);
                return (
                  <li key={med.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() =>
                        set({ picked: toggle(prefs.picked, med.id) })
                      }
                      className={`flex w-full items-center gap-x-2 rounded-lg px-3 py-2 text-left text-sm font-bold duration-300 ${
                        on
                          ? "bg-[var(--chip-blue)] text-[var(--title-color)]"
                          : "text-[var(--text-color)] hover:bg-[var(--body-color)]"
                      }`}
                    >
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: accentFor(med.group) }}
                      />
                      <span className="min-w-0 truncate">{med.generic}</span>
                      {on && (
                        <LuCheck
                          aria-hidden
                          className="ml-auto shrink-0"
                          size={14}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <section>
        <Heading>Card types</Heading>
        {(
          [
            ["facts", "About one drug"],
            ["reverse", "Guess the drug"],
            ["interaction", "Interactions"],
          ] as const
        ).map(([family, title]) => (
          <div key={family} className="mb-5 last:mb-0">
            <p className="mb-2 text-sm font-bold text-[var(--text-color)]">
              {title}
            </p>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {KINDS.filter((entry) => entry.family === family).map(
                ({ kind, label, hint }) => (
                  <Row
                    key={kind}
                    on={kinds.has(kind)}
                    onToggle={() => set({ kinds: toggle(prefs.kinds, kind) })}
                    hint={hint}
                    count={counts[kind] ?? "…"}
                  >
                    {label}
                  </Row>
                ),
              )}
            </div>
          </div>
        ))}
        {kinds.has("interaction") && (
          <p className="mt-3 text-sm text-[var(--muted-color)]">
            Interaction cards are a sample: pairs the data flags (avoid pairs
            come up most) and pairs it doesn&apos;t. An unflagged pair is not
            proof two drugs are safe together.
          </p>
        )}
      </section>

      <section>
        <Heading>Order</Heading>
        <Segmented
          label="Order"
          value={prefs.order}
          onChange={(order) => set({ order })}
          options={[
            ["shuffled", "Shuffled"],
            ["sequential", "In order"],
          ]}
        />
        <div className="mt-4">
          <Row
            on={onlyWeak}
            onToggle={() => weakAvailable > 0 && setOnlyWeak((prev) => !prev)}
            hint={
              weakAvailable > 0
                ? "Start with the cards you missed or were shaky on last time"
                : "Nothing missed yet. Cards you miss will be saved here for next time"
            }
            count={weakAvailable}
          >
            Only cards I missed or was shaky on
          </Row>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-4 shadow-2xl">
        <p className="text-[var(--text-color)]">
          <span className="text-2xl font-bold text-[var(--title-color)]">
            {total}
          </span>{" "}
          {total === 1 ? "card" : "cards"} in this deck
          {needIndex && (
            <span className="text-[var(--muted-color)]"> · loading pairs…</span>
          )}
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const cards = build();
            if (cards.length) {
              setRun((prev) => prev + 1);
              setSession(cards);
            }
          }}
          className={`${btn} bg-[var(--primary-color)] text-white shadow-lg hover:animate-pulse disabled:shadow-none disabled:hover:animate-none`}
        >
          Start studying
        </button>
      </div>
    </div>
  );
};

export default Study;
