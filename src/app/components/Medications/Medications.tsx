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
  LuChevronRight,
  LuLayers,
  LuNetwork,
  LuSearch,
  LuX,
} from "react-icons/lu";
import { useSaved } from "../DosageCalculations/Saved";
import Shapes from "../Home/Shapes";
import { flameHueAt } from "../Nclex/FlamePalette";
import Swap from "../Nclex/Swap";
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
} from "./Data";
import { Headline } from "./Emphasis";
import MedDetail from "./MedDetail";
import Study from "./Study";
import { GroupType, MedFile, MedType } from "./types";

const calm = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Wraps the part of `text` that matches what was typed.
const Marked = ({ text, query }: { text: string; query: string }) => {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const at = text.toLowerCase().indexOf(q.toLowerCase());
  if (at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded bg-[hsla(43,100%,55%,0.35)] px-0.5 text-inherit">
        {text.slice(at, at + q.length)}
      </mark>
      {text.slice(at + q.length)}
    </>
  );
};

const accentOf = (index: number) => `hsl(${flameHueAt(index)}, 75%, 60%)`;

const Badges = ({ med }: { med: MedType }) => (
  <>
    {med.high_alert && (
      <span className="rounded-full bg-[var(--chip-amber)] px-2.5 py-0.5 text-[11px] font-bold text-[hsl(38,100%,60%)] [:root[data-theme=light]_&]:text-[hsl(30,90%,28%)]">
        High alert
      </span>
    )}
    {med.black_box.length > 0 && (
      <span className="rounded-full bg-[hsla(353,100%,68%,0.16)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--primary-color)]">
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
}: {
  med: MedType;
  query: string;
  showGroup: boolean;
  accent: string;
  delay: number;
  onOpen: (id: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onOpen(med.id)}
    className="group flex w-full items-start gap-x-4 rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-5 py-4 text-left duration-300 hover:border-[var(--chip-blue-border)] hover:shadow-lg sm:px-4"
  >
    <span
      aria-hidden
      className="w-1.5 shrink-0 self-stretch rounded-full"
      style={{ background: accent }}
    />
    <span className="min-w-0 flex-1">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-lg font-bold text-[var(--title-color)]">
          <Marked text={med.generic} query={query} />
        </span>
        <Badges med={med} />
      </span>
      <span className="block text-sm text-[var(--muted-color)]">
        <Marked text={med.brand.join(", ")} query={query} />
      </span>
      {showGroup && (
        <span className="mt-0.5 block text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
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
    <LuChevronRight
      aria-hidden
      className="shrink-0 self-center text-[var(--muted-color)] duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--title-color)]"
    />
  </button>
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
    className={`flex items-center gap-x-4 rounded-2xl border-2 border-solid px-5 py-4 text-left duration-300 ${
      selected
        ? "border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)] shadow-lg"
        : "border-[var(--border-color)] bg-[var(--container-color)] hover:border-[var(--chip-blue-border)] hover:shadow-lg"
    }`}
  >
    <span
      aria-hidden
      className="w-1.5 shrink-0 self-stretch rounded-full"
      style={{ background: accentOf(index) }}
    />
    <span className="min-w-0 flex-1">
      <span className="block text-lg font-bold leading-tight text-[var(--title-color)]">
        <Marked text={group.name} query={query} />
      </span>
      <span className="text-sm text-[var(--muted-color)]">
        {group.count} {group.count === 1 ? "medication" : "medications"}
      </span>
    </span>
    {selected ? (
      <LuX aria-hidden className="shrink-0 text-[var(--muted-color)]" />
    ) : (
      <LuChevronRight
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
    aria-label={`${group.name} selected. Show all categories`}
    title="Show all categories"
    className="group inline-flex max-w-full items-center gap-x-3 rounded-full border-2 border-solid border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)] py-2 pl-5 pr-2.5 shadow-lg duration-300 hover:bg-[var(--chip-blue)]"
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
      <LuX aria-hidden size={16} />
    </span>
  </button>
);

const Empty = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl bg-[var(--body-color)] p-7 text-center text-[var(--muted-color)]">
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
      className="pointer-events-auto flex max-h-[40dvh] w-full max-w-[52rem] animate-fadeIn flex-wrap items-center gap-2 overflow-y-auto rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-3 shadow-2xl"
    >
      <span className="mr-1 flex items-center gap-x-2 text-sm font-bold text-[var(--title-color)]">
        <LuNetwork aria-hidden className="text-[var(--chip-blue-border)]" />
        {meds.length}/{MAX_COMPARE}
      </span>
      {meds.map((med) => (
        <span
          key={med.id}
          className="inline-flex items-center gap-x-1 rounded-full bg-[var(--chip-blue)] py-1 pl-3.5 pr-1 text-sm font-bold text-[var(--title-color)]"
        >
          {shortName(med)}
          <button
            type="button"
            onClick={() => onRemove(med.id)}
            aria-label={`Remove ${med.generic}`}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted-color)] duration-300 hover:bg-[var(--body-color)] hover:text-[var(--title-color)]"
          >
            <LuX size={14} />
          </button>
        </span>
      ))}
      <span className="ml-auto flex items-center gap-x-3">
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
          className="rounded-[1.875rem] bg-[var(--primary-color)] px-5 py-2.5 text-sm font-bold leading-4 text-white shadow-lg duration-300 hover:animate-pulse disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:animate-none"
        >
          {meds.length < 2 ? "Add one more" : "Check interactions"}
        </button>
      </span>
    </div>
  </div>
);

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

  useEffect(() => {
    let alive = true;
    loadGuide()
      .then((next) => alive && setGuide(next))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
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

  const go = useCallback(
    (next: RouteType) => {
      if (!guide) return;
      const path = pathOf(next);
      if (window.location.pathname.replace(/\/$/, "") !== path) {
        window.history.pushState(null, "", path);
      }
      setRoute(parsePath(path, guide));
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
    setQuery("");
    go({ group: target.group, med: id });
  };
  const openGroup = (name: string) => {
    setQuery("");
    go({ group: name, med: null });
  };
  const openRoot = () => {
    setQuery("");
    go(ROOT);
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
    <>
      {/* A sibling of the section, not a child: see Nclex.tsx for why a
          `fixed` layer can't live inside an element that animates in. */}
      <div className="pointer-events-none fixed inset-y-0 left-20 right-0 z-0 overflow-hidden lg:left-0">
        <Shapes />
      </div>

      <section className="relative mx-auto max-w-[1080px] animate-fadeIn px-10 pb-24 pt-28 lg:pt-12 md:px-6">
        <div ref={top} className="relative z-10 scroll-mt-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 lg:justify-center">
            <h1 className="ml-3.5 text-4xl font-bold lg:ml-0 lg:text-center">
              Drug <em>guide</em>
            </h1>
            {guide && !route.compare && !route.study && (
              <div className="flex flex-wrap items-center gap-2 lg:justify-center">
                {FLASHCARDS && (
                  <button
                    type="button"
                    onClick={openStudy}
                    className="inline-flex items-center gap-x-2 rounded-[1.875rem] border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-5 py-2.5 text-sm font-bold text-[var(--title-color)] duration-300 hover:border-[var(--chip-blue-border)] hover:shadow-lg"
                  >
                    <LuLayers
                      aria-hidden
                      className="text-[var(--chip-blue-border)]"
                    />
                    Flashcards
                  </button>
                )}
                <button
                  type="button"
                  onClick={openCompare}
                  className="inline-flex items-center gap-x-2 rounded-[1.875rem] border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-5 py-2.5 text-sm font-bold text-[var(--title-color)] duration-300 hover:border-[var(--chip-blue-border)] hover:shadow-lg"
                >
                  <LuNetwork
                    aria-hidden
                    className="text-[var(--chip-blue-border)]"
                  />
                  Interaction check
                  {pickedMeds.length > 0 && (
                    <span className="rounded-full bg-[var(--primary-color)] px-2 py-0.5 text-xs leading-none text-white">
                      {pickedMeds.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
          <p className="mb-3 ml-3.5 text-[var(--text-color)] lg:ml-0 lg:text-center">
            {guide
              ? `${guide.stats.medications} medications in ${guide.stats.groups} categories`
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
                        <LuChevronRight
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
                  <LuSearch
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
                    className="h-12 w-full rounded-[1.875rem] border border-solid border-[var(--border-color)] bg-[var(--container-color)] pl-12 pr-12 text-base text-[var(--title-color)] outline-none duration-300 placeholder:text-[var(--muted-color)] focus:border-[var(--chip-blue-border)]"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted-color)] duration-300 hover:bg-[var(--body-color)] hover:text-[var(--title-color)]"
                    >
                      <LuX />
                    </button>
                  )}
                </div>
              )}

              <Swap token={`${view}:${searching ? "q" : "all"}`}>
                {route.study ? (
                  <Study guide={guide} accentFor={accentFor} />
                ) : route.compare ? (
                  <CompareMap
                    meds={pickedMeds}
                    onRemove={togglePicked}
                    onClear={clearPicked}
                    onOpen={openMed}
                  />
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

      {guide && pickedMeds.length > 0 && !route.compare && !route.study && (
        <Tray
          meds={pickedMeds}
          onRemove={togglePicked}
          onClear={clearPicked}
          onOpen={openCompare}
        />
      )}
    </>
  );
};

export default Medications;
