"use client";
import {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";
import {
  PiCalendarBlank,
  PiCheckBold,
  PiCaretRightBold,
  PiPlusBold,
  PiChatCircleText,
  PiStack,
  PiGraph,
  PiMagnifyingGlass,
  PiXBold,
} from "react-icons/pi";
import { useSaved } from "../DosageCalculations/Saved";
import Shapes from "../Home/Shapes";
import { flameHueAt } from "../Nclex/FlamePalette";
import Swap from "../Nclex/Swap";
import TypedText from "../Typed/TypedText";
import CompareMap from "./CompareMap";
import { MAX_COMPARE, shortName } from "./Interactions";
import {
  BASE,
  COMPARE,
  pathOf,
  STUDY,
  loadGuide,
  parsePath,
  RouteType,
  ROOT,
  search,
  searchGroups,
  termsOf,
} from "./Data";
import { Headline } from "./Emphasis";
import MedDetail from "./MedDetail";
import {
  PatientBar,
  PatientDisclaimer,
  PatientModal,
  PatientReadings,
  useLabs,
  usePatient,
} from "./Patient";
import Study from "./Study";
import { SuggestModal } from "./Suggest";
import MedOfTheDay from "./MedOfTheDay";
import { dayKey, medOfTheDay } from "./Daily";
import { GroupType, MedFile, MedType } from "./types";

const calm = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Wraps the part of `text` that matches what was typed.
const Marked = ({ text, query }: { text: string; query: string }) => {
  // With a comma-separated search, the first of the terms found is marked.
  const lower = text.toLowerCase();
  const term = termsOf(query).find((entry) =>
    lower.includes(entry.toLowerCase()),
  );
  if (!term) return <>{text}</>;
  const at = lower.indexOf(term.toLowerCase());
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded bg-[hsla(43,100%,55%,0.35)] px-0.5 text-inherit">
        {text.slice(at, at + term.length)}
      </mark>
      {text.slice(at + term.length)}
    </>
  );
};

const accentOf = (index: number) => `hsl(${flameHueAt(index)}, 75%, 60%)`;

const Badges = ({ med }: { med: MedType }) => (
  <>
    {med.high_alert && (
      <span className="rounded-md bg-[var(--chip-amber)] px-2.5 py-0.5 text-[11px] font-bold text-[hsl(38,100%,60%)] [:root[data-theme=light]_&]:text-[hsl(30,90%,28%)]">
        High alert
      </span>
    )}
    {med.black_box.length > 0 && (
      <span className="rounded-md bg-[color-mix(in_srgb,var(--primary-color)_16%,transparent)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--primary-color)]">
        Black box
      </span>
    )}
  </>
);

const MedRow = ({
  med,
  query,
  showGroup,
  accent,
  delay,
  onOpen,
  picked,
  pickedFull,
  onPick,
}: {
  med: MedType;
  query: string;
  showGroup: boolean;
  accent: string;
  delay: number;
  onOpen: (id: string) => void;
  picked: boolean;
  pickedFull: boolean;
  onPick: () => void;
}) => (
  <div className="relative h-full" data-tilt data-med-card={med.id}>
    <button
      type="button"
      onClick={() => onOpen(med.id)}
      className="group flex h-full w-full items-start gap-x-4 rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-5 py-4 text-left duration-300 hover:border-[var(--chip-blue-border)] hover:shadow-lg sm:px-4"
    >
      <span
        aria-hidden
        className="w-1.5 shrink-0 self-stretch rounded-sm"
        style={{ background: accent }}
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pr-8">
          <span className="text-lg font-bold text-[var(--title-color)]">
            <Marked text={med.generic} query={query} />
          </span>
          <Badges med={med} />
        </span>
        <span className="mt-1.5 block text-sm text-[var(--muted-color)]">
          <Marked text={med.brand.join(", ")} query={query} />
        </span>
        {showGroup && (
          <span className="mt-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
            {med.group}
          </span>
        )}
        <span className="mt-2.5 block text-base font-bold leading-snug text-[var(--title-color)]">
          <Headline text={med.highlight.headline} delay={delay} />
        </span>
        <span className="mt-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
          Why this one
        </span>
        {med.why_this_one.points.length > 1 ? (
          <span className="mt-1 grid gap-y-1.5 text-sm leading-relaxed text-[var(--text-color)]">
            {med.why_this_one.points.map((point) => (
              <span key={point} className="flex gap-x-2.5">
                <span
                  aria-hidden
                  className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--chip-blue-border)]"
                />
                <span className="min-w-0">
                  <Marked text={point} query={query} />
                </span>
              </span>
            ))}
          </span>
        ) : (
          <span className="mt-0.5 block text-sm leading-relaxed text-[var(--text-color)]">
            <Marked text={med.why_this_one.text} query={query} />
          </span>
        )}
      </span>
      <PiCaretRightBold
        aria-hidden
        className="shrink-0 self-center text-[var(--muted-color)] duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--title-color)]"
      />
    </button>
    {/* Beside the card, not inside it: a button can't hold a button. Adds this
      medication to (or takes it off) the interaction check without opening it. */}
    <button
      type="button"
      onClick={onPick}
      aria-pressed={picked}
      aria-label={
        picked
          ? `Remove ${med.generic} from the interaction check`
          : `Add ${med.generic} to the interaction check`
      }
      disabled={!picked && pickedFull}
      title={
        picked
          ? "On your interaction-check list. Tap to remove"
          : pickedFull
            ? "The interaction-check list is full (8)"
            : "Add to the interaction check"
      }
      className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-solid duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
        picked
          ? "border-[hsl(156,100%,42%)] bg-[hsl(156,100%,42%)] text-white hover:brightness-110"
          : "border-[var(--muted-color)] bg-[var(--container-color)] text-[var(--title-color)] hover:scale-105 hover:border-[var(--title-color)]"
      }`}
    >
      {picked ? <PiCheckBold size={16} /> : <PiPlusBold size={18} />}
    </button>
  </div>
);

const GroupCard = ({
  group,
  index,
  query,
  selected,
  onPick,
}: {
  group: GroupType;
  index: number;
  query: string;
  selected: boolean;
  onPick: () => void;
}) => (
  <button
    type="button"
    onClick={onPick}
    aria-pressed={selected}
    data-tilt
    data-group-card={group.name}
    className={`flex h-full items-center gap-x-4 rounded-2xl border-2 border-solid px-5 py-4 text-left duration-300 ${
      selected
        ? "border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)] shadow-lg"
        : "border-[var(--border-color)] bg-[var(--container-color)] hover:border-[var(--chip-blue-border)] hover:shadow-lg"
    }`}
  >
    <span
      aria-hidden
      className="w-1.5 shrink-0 self-stretch rounded-sm"
      style={{ background: accentOf(index) }}
    />
    <span className="min-w-0 flex-1">
      {/* A name of several words wraps onto the next line like any text. Only
          a single word too long for the card ("Immunosuppressants") is cut
          with an ellipsis, so each word is its own box that can be cut. The
          full name is in the tooltip. */}
      <span
        title={group.name}
        className="block text-lg font-bold leading-tight text-[var(--title-color)]"
      >
        {group.name.split(" ").map((word, position) => (
          <Fragment key={position}>
            {position > 0 && " "}
            <span className="inline-block max-w-full truncate align-bottom">
              <Marked text={word} query={query} />
            </span>
          </Fragment>
        ))}
      </span>
      <span className="block truncate text-sm text-[var(--muted-color)]">
        {group.count} {group.count === 1 ? "medication" : "medications"}
      </span>
    </span>
    {selected ? (
      <PiXBold aria-hidden className="shrink-0 text-[var(--muted-color)]" />
    ) : (
      <PiCaretRightBold
        aria-hidden
        className="shrink-0 text-[var(--muted-color)]"
      />
    )}
  </button>
);

// The category you picked, shown as one clean pill above its medications.
// Clicking it clears the pick and brings the other categories back.
const GroupTag = ({
  group,
  index,
  onClear,
}: {
  group: GroupType;
  index: number;
  onClear: () => void;
}) => (
  <button
    type="button"
    onClick={onClear}
    aria-pressed
    data-group-tag
    aria-label={`${group.name} selected. Show all categories`}
    title="Show all categories"
    className="group inline-flex max-w-full items-center gap-x-3 rounded-md border-2 border-solid border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)] py-2 pl-5 pr-2.5 shadow-lg duration-300 hover:bg-[var(--chip-blue)]"
  >
    <span
      aria-hidden
      className="h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ background: accentOf(index) }}
    />
    <span className="min-w-0 truncate text-base font-bold text-[var(--title-color)]">
      {group.name}
    </span>
    <span className="shrink-0 whitespace-nowrap text-sm text-[var(--muted-color)]">
      {group.count} {group.count === 1 ? "medication" : "medications"}
    </span>
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--body-color)] text-[var(--muted-color)] duration-300 group-hover:text-[var(--title-color)]">
      <PiXBold aria-hidden size={16} />
    </span>
  </button>
);

const Empty = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl bg-[var(--container-color)] p-7 text-center text-[var(--muted-color)]">
    {children}
  </div>
);

// Flashcard study mode is built (Study.tsx, Cards.ts) but switched off for now.
// Flip this to bring back its button and its "#/study" page.
const FLASHCARDS = false;

const freshList = (): string[] => [];
const validList = (saved: string[]) =>
  Array.isArray(saved) && saved.every((entry) => typeof entry === "string");

// The medications picked for the interaction check, always one tap away while
// you browse. Sits above the page, centered on the content (not the sidebar).
const Tray = ({
  meds,
  onRemove,
  onClear,
  onOpen,
}: {
  meds: MedType[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpen: () => void;
}) => (
  <div className="pointer-events-none fixed bottom-4 left-20 right-0 z-20 flex justify-center px-4 lg:left-0">
    <div
      role="region"
      aria-label="Medications picked for the interaction check"
      className="pointer-events-auto flex max-h-[40dvh] w-full max-w-[52rem] animate-fadeIn flex-wrap items-center gap-x-4 gap-y-3 overflow-y-auto rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-3 shadow-2xl"
    >
      <div className="flex min-w-0 flex-1 basis-[18rem] flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-x-2 text-sm font-bold text-[var(--title-color)]">
          <PiGraph aria-hidden className="text-[var(--chip-blue-border)]" />
          {meds.length}/{MAX_COMPARE}
        </span>
        {meds.map((med) => (
          <span
            key={med.id}
            className="inline-flex items-center gap-x-1 rounded-md bg-[var(--chip-blue)] py-1 pl-3.5 pr-1 text-sm font-bold text-[var(--title-color)]"
          >
            {shortName(med)}
            <button
              type="button"
              onClick={() => onRemove(med.id)}
              aria-label={`Remove ${med.generic}`}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted-color)] duration-300 hover:bg-[var(--body-color)] hover:text-[var(--title-color)]"
            >
              <PiXBold size={14} />
            </button>
          </span>
        ))}
      </div>
      <span className="flex shrink-0 items-center gap-x-3 md:w-full md:justify-end">
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-bold text-[var(--muted-color)] duration-300 hover:text-[var(--primary-color)]"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onOpen}
          disabled={meds.length < 2}
          className="rounded-md bg-[var(--primary-color)] px-5 py-2.5 text-sm font-bold leading-4 text-[var(--on-primary)] shadow-lg duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:animate-none"
        >
          {meds.length < 2 ? "Add one more" : "Check interactions"}
        </button>
      </span>
    </div>
  </div>
);

// The footer card at the very bottom of every page of the guide, as wide as the
// content above it and sitting against the bottom edge of the page: how far to
// trust the guide, and where its information comes from.
const SourcesNote = ({ clearTray }: { clearTray: boolean }) => {
  const link =
    "underline decoration-[var(--muted-color)] underline-offset-2 duration-300 hover:text-[var(--title-color)]";
  const card = useRef<HTMLDivElement>(null);
  const skirt = useRef<HTMLDivElement>(null);

  // Pulling the page up past its end (the elastic bounce on a trackpad or a
  // phone) slides the page up and shows what is behind it. The skirt is a strip
  // pinned to the bottom of the window, as wide as the card and the card's own
  // color, so what that bounce shows under the card is more card. It sits
  // behind the card (the card hides it), and is only switched on once the page
  // is scrolled to its end, so it never shows anywhere else.
  useEffect(() => {
    const place = () => {
      const strip = skirt.current;
      const box = card.current?.getBoundingClientRect();
      if (!strip || !box) return;
      strip.style.left = `${box.left}px`;
      strip.style.width = `${box.width}px`;
      const root = document.documentElement;
      const atEnd =
        window.scrollY + window.innerHeight >= root.scrollHeight - 2;
      strip.style.display = atEnd ? "block" : "none";
    };
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    // The page grows as the guide loads and as lists change.
    const watcher = new ResizeObserver(place);
    watcher.observe(document.body);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
      watcher.disconnect();
    };
  }, []);

  return (
    <footer className="relative z-10 mx-auto mt-auto w-full max-w-[1080px] px-10 md:px-6">
      <div
        ref={skirt}
        aria-hidden
        className="pointer-events-none fixed bottom-0 -z-[1] hidden h-20 border-x border-solid border-[var(--border-color)] bg-[var(--container-color)]"
      />
      <div
        ref={card}
        className={`rounded-b-none rounded-t-xl border border-b-0 border-solid border-[var(--border-color)] bg-[var(--container-color)] px-6 pt-5 text-center text-sm leading-relaxed text-[var(--muted-color)] shadow-[0_-8px_24px_rgba(0,0,0,0.25)] ${
          clearTray ? "pb-32" : "pb-5"
        }`}
      >
        <p>
          Use this as reference. Priority order: LexiComp, Davis&apos; Drug
          Guide, and then <em>this</em>.
        </p>
        <p className="mt-1">
          This uses information from:{" "}
          <a
            href="https://www.drugs.com/pro/"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            Drugs.com
          </a>{" "}
          and{" "}
          <a
            href="https://dailymed.nlm.nih.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            DailyMed
          </a>
          .
        </p>
      </div>
    </footer>
  );
};

// The day the medication-of-the-day popup was last closed ("2026-10-14").
const DAILY_KEY = "meds:day:v1";

const Medications = () => {
  const [guide, setGuide] = useState<MedFile | null>(null);
  const [failed, setFailed] = useState(false);
  const [route, setRoute] = useState<RouteType>(ROOT);
  // Next tells us when the address changes by any route other than our own
  // pushState: the sidebar's link back to /medications, for one.
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useSaved<string[]>(
    "meds:compare:v1",
    freshList,
    validList,
  );
  const top = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  // The test patient: labs and vitals kept on the device, edited in a window,
  // and read against the medications picked on the interaction check.
  const [labs, setLabs] = useLabs();
  const [labsOpen, setLabsOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  // Medication of the day: shown once each day on entering the guide, once the
  // guide has loaded. `?medday=2026-12-25` shows what a given day would bring
  // (and shows it again), for checking ahead.
  const [daily, setDaily] = useState<{
    med: MedType;
    date: Date;
    preview: boolean;
  } | null>(null);
  const patient = usePatient(labsOpen || route.compare === true);

  useEffect(() => {
    let alive = true;
    loadGuide()
      .then((next) => alive && setGuide(next))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!guide) return;
    let date = new Date();
    let preview = false;
    const asked = new URLSearchParams(window.location.search).get("medday");
    const parsed = asked && /^\d{4}-\d{2}-\d{2}$/.test(asked) ? asked : null;
    if (parsed) {
      const [year, month, day] = parsed.split("-").map(Number);
      date = new Date(year, month - 1, day);
      preview = true;
    }
    try {
      if (!preview && window.localStorage.getItem(DAILY_KEY) === dayKey(date)) {
        return;
      }
    } catch {}
    const med = medOfTheDay(guide.medications, date);
    if (med) setDaily({ med, date, preview });
  }, [guide]);

  // The same popup on request, for today's medication.
  const openDaily = () => {
    if (!guide) return;
    const date = new Date();
    const med = medOfTheDay(guide.medications, date);
    if (med) setDaily({ med, date, preview: false });
  };

  const closeDaily = useCallback(() => {
    setDaily((current) => {
      // Looking ahead at another day doesn't count as seeing today's.
      if (current && !current.preview) {
        try {
          window.localStorage.setItem(DAILY_KEY, dayKey(new Date()));
        } catch {}
      }
      return null;
    });
  }, []);

  // The address is the single source of truth for where the learner is, so
  // the browser's back/forward buttons walk the same path as the breadcrumb.
  // We move with history.pushState rather than a Next navigation: the page
  // stays mounted, so the guide doesn't reload on every click.
  useEffect(() => {
    if (!guide) return;
    const read = () => {
      // Links from before the address had real paths ("/medications#/x/y").
      const legacy = window.location.hash.replace(/^#/, "");
      if (legacy.startsWith("/")) {
        const old = parsePath(`${BASE}${legacy}`, guide);
        window.history.replaceState(null, "", pathOf(old));
      }
      const next = parsePath(window.location.pathname, guide);
      setRoute(next.study && !FLASHCARDS ? ROOT : next);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [guide, pathname]);

  // The route the page is showing right now, readable from inside `go`.
  const shown = useRef(route);
  shown.current = route;

  // Moves to another route. With `animate`:
  //  - a medication opens as one motion: the card you pressed turns into the
  //    medication's big card, which opens out from where the card was;
  //  - a category card grows into the category's tag (and back), as a view
  //    transition;
  //  - everything else (leaving a medication, hopping to the next one) just
  //    changes, with the page's own quick fade.
  // Leaving a medication used to be a view transition too, but the picture it
  // takes of a tall medication page made the move stutter and left a ghost of
  // the old page behind. Browsers without view transitions, and visitors who
  // asked for less motion, just get the move.
  const go = useCallback(
    (next: RouteType, animate = false, alongside?: () => void) => {
      if (!guide) return;
      const path = pathOf(next);
      // `alongside` is anything else that changes with the page (clearing the
      // search): it has to happen in the same step, or the card being pressed
      // would already be gone when the motion starts.
      const commit = () => {
        alongside?.();
        if (window.location.pathname.replace(/\/$/, "") !== path) {
          window.history.pushState(null, "", path);
        }
        setRoute(parsePath(path, guide));
      };

      const here = shown.current;
      const find = (selector: string | null) =>
        selector ? document.querySelector<HTMLElement>(selector) : null;

      // A medication's card -> the medication.
      if (animate && !calm() && next.med && !here.med) {
        const pressed = find(`[data-med-card="${next.med}"]`);
        if (pressed) {
          const from = pressed.getBoundingClientRect();
          // A copy of the card stays where it was, fading out, while the new
          // page opens out from the same spot.
          const copy = pressed.cloneNode(true) as HTMLElement;
          copy.removeAttribute("data-tilt");
          copy.removeAttribute("data-tilting");
          copy.removeAttribute("data-med-card");
          copy.setAttribute("aria-hidden", "true");
          Object.assign(copy.style, {
            position: "fixed",
            left: `${from.left}px`,
            top: `${from.top}px`,
            width: `${from.width}px`,
            height: `${from.height}px`,
            margin: "0",
            zIndex: "40",
            pointerEvents: "none",
            transform: "none",
            transition: "none",
          });
          document.body.appendChild(copy);

          flushSync(commit);
          top.current?.scrollIntoView({ behavior: "auto", block: "start" });

          const open = find("[data-med-header]");
          if (open) {
            const to = open.getBoundingClientRect();
            const inset = (px: number) => `${Math.max(0, px).toFixed(1)}px`;
            const start = `inset(${inset(from.top - to.top)} ${inset(to.right - from.right)} ${inset(to.bottom - from.bottom)} ${inset(from.left - to.left)} round 8px)`;
            open.animate(
              [{ clipPath: start }, { clipPath: "inset(0px round 6px)" }],
              { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
            );
          }
          copy
            .animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 240,
              easing: "ease-out",
              fill: "forwards",
            })
            .finished.finally(() => copy.remove());
          return;
        }
      }

      // A category card <-> the category's tag, as a view transition.
      const doc = document as Document & {
        startViewTransition?: (update: () => void) => {
          finished: Promise<void>;
        };
      };
      const group = (name: string) =>
        `[data-group-card="${name.replace(/(["\\])/g, "\\$1")}"]`;
      let before: string | null = null;
      let after: string | null = null;
      if (!next.med && !here.med) {
        if (next.group && !here.group) {
          before = group(next.group);
          after = "[data-group-tag]";
        } else if (here.group && !next.group) {
          before = "[data-group-tag]";
          after = group(here.group);
        }
      }
      if (!animate || !doc.startViewTransition || calm() || !before) {
        commit();
        return;
      }

      const name = (el: HTMLElement | null, on: boolean) =>
        on
          ? el?.style.setProperty("view-transition-name", "med-open")
          : el?.style.removeProperty("view-transition-name");

      const from = find(before);
      name(from, true);
      document.documentElement.classList.add("vt-active");
      let to: HTMLElement | null = null;
      const transition = doc.startViewTransition(() => {
        name(from, false);
        flushSync(commit);
        // Start the new page at the top at once, so the thing it grows into is
        // where the motion is aimed.
        top.current?.scrollIntoView({ behavior: "auto", block: "start" });
        to = find(after);
        name(to, true);
      });
      transition.finished.finally(() => {
        document.documentElement.classList.remove("vt-active");
        name(to, false);
      });
    },
    [guide],
  );

  // Each step down or back up starts at the top of the page, not wherever
  // the previous list was scrolled to.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    top.current?.scrollIntoView({
      behavior: calm() ? "auto" : "smooth",
      block: "start",
    });
  }, [route.group, route.med]);

  const group = useMemo(
    () => guide?.groups.find((entry) => entry.name === route.group) ?? null,
    [guide, route.group],
  );
  const groupIndex = guide && group ? guide.groups.indexOf(group) : -1;
  const med = useMemo(
    () => guide?.medications.find((entry) => entry.id === route.med) ?? null,
    [guide, route.med],
  );
  const inGroup = useMemo(
    () =>
      guide && group
        ? guide.medications.filter((entry) => entry.group === group.name)
        : [],
    [guide, group],
  );

  const matches = useMemo(
    () => (guide ? search(group ? inGroup : guide.medications, query) : []),
    [guide, group, inGroup, query],
  );
  const matchedGroups = useMemo(
    () => (guide ? searchGroups(guide.groups, query) : []),
    [guide, query],
  );

  const accentFor = (name: string) =>
    accentOf(
      Math.max(0, guide?.groups.findIndex((entry) => entry.name === name) ?? 0),
    );

  const openMed = (id: string) => {
    const target = guide?.medications.find((entry) => entry.id === id);
    if (!target) return;
    go({ group: target.group, med: id }, true, () => setQuery(""));
  };
  const openGroup = (name: string) => {
    go({ group: name, med: null }, true, () => setQuery(""));
  };
  const openRoot = () => {
    go(ROOT, true, () => setQuery(""));
  };

  // Saved ids can outlive an edit to the guide, so only keep real ones.
  const pickedMeds = useMemo(
    () =>
      guide
        ? picked.flatMap((id) => {
            const found = guide.medications.find((entry) => entry.id === id);
            return found ? [found] : [];
          })
        : [],
    [guide, picked],
  );
  const togglePicked = (id: string) =>
    setPicked((prev) =>
      prev.includes(id)
        ? prev.filter((entry) => entry !== id)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, id],
    );
  const clearPicked = () => setPicked([]);
  const openCompare = () => {
    setQuery("");
    go(COMPARE);
  };
  const openPatient = () => setLabsOpen(true);
  // Done with the labs window: go to the comparison, where the patient's
  // readings sit beside the medications picked.
  const closePatient = () => {
    setLabsOpen(false);
    if (!route.compare) {
      setQuery("");
      go(COMPARE);
    }
  };
  const openStudy = () => {
    setQuery("");
    go(STUDY);
  };

  const searching = query.trim().length > 0;
  const view = route.compare
    ? "compare"
    : route.study
      ? "study"
      : med
        ? `med:${med.id}`
        : group
          ? `group:${group.name}`
          : "root";

  const crumbs: { label: string; onClick?: () => void }[] = [
    {
      label: "Drug guide",
      onClick:
        group || med || route.compare || route.study ? openRoot : undefined,
    },
  ];
  if (route.compare) crumbs.push({ label: "Interaction check" });
  if (route.study) crumbs.push({ label: "Flashcards" });
  if (group) {
    crumbs.push({
      label: group.name,
      onClick: med ? () => openGroup(group.name) : undefined,
    });
  }
  if (med) crumbs.push({ label: med.generic });

  const neighbours = {
    prev: med
      ? (inGroup[inGroup.findIndex((entry) => entry.id === med.id) - 1] ?? null)
      : null,
    next: med
      ? (inGroup[inGroup.findIndex((entry) => entry.id === med.id) + 1] ?? null)
      : null,
  };

  return (
    // A full-height column, so the footer card sits against the bottom edge of
    // the page even when there is little above it.
    <div className="flex min-h-screen flex-col">
      {/* A sibling of the section, not a child: see Nclex.tsx for why a
          `fixed` layer can't live inside an element that animates in. */}
      <div className="pointer-events-none fixed inset-y-0 left-20 right-0 -z-[5] overflow-hidden lg:left-0">
        <Shapes />
      </div>

      <section className="relative mx-auto w-full max-w-[1080px] flex-1 animate-fadeIn px-10 pb-12 pt-28 lg:pt-12 md:px-6">
        <div ref={top} className="relative z-10 scroll-mt-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 lg:justify-center">
            <h1 className="ml-3.5 text-4xl font-bold lg:ml-0 lg:text-center">
              <TypedText text="Agave's Lab" typeOnMount />
            </h1>
            {guide && !route.compare && !route.study && (
              <div className="flex flex-wrap items-center gap-2 lg:justify-center">
                {FLASHCARDS && (
                  <button
                    type="button"
                    onClick={openStudy}
                    className="inline-flex items-center gap-x-2 rounded-md border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-5 py-2.5 text-sm font-bold text-[var(--title-color)] duration-300 hover:border-[var(--chip-blue-border)] hover:shadow-lg"
                  >
                    <PiStack
                      aria-hidden
                      className="text-[var(--chip-blue-border)]"
                    />
                    Flashcards
                  </button>
                )}
                <button
                  type="button"
                  onClick={openDaily}
                  aria-label="Medication of the day"
                  title="Medication of the day"
                  className="inline-flex items-center gap-x-2 rounded-md border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-5 py-2.5 text-sm font-bold text-[var(--title-color)] duration-300 hover:border-[var(--chip-blue-border)] hover:shadow-lg"
                >
                  <PiCalendarBlank
                    aria-hidden
                    className="text-[var(--chip-blue-border)]"
                  />
                  MOD
                </button>
                <button
                  type="button"
                  onClick={openCompare}
                  className="inline-flex items-center gap-x-2 rounded-md border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-5 py-2.5 text-sm font-bold text-[var(--title-color)] duration-300 hover:border-[var(--chip-blue-border)] hover:shadow-lg"
                >
                  <PiGraph
                    aria-hidden
                    className="text-[var(--chip-blue-border)]"
                  />
                  Interaction check
                  {pickedMeds.length > 0 && (
                    <span className="rounded-md bg-[var(--primary-color)] px-2 py-0.5 text-xs leading-none text-[var(--on-primary)]">
                      {pickedMeds.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestOpen(true)}
                  aria-label="Suggest a medication"
                  className="inline-flex items-center gap-x-2 rounded-md border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-5 py-2.5 text-sm font-bold text-[var(--title-color)] duration-300 hover:border-[var(--chip-blue-border)] hover:shadow-lg"
                >
                  <PiChatCircleText
                    aria-hidden
                    className="text-[var(--chip-blue-border)]"
                  />
                  Suggest
                </button>
              </div>
            )}
          </div>
          <p className="mb-3 ml-3.5 text-[var(--text-color)] lg:ml-0 lg:text-center">
            {guide
              ? `${guide.stats.medications} drugs in ${guide.stats.groups} categories, and the one reason to reach for each.`
              : " "}
          </p>

          {failed && (
            <Empty>
              The medication list couldn&apos;t be loaded. Refresh to try again.
            </Empty>
          )}

          {!guide && !failed && <Empty>Loading medications…</Empty>}

          {guide && (
            <>
              {crumbs.length > 1 && (
                <nav
                  aria-label="Where you are"
                  className="mb-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm lg:justify-center"
                >
                  {crumbs.map((crumb, index) => (
                    <Fragment key={crumb.label}>
                      {index > 0 && (
                        <PiCaretRightBold
                          aria-hidden
                          className="text-[var(--muted-color)]"
                        />
                      )}
                      {crumb.onClick ? (
                        <button
                          type="button"
                          onClick={crumb.onClick}
                          className="rounded-lg px-2 py-1 font-bold text-[var(--chip-blue-border)] duration-300 hover:bg-[var(--chip-blue-soft)]"
                        >
                          {crumb.label}
                        </button>
                      ) : (
                        <span
                          aria-current="page"
                          className="px-2 py-1 font-bold text-[var(--title-color)]"
                        >
                          {crumb.label}
                        </span>
                      )}
                    </Fragment>
                  ))}
                </nav>
              )}

              {!med && !route.compare && !route.study && (
                <div className="relative mb-4">
                  <PiMagnifyingGlass
                    aria-hidden
                    className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-color)]"
                  />
                  <input
                    type="text"
                    inputMode="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={
                      group
                        ? `Search ${group.name}…`
                        : "Search drugs, brands, classes…"
                    }
                    aria-label={
                      group ? `Search ${group.name}` : "Search medications"
                    }
                    autoComplete="off"
                    spellCheck={false}
                    className="h-12 w-full rounded-md border border-solid border-[var(--border-color)] bg-[var(--container-color)] pl-12 pr-12 text-base text-[var(--title-color)] outline-none duration-300 placeholder:text-[var(--muted-color)] focus:border-[var(--chip-blue-border)]"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted-color)] duration-300 hover:bg-[var(--body-color)] hover:text-[var(--title-color)]"
                    >
                      <PiXBold />
                    </button>
                  )}
                </div>
              )}

              <Swap token={`${view}:${searching ? "q" : "all"}`}>
                {route.study ? (
                  <Study guide={guide} accentFor={accentFor} />
                ) : route.compare ? (
                  <>
                    <PatientBar
                      file={patient.file}
                      labs={labs}
                      onEdit={openPatient}
                      onClear={() => setLabs({})}
                    />
                    <CompareMap
                      meds={pickedMeds}
                      onRemove={togglePicked}
                      onClear={clearPicked}
                      onOpen={openMed}
                      between={
                        patient.file && patient.index ? (
                          <PatientReadings
                            file={patient.file}
                            index={patient.index}
                            labs={labs}
                            meds={pickedMeds}
                            names={
                              new Map(
                                guide.medications.map((entry) => [
                                  entry.id,
                                  shortName(entry),
                                ]),
                              )
                            }
                            onOpen={openMed}
                          />
                        ) : null
                      }
                    />
                    {Object.keys(labs).length > 0 && <PatientDisclaimer />}
                  </>
                ) : med ? (
                  <MedDetail
                    med={med}
                    neighbours={neighbours}
                    onOpen={openMed}
                    onBack={() => openGroup(med.group)}
                    picked={picked.includes(med.id)}
                    pickedFull={
                      !picked.includes(med.id) && picked.length >= MAX_COMPARE
                    }
                    onPick={() => togglePicked(med.id)}
                    accent={accentFor(med.group)}
                  />
                ) : group ? (
                  <div className="flex flex-col gap-y-4">
                    <div className="flex">
                      <GroupTag
                        group={group}
                        index={groupIndex}
                        onClear={openRoot}
                      />
                    </div>
                    {matches.length === 0 ? (
                      <Empty>
                        No medication in {group.name} matches &ldquo;{query}
                        &rdquo;.
                      </Empty>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
                        {matches.map((entry, position) => (
                          <MedRow
                            key={entry.id}
                            med={entry}
                            query={query}
                            delay={Math.min(position, 10) * 0.07}
                            showGroup={false}
                            accent={accentOf(groupIndex)}
                            picked={picked.includes(entry.id)}
                            pickedFull={
                              !picked.includes(entry.id) &&
                              picked.length >= MAX_COMPARE
                            }
                            onPick={() => togglePicked(entry.id)}
                            onOpen={openMed}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : searching ? (
                  <div className="grid gap-y-6">
                    {matchedGroups.length > 0 && (
                      <div>
                        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                          Categories
                        </h2>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
                          {matchedGroups.map((entry) => (
                            <GroupCard
                              key={entry.name}
                              group={entry}
                              index={guide.groups.indexOf(entry)}
                              query={query}
                              selected={false}
                              onPick={() => openGroup(entry.name)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                        Medications ({matches.length})
                      </h2>
                      {matches.length === 0 ? (
                        <Empty>
                          No medication matches &ldquo;{query}&rdquo;. Try a
                          brand name, a class like &ldquo;beta blocker&rdquo;,
                          or what it&apos;s used for.
                        </Empty>
                      ) : (
                        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
                          {matches.map((entry, position) => (
                            <MedRow
                              key={entry.id}
                              med={entry}
                              query={query}
                              delay={Math.min(position, 10) * 0.07}
                              showGroup
                              accent={accentFor(entry.group)}
                              picked={picked.includes(entry.id)}
                              pickedFull={
                                !picked.includes(entry.id) &&
                                picked.length >= MAX_COMPARE
                              }
                              onPick={() => togglePicked(entry.id)}
                              onOpen={openMed}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
                    {guide.groups.map((entry, index) => (
                      <GroupCard
                        key={entry.name}
                        group={entry}
                        index={index}
                        query=""
                        selected={false}
                        onPick={() => openGroup(entry.name)}
                      />
                    ))}
                  </div>
                )}
              </Swap>
            </>
          )}
        </div>
      </section>

      {guide && (
        <SourcesNote
          clearTray={pickedMeds.length > 0 && !route.compare && !route.study}
        />
      )}

      {daily && (
        <MedOfTheDay
          med={daily.med}
          date={daily.date}
          accent={accentFor(daily.med.group)}
          onOpen={() => {
            const id = daily.med.id;
            closeDaily();
            openMed(id);
          }}
          onClose={closeDaily}
        />
      )}

      {suggestOpen && <SuggestModal onClose={() => setSuggestOpen(false)} />}

      {labsOpen && (
        <PatientModal
          file={patient.file}
          failed={patient.failed}
          labs={labs}
          setLabs={setLabs}
          onDone={closePatient}
        />
      )}

      {guide && pickedMeds.length > 0 && !route.compare && !route.study && (
        <Tray
          meds={pickedMeds}
          onRemove={togglePicked}
          onClear={clearPicked}
          onOpen={openCompare}
        />
      )}
    </div>
  );
};

export default Medications;
