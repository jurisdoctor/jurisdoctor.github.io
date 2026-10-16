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
import {
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
import { GroupType, MedFile, MedType } from "./types";

const calm = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Wraps the part of `text` that matches what was typed.
const Marked = ({ text, query }: { text: string; query: string }) => {
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
  <div className="relative h-full" data-tilt>
    <button
      type="button"
      onClick={() => onOpen(med.id)}
      className="group flex h-full w-full items-start gap-x-4 rounded-xl bg-[var(--container-color)] px-5 py-4 text-left shadow-xl duration-300 hover:shadow-2xl sm:px-4"
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
    className={`flex h-full items-center gap-x-4 rounded-xl px-5 py-4 text-left shadow-xl duration-300 ${
      selected
        ? "bg-[var(--chip-blue-soft)]"
        : "bg-[var(--container-color)] hover:shadow-2xl"
    }`}
  >
    <span
      aria-hidden
      className="w-1.5 shrink-0 self-stretch rounded-sm"
      style={{ background: accentOf(index) }}
    />
    <span className="min-w-0 flex-1">
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

// Narrows a category's medications by what they are for. One at a time:
// pressing the lit one (or "All") lets the rest back in.
const ClassFilter = ({
  classes,
  total,
  picked,
  onPick,
  labelOf,
  accent,
}: {
  classes: [string, number][];
  total: number;
  picked: string | null;
  onPick: (name: string | null) => void;
  labelOf: Record<string, string>;
  accent: string;
}) => {
  const chip =
    "inline-flex items-center gap-x-1.5 rounded-md border border-solid px-3 py-1.5 text-sm font-bold duration-300";
  const lit = {
    borderColor: accent,
    background: `color-mix(in srgb, ${accent} 18%, transparent)`,
  };
  return (
    <div
      role="group"
      aria-label="Filter by type of medication"
      className="flex flex-wrap items-center gap-2"
    >
      <button
        type="button"
        onClick={() => onPick(null)}
        aria-pressed={picked === null}
        style={picked === null ? lit : undefined}
        className={`${chip} text-[var(--title-color)] ${
          picked === null
            ? ""
            : "border-[var(--border-color)] bg-[var(--container-color)] hover:border-[var(--chip-blue-border)]"
        }`}
      >
        All
        <span className="text-xs font-normal text-[var(--muted-color)]">
          {total}
        </span>
      </button>
      {classes.map(([name, count]) => {
        const on = picked === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onPick(on ? null : name)}
            aria-pressed={on}
            style={on ? lit : undefined}
            className={`${chip} ${
              on
                ? "text-[var(--title-color)]"
                : "border-[var(--border-color)] bg-[var(--container-color)] text-[var(--text-color)] hover:border-[var(--chip-blue-border)] hover:text-[var(--title-color)]"
            }`}
          >
            <span>{labelOf[name] ?? name}</span>
            <span className="text-xs font-normal text-[var(--muted-color)]">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const Empty = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl bg-[var(--container-color)] p-7 text-center text-[var(--muted-color)]">
    {children}
  </div>
);

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
        className="pointer-events-none fixed bottom-0 -z-[1] hidden h-20 bg-[var(--container-color)]"
      />
      <div
        ref={card}
        className={`rounded-b-none rounded-t-xl bg-[var(--container-color)] px-6 pt-5 text-center text-sm leading-relaxed text-[var(--muted-color)] shadow-[0_-8px_24px_rgba(0,0,0,0.25)] ${
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

const Medications = () => {
  const [guide, setGuide] = useState<MedFile | null>(null);
  const [failed, setFailed] = useState(false);
  const [route, setRoute] = useState<RouteType>(ROOT);
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useSaved<string[]>(
    "meds:compare:v1",
    freshList,
    validList,
  );
  const top = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const [labs, setLabs] = useLabs();
  const [labsOpen, setLabsOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
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
    const read = () => {
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

  // Moves to another route. `alongside` is anything else that changes with the
  // page (clearing the search), done in the same step.
  const go = useCallback(
    (next: RouteType, alongside?: () => void) => {
      if (!guide) return;
      const path = pathOf(next);
      alongside?.();
      if (window.location.pathname.replace(/\/$/, "") !== path) {
        window.history.pushState(null, "", path);
      }
      setRoute(parsePath(path, guide));
    },
    [guide],
  );

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const box = top.current?.getBoundingClientRect();
    if (box && box.top < 0) {
      top.current?.scrollIntoView({
        behavior: calm() ? "auto" : "smooth",
        block: "start",
      });
    }
  }, [route.group, route.med]);

  const nclexCount = useMemo(
    () => (guide ? guide.medications.filter((entry) => entry.nclex).length : 0),
    [guide],
  );
  const [nclexSaved, setNclexSaved] = useSaved<boolean>(
    "meds:nclex:v1",
    () => false,
    (value) => typeof value === "boolean",
  );
  const nclexOnly = nclexSaved && nclexCount > 0;
  const scope = useMemo(() => {
    if (!guide) return null;
    if (!nclexOnly) {
      return { meds: guide.medications, groups: guide.groups };
    }
    const meds = guide.medications.filter((entry) => entry.nclex);
    const wanted = new Set(meds.map((entry) => entry.id));
    const groups = guide.groups
      .map((entry) => {
        const ids = entry.medication_ids.filter((id) => wanted.has(id));
        return { ...entry, medication_ids: ids, count: ids.length };
      })
      .filter((entry) => entry.count > 0);
    return { meds, groups };
  }, [guide, nclexOnly]);
  const group = useMemo(
    () =>
      scope?.groups.find((entry) => entry.name === route.group) ??
      guide?.groups.find((entry) => entry.name === route.group) ??
      null,
    [scope, guide, route.group],
  );
  const groupIndex =
    guide && group
      ? guide.groups.findIndex((entry) => entry.name === group.name)
      : -1;
  const med = useMemo(
    () => guide?.medications.find((entry) => entry.id === route.med) ?? null,
    [guide, route.med],
  );
  const inGroup = useMemo(
    () =>
      scope && group
        ? scope.meds.filter((entry) => entry.group === group.name)
        : [],
    [scope, group],
  );

  const [classPick, setClassPick] = useState<string | null>(null);
  useEffect(() => setClassPick(null), [route.group]);
  const classes = useMemo(() => {
    const counts = new Map<string, number>();
    inGroup.forEach((entry) =>
      new Set(entry.tags).forEach((tag) =>
        counts.set(tag, (counts.get(tag) ?? 0) + 1),
      ),
    );
    const list = Array.from(counts.entries())
      .filter(([, count]) => count >= 2 && count < inGroup.length)
      .map(([tag, count]): [string, number] => [tag, count])
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return list.length >= 2 ? list : [];
  }, [inGroup]);
  const matches = useMemo(() => {
    const found = scope ? search(group ? inGroup : scope.meds, query) : [];
    return group && classPick
      ? found.filter((entry) => entry.tags.includes(classPick))
      : found;
  }, [scope, group, inGroup, query, classPick]);
  const matchedGroups = useMemo(
    () => (scope ? searchGroups(scope.groups, query) : []),
    [scope, query],
  );

  const accentFor = (name: string) =>
    accentOf(
      Math.max(0, guide?.groups.findIndex((entry) => entry.name === name) ?? 0),
    );

  const openMed = (id: string) => {
    const target = guide?.medications.find((entry) => entry.id === id);
    if (!target) return;
    go({ group: target.group, med: id }, () => setQuery(""));
  };
  const openGroup = (name: string) => {
    go({ group: name, med: null }, () => setQuery(""));
  };
  const openRoot = () => {
    go(ROOT, () => setQuery(""));
  };

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
    <div className="flex min-h-screen flex-col">
      <div className="pointer-events-none fixed inset-y-0 left-20 right-0 -z-[5] overflow-hidden lg:left-0">
        <Shapes />
      </div>

      <section className="relative mx-auto w-full max-w-[1080px] flex-1 animate-fadeIn px-10 pb-12 pt-28 lg:pt-12 md:px-6">
        <div ref={top} className="relative z-10 scroll-mt-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 lg:justify-center">
            <h1 className="ml-3.5 text-4xl font-bold lg:ml-0 lg:text-center">
              <button
                type="button"
                onClick={openRoot}
                aria-label="Agave's Lab, back to all categories"
                className="cursor-pointer rounded-md text-left duration-300 hover:opacity-80 lg:text-center"
              >
                <TypedText text="Agave's Lab" typeOnMount />
              </button>
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
              ? nclexOnly && scope
                ? `${scope.meds.length} NCLEX drugs in ${scope.groups.length} categories, and the one reason to reach for each.`
                : `${guide.stats.medications} drugs in ${guide.stats.groups} categories, and the one reason to reach for each.`
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
                          className="crumb-bounce inline-block px-2 py-1 font-bold text-[var(--title-color)]"
                        >
                          {crumb.label}
                        </span>
                      )}
                    </Fragment>
                  ))}
                </nav>
              )}

              {!med && !route.compare && !route.study && (
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative min-w-0 flex-1">
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
                  {nclexCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setNclexSaved(!nclexOnly)}
                      aria-pressed={nclexOnly}
                      title={`NCLEX: only the ${nclexCount} medications on your course list, as short cards`}
                      className={`inline-flex h-12 shrink-0 items-center rounded-md border border-solid px-6 text-sm font-bold duration-300 ${
                        nclexOnly
                          ? "tile-selected border-[var(--chip-blue-border)] bg-[var(--chip-blue)] text-[var(--title-color)]"
                          : "border-[var(--border-color)] bg-[var(--container-color)] text-[var(--text-color)] hover:border-[var(--chip-blue-border)] hover:text-[var(--title-color)]"
                      }`}
                    >
                      NCLEX
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
                    nclex={nclexOnly}
                  />
                ) : group ? (
                  <div className="flex flex-col gap-y-4">
                    {classes.length > 0 && (
                      <ClassFilter
                        classes={classes}
                        total={inGroup.length}
                        picked={classPick}
                        onPick={setClassPick}
                        labelOf={guide.filters.label_of}
                        accent={accentOf(groupIndex)}
                      />
                    )}
                    {matches.length === 0 ? (
                      <Empty>
                        {query.trim()
                          ? `No medication in ${group.name} matches "${query}"${
                              classPick
                                ? ` among the ${(guide.filters.label_of[classPick] ?? classPick).toLowerCase()} drugs`
                                : ""
                            }.`
                          : `No ${classPick ? (guide.filters.label_of[classPick] ?? classPick).toLowerCase() : "medication"} in ${group.name}.`}
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
                              index={guide.groups.findIndex(
                                (one) => one.name === entry.name,
                              )}
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
                    {(scope?.groups ?? guide.groups).map((entry) => (
                      <GroupCard
                        key={entry.name}
                        group={entry}
                        index={guide.groups.findIndex(
                          (one) => one.name === entry.name,
                        )}
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
