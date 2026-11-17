"use client";
import {
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PiCaretDownBold, PiStar, PiStarFill } from "react-icons/pi";
import Flash from "./Flash";
import Glow from "./Glow";
import { flameHueAt } from "./FlamePalette";
import {
  ChapterType,
  displayNumberOf,
  hasTag,
  isStory,
  QuestionType,
} from "./Questions";

export type PickType = string;
export type LensType = "all" | "incomplete";
export type ResultType = "solved" | "missed";

const Reset = ({ onReset }: { onReset: () => void }) => {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)] duration-300 hover:text-[var(--primary-color)]"
      >
        Reset
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
      <span className="font-bold text-[var(--title-color)]">
        Clear every answer?
      </span>

      <button
        type="button"
        onClick={() => {
          onReset();
          setConfirming(false);
        }}
        className="rounded-md bg-[var(--primary-color)] px-3 py-1 font-bold uppercase tracking-wide text-[var(--on-primary)]"
      >
        Reset
      </button>

      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="font-bold uppercase tracking-wide text-[var(--muted-color)] duration-300 hover:text-[var(--title-color)]"
      >
        Cancel
      </button>
    </span>
  );
};

const chip =
  "flex items-center gap-x-2 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wide duration-300";

const GLIDE = "cubic-bezier(0.22, 1, 0.36, 1)";

const calm = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Fill = ({
  solved,
  missed,
  total,
}: {
  solved: number;
  missed: number;
  total: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const crestRef = useRef<HTMLSpanElement>(null);
  const swellRef = useRef<HTMLSpanElement>(null);
  const was = useRef(solved + missed);
  const done = solved + missed;
  const level = total ? (done / total) * 100 : 0;
  const crest =
    missed > 0
      ? "bg-[color-mix(in_srgb,var(--primary-color)_50%,transparent)]"
      : "bg-[rgba(0,212,127,0.55)]";

  useEffect(() => {
    if (!done || calm()) return;
    const spin = (node: HTMLSpanElement | null, ms: number, back: boolean) =>
      node?.animate(
        [
          { transform: `translateX(-50%) rotate(${back ? 360 : 0}deg)` },
          { transform: `translateX(-50%) rotate(${back ? 0 : 360}deg)` },
        ],
        { duration: ms, iterations: Infinity, easing: "linear" },
      );

    const a = spin(crestRef.current, 6200, false);
    const b = spin(swellRef.current, 9400, true);
    return () => {
      a?.cancel();
      b?.cancel();
    };
  }, [done]);

  useEffect(() => {
    if (was.current === done) return;
    const rising = done > was.current;
    was.current = done;
    const body = ref.current;
    if (!body || !rising || calm()) return;

    const slosh = body.animate(
      [
        { transform: "rotate(0deg) translateY(7%)" },
        { transform: "rotate(-2.6deg) translateY(-3%)", offset: 0.26 },
        { transform: "rotate(2deg) translateY(1.5%)", offset: 0.54 },
        { transform: "rotate(-0.9deg) translateY(-0.5%)", offset: 0.78 },
        { transform: "rotate(0deg) translateY(0)" },
      ],
      { duration: 1100, easing: "ease-out" },
    );

    return () => slosh.cancel();
  }, [done]);

  if (!total) return null;

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
    >
      <span
        ref={ref}
        style={{ height: `${level}%` }}
        className="absolute -inset-x-1 bottom-0 flex origin-bottom flex-col-reverse transition-[height] duration-[900ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]"
      >
        <span
          style={{ flexGrow: solved }}
          className="w-full bg-[rgba(0,212,127,0.55)]"
        />
        <span
          style={{ flexGrow: missed }}
          className="w-full bg-[color-mix(in_srgb,var(--primary-color)_50%,transparent)]"
        />

        {done > 0 && (
          <span className="absolute inset-x-0 -top-[6px] h-[10px] overflow-hidden">
            <span
              ref={swellRef}
              style={{ top: "2px", borderRadius: "38% 62% 44% 56%" }}
              className={`absolute left-1/2 h-[3.5rem] w-[3.5rem] -translate-x-1/2 opacity-55 ${crest}`}
            />
            <span
              ref={crestRef}
              style={{ top: "4px", borderRadius: "58% 42% 63% 37%" }}
              className={`absolute left-1/2 h-[3.25rem] w-[3.25rem] -translate-x-1/2 ${crest}`}
            />
          </span>
        )}
      </span>
    </span>
  );
};

const Count = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || calm()) return;
    const animation = node.animate(
      [
        { opacity: 0, transform: "translateX(-8px)" },
        { opacity: 1, transform: "translateX(0)" },
      ],
      { duration: 560, easing: GLIDE },
    );
    return () => animation.cancel();
  }, []);

  return (
    <span ref={ref} className="font-normal normal-case">
      {children}
    </span>
  );
};

const Chip = ({
  on,
  tone,
  onPick,
  children,
  disabled,
}: {
  on: boolean;
  tone: string;
  onPick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const was = useRef(on);

  useEffect(() => {
    if (was.current === on) return;
    was.current = on;
    const node = ref.current;
    if (!node || !on || calm()) return;
    const animation = node.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.06)" },
        { transform: "scale(1)" },
      ],
      { duration: 620, easing: GLIDE },
    );
    return () => animation.cancel();
  }, [on]);

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={onPick}
      aria-pressed={on}
      className={`${chip} ${
        on
          ? tone
          : "bg-[var(--container-color)] hover:text-[var(--title-color)]"
      }`}
    >
      {children}
    </button>
  );
};

interface MenuItemType {
  id: string;
  title: string;
  count: number;
}

// A styled dropdown for choosing one group: opens on click or arrow keys,
// moves with the arrows, picks with Enter, and closes on Escape or an
// outside press.
const Menu = ({
  value,
  items,
  placeholder,
  onPick,
}: {
  value: string | null;
  items: MenuItemType[];
  placeholder: string;
  onPick: (id: string) => void;
}) => {
  const [shown, setShown] = useState(false);
  const [cursor, setCursor] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const current = items.find((item) => item.id === value);

  useEffect(() => {
    if (!shown) return;
    const away = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setShown(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [shown]);

  const step = (from: number, direction: number) => {
    let at = from;
    for (let tried = 0; tried < items.length; tried += 1) {
      at = (at + direction + items.length) % items.length;
      if (items[at].count > 0) return at;
    }
    return from;
  };

  const show = () => {
    const at = items.findIndex((item) => item.id === value);
    setCursor(at >= 0 ? at : step(-1, 1));
    setShown(true);
  };

  const choose = (id: string) => {
    setShown(false);
    onPick(id);
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (!shown) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        show();
      }
      return;
    }
    if (event.key === "Escape") {
      setShown(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor(step(cursor, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor(step(cursor, -1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (items[cursor]?.count > 0) choose(items[cursor].id);
    }
  };

  return (
    <div ref={root} onKeyDown={onKeyDown} className="relative sm:order-last">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={shown}
        onClick={() => (shown ? setShown(false) : show())}
        className={`${chip} ${
          current
            ? "bg-[var(--chip-blue)] text-[var(--title-color)]"
            : "bg-[var(--body-color)] text-[var(--title-color)]"
        } outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]`}
      >
        <span>{current?.title ?? placeholder}</span>
        <PiCaretDownBold
          aria-hidden
          className={`duration-300 ${shown ? "rotate-180" : ""}`}
        />
      </button>

      {shown && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-30 mt-2 max-h-80 w-72 max-w-[calc(100vw-4rem)] animate-fadeIn overflow-auto rounded-xl bg-[var(--body-color)] p-1.5 shadow-xl ring-1 ring-[var(--chip-blue-border)]"
        >
          {items.map((item, index) => (
            <li key={item.id} role="option" aria-selected={item.id === value}>
              <button
                type="button"
                disabled={item.count === 0}
                onClick={() => choose(item.id)}
                onMouseEnter={() => setCursor(index)}
                className={`flex w-full items-center justify-between gap-x-3 rounded-lg px-3 py-2 text-left text-xs font-bold duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
                  item.id === value
                    ? "bg-[var(--chip-blue)] text-[var(--title-color)]"
                    : index === cursor
                      ? "bg-[var(--container-color)] text-[var(--title-color)]"
                      : "text-[var(--muted-color)]"
                }`}
              >
                <span>{item.title}</span>
                <span className="font-normal opacity-70">{item.count}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Where to pick up in a list of questions: the first one never answered; once
// everything has been answered, the first one answered wrong; once everything
// is right, the start.
export const firstToDo = (
  questions: QuestionType[],
  results: Record<string, ResultType>,
) => {
  const fresh = questions.findIndex((entry) => results[entry.id] === undefined);
  if (fresh !== -1) return fresh;
  return Math.max(
    0,
    questions.findIndex((entry) => results[entry.id] !== "solved"),
  );
};

const ChapterSet = ({
  chapters,
  active,
  results,
  current,
  lens,
  onRun,
  noun,
  labelFor,
  picker = "grid",
  placeholder = "Choose a skill…",
  starred,
  progressOf,
  total,
  left,
  onStart,
  onReset,
}: {
  chapters: ChapterType[];
  active: PickType | null;
  results: Record<string, ResultType>;
  current: string | null;
  lens: LensType;
  onRun: (next: LensType, keepChapter?: boolean) => void;
  noun: string;
  labelFor: (chapter: ChapterType) => string;
  picker?: "grid" | "select" | "menu";
  placeholder?: string;
  starred?: Record<string, true>;
  progressOf: (id: string) => { solved: number; missed: number; total: number };
  total: number;
  left: number;
  onStart: (pick: PickType, at: number) => void;
  onReset: () => void;
}) => {
  const [open, setOpen] = useState<string | null>(null);
  const [arrow, setArrow] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const tiles = useRef(new Map<string, HTMLButtonElement>());

  const rows = useMemo(() => {
    const nameOf = (chapter: ChapterType): string => chapter.source ?? "";
    const found = Array.from(new Set(chapters.map(nameOf)));
    if (found.length < 2) return [{ name: "", chapters }];
    const order = ["Potter", "Iggy"];
    const names = [
      ...order.filter((name) => found.includes(name)),
      ...found.filter((name) => !order.includes(name)),
    ];
    return names.map((name) => ({
      name,
      chapters: chapters.filter((chapter) => nameOf(chapter) === name),
    }));
  }, [chapters]);

  const place = useCallback((id: string) => {
    const tile = tiles.current.get(id);
    const grid = gridRef.current;
    if (!tile || !grid) return;
    const box = tile.getBoundingClientRect();
    const frame = grid.getBoundingClientRect();
    setArrow(box.left - frame.left + box.width / 2);
  }, []);

  useEffect(() => {
    if (open !== null && !chapters.some((chapter) => chapter.id === open))
      setOpen(null);
  }, [open, chapters]);

  useEffect(() => {
    if (open === null) return;
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new ResizeObserver(() => place(open));
    observer.observe(grid);
    return () => observer.disconnect();
  }, [open, place]);

  // Opening a chapter or topic also starts it, at the first question not yet
  // answered (else the first one missed, else the first), so there is nothing more
  // to click: the tiles below are only for jumping to a particular question.
  const begin = (chapter: ChapterType) => {
    if (!chapter.questions.length) return;
    onStart(chapter.id, firstToDo(chapter.questions, results));
  };

  const toggle = (chapter: ChapterType) => {
    if (open === chapter.id) {
      setOpen(null);
      return;
    }
    setOpen(chapter.id);
    place(chapter.id);
    begin(chapter);
  };

  const flameIndex = new Map(
    chapters.map((chapter, index) => [chapter.id, index] as const),
  );
  const hueOf = (chapterId: string) =>
    flameHueAt(flameIndex.get(chapterId) ?? 0);

  const ready = chapters.filter((chapter) => chapter.questions.length > 0);
  const banked = ready.reduce(
    (sum, chapter) => sum + chapter.questions.length,
    0,
  );
  const shown = chapters.find((chapter) => chapter.id === open);

  return (
    <div
      data-shapes-safe
      className="mb-6 rounded-2xl bg-[var(--container-color)] p-5"
    >
      <div
        className={`flex flex-wrap items-center gap-x-2 gap-y-3 text-xs text-[var(--muted-color)] ${
          picker === "grid" ? "mb-6" : ""
        }`}
      >
        <span className="contents">
          <Chip
            on={lens === "all"}
            tone="bg-[var(--chip-blue)] text-[var(--title-color)]"
            onPick={() => {
              if (lens === "all" && open !== null) return;
              const keep = open !== null;
              if (!keep) setOpen(null);
              onRun("all", keep);
            }}
          >
            All
            {lens === "all" && <Count>{total} questions</Count>}
          </Chip>

          <Chip
            on={lens === "incomplete"}
            disabled={left === 0}
            tone="bg-[var(--chip-amber)] text-[var(--title-color)]"
            onPick={() => {
              if (lens === "incomplete" && open !== null) return;
              const keep = open !== null;
              if (!keep) setOpen(null);
              onRun("incomplete", keep);
            }}
          >
            Incomplete
            {lens === "incomplete" && <Count>{left} left</Count>}
          </Chip>

          {picker === "menu" && (
            <Menu
              value={open}
              placeholder={placeholder}
              items={chapters.map((chapter) => ({
                id: chapter.id,
                title: chapter.title,
                count: chapter.questions.length,
              }))}
              onPick={(next) => {
                setOpen(next);
                const chapter = chapters.find((entry) => entry.id === next);
                if (chapter) begin(chapter);
              }}
            />
          )}

          {picker === "select" && (
            <span className="relative sm:order-last">
              <select
                value={open ?? ""}
                onChange={(event) => {
                  const next = event.target.value || null;
                  setOpen(next);
                  const chapter = chapters.find((entry) => entry.id === next);
                  if (chapter) begin(chapter);
                }}
                className="w-44 cursor-pointer appearance-none truncate rounded-md bg-[var(--body-color)] py-1.5 pl-3 pr-8 text-xs font-bold text-[var(--title-color)] outline-none duration-300 focus:ring-2 focus:ring-[var(--primary-color)]"
              >
                <option value="">{placeholder}</option>
                {chapters.map((chapter) => (
                  <option
                    key={chapter.id}
                    value={chapter.id}
                    disabled={chapter.questions.length === 0}
                  >
                    {chapter.title}
                    {chapter.questions.length
                      ? ` (${chapter.questions.length})`
                      : " — no questions yet"}
                  </option>
                ))}
              </select>
              <PiCaretDownBold
                aria-hidden
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-color)]"
              />
            </span>
          )}
        </span>

        <span className="ml-auto pl-3">
          <Reset onReset={onReset} />
        </span>
      </div>

      {picker !== "grid" ? null : (
        <div ref={gridRef} className="-m-1 flex flex-col gap-5 p-1">
          {rows.map((row) => (
            <div key={row.name}>
              {row.name && (
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-color)]">
                  {row.name}
                </p>
              )}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2">
                {row.chapters.map((chapter) => {
                  const count = chapter.questions.length;
                  const here = open === chapter.id;
                  const progress = progressOf(chapter.id);
                  const wet = progress.solved + progress.missed > 0;
                  const fresh = chapter.questions.some(
                    (question) =>
                      (question.new ||
                        question.dailySet ||
                        hasTag(question, "review") ||
                        hasTag(question, "jeopardy")) &&
                      !results[question.id],
                  );
                  return (
                    <button
                      key={chapter.id}
                      ref={(node) => {
                        if (node) tiles.current.set(chapter.id, node);
                        else tiles.current.delete(chapter.id);
                      }}
                      type="button"
                      disabled={!count}
                      onClick={() => toggle(chapter)}
                      aria-expanded={here}
                      title={
                        count
                          ? `${labelFor(chapter)} · ${count} questions${fresh ? " · has new questions" : ""}`
                          : `${labelFor(chapter)} · no questions yet`
                      }
                      className={`relative h-10 rounded-lg border-2 border-solid text-xs font-bold duration-300 ${here ? "tile-selected z-[1]" : ""} ${
                        !count
                          ? "cursor-not-allowed border-transparent text-[#cfc9bb]"
                          : here
                            ? "border-[var(--primary-color)] text-[var(--title-color)]"
                            : active === chapter.id
                              ? "border-[var(--chip-blue-border)] text-[var(--title-color)]"
                              : wet
                                ? "border-transparent text-[var(--title-color)] hover:border-[var(--chip-blue-border)]"
                                : "border-transparent text-[var(--muted-color)] hover:border-[var(--chip-blue-border)] hover:text-[var(--title-color)]"
                      } bg-[var(--body-color)]`}
                    >
                      {fresh && (
                        <Glow
                          label="Has new questions"
                          hue={hueOf(chapter.id)}
                          edge={2}
                        />
                      )}
                      <Fill {...progress} />
                      {chapter.members && chapter.members.length > 1 ? (
                        <Flash
                          items={chapter.members.map((member) =>
                            String(member.chapterNumber),
                          )}
                        />
                      ) : (
                        <span className="relative">
                          {displayNumberOf(chapter)}
                        </span>
                      )}
                      {count > 0 && (
                        <span className="pointer-events-none absolute -right-1 -top-1 rounded-md bg-[var(--chip-blue)] px-1 text-[9px] leading-[14px] text-[var(--title-color)]">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {shown && (
        <div className="relative mt-6 animate-fadeIn">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="font-bold text-[var(--title-color)]">
              {shown.members && shown.members.length > 1 ? (
                <>
                  Chapter{" "}
                  <Flash
                    items={shown.members.map((member) =>
                      String(member.chapterNumber),
                    )}
                  />{" "}
                  · {shown.title}
                </>
              ) : (
                labelFor(shown)
              )}
            </span>
            <span className="text-xs text-[var(--muted-color)]">
              {shown.questions.length} questions
            </span>
          </div>

          <div className="-m-2 grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-2 p-2 md:max-h-[45dvh] md:overflow-y-auto md:overscroll-contain">
            {shown.questions.map((question, index) => {
              const state = results[question.id];
              const here = current === question.id;
              const glitching = hasTag(question, "review") && !state;
              const playful = hasTag(question, "jeopardy") && !state;
              return (
                <button
                  key={question.id}
                  type="button"
                  title={`Question ${index + 1}`}
                  aria-current={here}
                  onClick={() => onStart(shown.id, index)}
                  className={`relative h-9 rounded-lg text-xs font-bold duration-300 ${
                    glitching ? "tile-glitch" : ""
                  } ${
                    here
                      ? "ring-2 ring-[var(--primary-color)] ring-offset-2 ring-offset-[var(--container-color)]"
                      : ""
                  } ${
                    state === "solved"
                      ? "bg-[rgb(0,212,127)] text-white"
                      : state === "missed"
                        ? "bg-[var(--primary-color)] text-[var(--on-primary)]"
                        : "bg-[var(--body-color)] text-[var(--muted-color)] hover:bg-[var(--chip-blue)] hover:text-[var(--title-color)]"
                  }`}
                >
                  {(question.new ||
                    question.dailySet ||
                    glitching ||
                    playful) &&
                    !state && (
                      <Glow label="New question" hue={hueOf(shown.id)} />
                    )}
                  {isStory(question) ? (
                    <span
                      aria-label="Case study"
                      title="Case study"
                      className="pointer-events-none absolute -right-1 -top-1 text-[11px] leading-none"
                    >
                      ⭐
                    </span>
                  ) : hasTag(question, "jeopardy") ? (
                    <span
                      aria-label="Jeopardy question"
                      title="Jeopardy question"
                      className="pointer-events-none absolute -right-1 -top-1 text-[11px] leading-none"
                    >
                      🎮
                    </span>
                  ) : (
                    question.difficulty === "difficult" && (
                      <span
                        aria-label="Difficult question"
                        title="Difficult question"
                        className="pointer-events-none absolute -right-1 -top-1 text-[11px] leading-none"
                      >
                        💀
                      </span>
                    )
                  )}
                  {starred?.[question.id] && (
                    <PiStarFill
                      aria-label="Favorite"
                      size={11}
                      className="pointer-events-none absolute -bottom-1 -left-1 text-[hsl(43,100%,55%)]"
                    />
                  )}
                  {question.ordinal ?? index + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterSet;
