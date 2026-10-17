"use client";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  PiCheckBold,
  PiCaretDownBold,
  PiHeartbeat,
  PiWarningOctagon,
  PiMagnifyingGlass,
  PiWarning,
  PiXBold,
} from "react-icons/pi";
import { useSaved } from "../DosageCalculations/Saved";
import TypedText from "../Typed/TypedText";
import { search } from "./Data";
import {
  COLORS,
  indexOf,
  IndexType,
  keyOf,
  Level,
  loadInteractions,
  shortName,
  toneOf,
} from "./Interactions";
import {
  ActiveType,
  DrugStateType,
  effectiveOf,
  Labs,
  loadPatient,
  PARAM_ORDER,
  PatientFile,
  PairReading,
  readPairs,
  shortLabel,
  VERDICT_LABEL,
  VERDICTS,
  Verdict,
  activeOf,
} from "./PatientLogic";
import { MedFile, MedType } from "./types";

const TONE: Record<Verdict, { color: string; wash: string }> = {
  do_not_give: {
    color: "hsl(348, 83%, 56%)",
    wash: "hsla(348, 83%, 56%, 0.12)",
  },
  caution: { color: "hsl(38, 96%, 54%)", wash: "hsla(38, 96%, 54%, 0.12)" },
  treats_this: {
    color: "hsl(156, 100%, 42%)",
    wash: "hsla(156, 100%, 42%, 0.14)",
  },
};

const ICON: Record<Verdict, ReactNode> = {
  do_not_give: <PiWarningOctagon aria-hidden />,
  caution: <PiWarning aria-hidden />,
  treats_this: <PiCheckBold aria-hidden />,
};

const freshLabs = (): Labs => ({});
const validLabs = (saved: Labs) =>
  !!saved &&
  typeof saved === "object" &&
  !Array.isArray(saved) &&
  Object.values(saved).every((entry) => typeof entry === "string");

const Heading = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
    {children}
  </h2>
);

const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`rounded-2xl bg-[var(--container-color)] p-5 ${className}`}>
    {children}
  </div>
);

// A panel in one verdict's color: the strip down the left edge and the tinted
// wash carry it, so the color is never the only clue (there is an icon and a
// label too).
const Panel = ({
  tone,
  title,
  children,
}: {
  tone: Verdict;
  title?: string;
  children: ReactNode;
}) => (
  <div
    className="rounded-md border-l-4 border-solid p-4 text-left"
    style={{ borderColor: TONE[tone].color, background: TONE[tone].wash }}
  >
    {title && (
      <p
        className="mb-1 flex items-center gap-x-2 text-xs font-bold uppercase tracking-wide"
        style={{ color: TONE[tone].color }}
      >
        {ICON[tone]}
        {title}
      </p>
    )}
    {children}
  </div>
);

const LabSelect = ({
  param,
  file,
  value,
  onChange,
}: {
  param: string;
  file: PatientFile;
  value: string;
  onChange: (next: string) => void;
}) => {
  const info = file.doc.parameters[param];
  const states = file.doc.states.filter((entry) => entry.param === param);
  const current = value.replace(/:base$/, "");
  const chosen = states.find((entry) => entry.id === current);
  if (!info || states.length === 0) return null;

  const range = !info.unit
    ? info.normal
    : /^[\d.]+ to [\d.]+$/.test(info.normal)
      ? `${info.normal} ${info.unit}`
      : `${info.normal} (${info.unit})`;

  return (
    <label className="flex flex-col gap-y-2">
      <span className="text-sm font-bold text-[var(--title-color)]">
        {info.label}
      </span>
      <span className="relative">
        <select
          value={chosen ? current : ""}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full cursor-pointer appearance-none rounded-md border border-solid border-transparent bg-[var(--body-color)] pl-4 pr-10 text-sm font-bold text-[var(--title-color)] outline-none duration-300 focus:border-[var(--chip-blue-border)]"
        >
          <option value="">Normal</option>
          {states.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {shortLabel(entry)}
            </option>
          ))}
        </select>
        <PiCaretDownBold
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-color)]"
        />
      </span>
      <span className="font-mono text-xs leading-snug">
        <TypedText
          segments={[
            {
              text: chosen
                ? chosen.bound
                  ? chosen.bound.charAt(0).toUpperCase() + chosen.bound.slice(1)
                  : chosen.label
                : `Normal: ${range}`,
              className: chosen
                ? `font-bold ${
                    chosen.dir === "high"
                      ? "text-[var(--danger-color)]"
                      : "text-[var(--warning-color)]"
                  }`
                : "text-[var(--muted-color)]",
            },
          ]}
          reserve={[
            `Normal: ${range}`,
            ...states.map((entry) => entry.bound ?? entry.label),
          ]}
        />
      </span>
    </label>
  );
};

interface RowType {
  med: MedType;
  entry: DrugStateType;
  active: ActiveType;
}

const Reading = ({
  row,
  file,
  onOpen,
}: {
  row: RowType;
  file: PatientFile;
  onOpen: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { med, entry, active } = row;
  const now = effectiveOf(entry, active.baseline);
  const tone = TONE[now.verdict];
  const stateLabel =
    file.doc.states.find((s) => s.id === entry.state)?.label ?? entry.state;

  return (
    <li
      className="rounded-md border-l-4 border-solid"
      style={{ borderColor: tone.color, background: tone.wash }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-x-3 p-4 text-left"
      >
        <span
          className="flex h-[1.7rem] shrink-0 items-center text-lg"
          style={{ color: tone.color }}
        >
          {ICON[now.verdict]}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-bold text-[var(--title-color)]">
              {shortName(med)}
            </span>
            <span className="text-xs text-[var(--muted-color)]">
              {stateLabel}
              {now.chronic ? " · baseline" : ""}
            </span>
          </span>
          <span className="mt-0.5 block max-w-[80ch] text-sm text-[var(--text-color)]">
            {now.line}
          </span>
        </span>
        <span className="flex h-[1.7rem] shrink-0 items-center">
          <PiCaretDownBold
            aria-hidden
            className={`text-[var(--muted-color)] duration-300 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="grid gap-y-3 px-4 pb-4 pl-11 text-sm">
          <p className="max-w-[80ch]">{now.why}</p>

          {entry.threshold && entry.source.includes("hold threshold") && (
            <blockquote className="max-w-[80ch] border-l-2 border-solid border-[var(--border-color)] pl-3 italic text-[var(--muted-color)]">
              &ldquo;{entry.threshold.card_text}&rdquo;
            </blockquote>
          )}

          {now.chronic && (
            <div className="rounded-md bg-[var(--body-color)] p-3">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                If this were new instead
              </p>
              <p className="max-w-[80ch]">
                <span
                  className="font-bold"
                  style={{ color: TONE[entry.verdict].color }}
                >
                  {VERDICT_LABEL[entry.verdict]}.{" "}
                </span>
                {entry.line}
              </p>
              <p className="mt-1 max-w-[80ch] text-[var(--muted-color)]">
                {entry.why}
              </p>
            </div>
          )}

          {entry.also && entry.also.length > 0 && (
            <div className="grid gap-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                Also true here
              </p>
              {entry.also.map((extra) => (
                <p key={extra.line} className="max-w-[80ch]">
                  <span
                    className="font-bold"
                    style={{ color: TONE[extra.verdict].color }}
                  >
                    {VERDICT_LABEL[extra.verdict]}.{" "}
                  </span>
                  {extra.line}
                  <span className="mt-0.5 block text-[var(--muted-color)]">
                    {extra.why}
                  </span>
                </p>
              ))}
            </div>
          )}

          <p className="flex flex-wrap items-center gap-x-3 text-xs text-[var(--muted-color)]">
            <span>Source: {entry.source}</span>
            <button
              type="button"
              onClick={() => onOpen(med.id)}
              className="font-bold text-[var(--title-color)] underline decoration-[var(--border-color)] underline-offset-2 hover:decoration-[var(--chip-blue-border)]"
            >
              Open {shortName(med)}
            </button>
          </p>
        </div>
      )}
    </li>
  );
};

const SEVERITY_LABEL: Record<Level, string> = {
  avoid: "Avoid",
  high: "High risk",
  moderate: "Use with care",
};

const SeverityBadge = ({ level }: { level: Level }) => (
  <span
    className="inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
    style={{
      color: COLORS[toneOf(level)],
      background: "var(--body-color)",
      border: `1px solid ${COLORS[toneOf(level)]}`,
    }}
  >
    {SEVERITY_LABEL[level]}
  </span>
);

const PairRow = ({
  pair,
  names,
  index,
  file,
}: {
  pair: PairReading;
  names: Map<string, string>;
  index: IndexType;
  file: PatientFile;
}) => {
  const [open, setOpen] = useState(false);
  const own = index.pairs.get(pair.key);
  const ruleName = (id: string) => index.rules.get(id)?.name ?? id;

  return (
    <li className="rounded-md bg-[var(--body-color)]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-x-3 p-4 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-bold text-[var(--title-color)]">
              {names.get(pair.a) ?? pair.a} + {names.get(pair.b) ?? pair.b}
            </span>
            <SeverityBadge level={pair.severity} />
            {pair.shifted && (
              <span className="text-xs text-[var(--muted-color)]">
                {SEVERITY_LABEL[pair.normally].toLowerCase()} →{" "}
                {SEVERITY_LABEL[pair.severity].toLowerCase()} in this patient
              </span>
            )}
          </span>
          {pair.heldNote && (
            <span className="mt-2 block">
              <Panel tone="do_not_give" title="Already a hold">
                <span className="block max-w-[80ch] text-sm">
                  {pair.heldNote}
                </span>
              </Panel>
            </span>
          )}
        </span>
        <span className="flex h-[1.7rem] shrink-0 items-center">
          <PiCaretDownBold
            aria-hidden
            className={`text-[var(--muted-color)] duration-300 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="grid gap-y-3 px-4 pb-4 text-sm">
          {Array.from(
            new Set([
              ...pair.entries.map(({ item }) => item.rule),
              ...(own?.rules.map((rule) => rule.rule) ?? []),
            ]),
          ).flatMap((id) => {
            const brief = index.rules.get(id)?.brief;
            return brief
              ? [
                  <p key={`do-${id}`} className="max-w-[80ch]">
                    <span className="mr-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--primary-color)]">
                      Do
                    </span>
                    <span className="text-[var(--title-color)]">
                      {brief.do}
                    </span>
                    <span className="block text-[var(--muted-color)]">
                      <span className="mr-1.5 text-[11px] font-bold uppercase tracking-wide">
                        Watch
                      </span>
                      {brief.watch}
                    </span>
                  </p>,
                ]
              : [];
          })}
          {pair.entries.map(({ state, item }) => (
            <p key={`${state.id}-${item.rule}`} className="max-w-[80ch]">
              <span className="font-bold text-[var(--title-color)]">
                {state.label}
                {item.direct ? "" : " (indirect)"} · {ruleName(item.rule)}.{" "}
              </span>
              {item.why}
            </p>
          ))}
          {own && (
            <div className="grid gap-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                Normally
              </p>
              {own.rules.map((rule) => (
                <p key={rule.rule} className="max-w-[80ch]">
                  <span className="font-bold text-[var(--title-color)]">
                    {ruleName(rule.rule)}.{" "}
                  </span>
                  {rule.why}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
};

// The test patient's data (about 900 KB) and the interaction file are only
// fetched once something needs them: the labs window opening, or the
// interaction check being on screen.
export const usePatient = (enabled: boolean) => {
  const [file, setFile] = useState<PatientFile | null>(null);
  const [index, setIndex] = useState<IndexType | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled || (file && index)) return;
    let alive = true;
    Promise.all([loadPatient(), loadInteractions()])
      .then(([next, inter]) => {
        if (!alive) return;
        setFile(next);
        setIndex(indexOf(inter));
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [enabled, file, index]);

  return { file, index, failed };
};

export const useLabs = () =>
  useSaved<Labs>("meds:patient:labs:v1", freshLabs, validLabs);

// Labs and vitals, in a window over whatever page the learner is on.
// Portaled to <body>: the page sections animate in and keep a transform, which
// would otherwise make a "fixed" window size itself to the section.
export const PatientModal = ({
  file,
  failed,
  labs,
  setLabs,
  onDone,
}: {
  file: PatientFile | null;
  failed: boolean;
  labs: Labs;
  setLabs: (next: Labs | ((prev: Labs) => Labs)) => void;
  onDone: () => void;
}) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDone();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onDone]);

  const active = file ? activeOf(labs, file.doc) : [];
  const set = (param: string, choice: string) =>
    setLabs((prev) => {
      const next = { ...prev };
      if (choice) next[param] = choice;
      else delete next[param];
      return next;
    });

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-[rgba(0,0,0,0.6)] px-4 py-6"
      onClick={onDone}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Test patient: labs and vitals"
        onClick={(event) => event.stopPropagation()}
        className="m-auto w-full max-w-[56rem] animate-fadeIn rounded-2xl bg-[var(--container-color)] p-6 shadow-2xl md:p-4"
      >
        <div className="mb-4 flex items-start justify-between gap-x-4">
          <div>
            <h2 className="text-2xl font-bold">Test patient</h2>
            <p className="mt-1 text-sm text-[var(--muted-color)]">
              Labs and vitals
            </p>
          </div>
          <button
            type="button"
            onClick={onDone}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--muted-color)] duration-300 hover:bg-[var(--body-color)] hover:text-[var(--title-color)]"
          >
            <PiXBold />
          </button>
        </div>

        {failed ? (
          <p className="py-6 text-center text-[var(--muted-color)]">
            The test patient didn&apos;t load. Close this and try again.
          </p>
        ) : !file ? (
          <p className="py-6 text-center text-[var(--muted-color)]">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-3 items-start gap-x-6 gap-y-6 lg:grid-cols-2 sm:grid-cols-1">
              {PARAM_ORDER.map((param) => (
                <LabSelect
                  key={param}
                  param={param}
                  file={file}
                  value={labs[param] ?? ""}
                  onChange={(next) => set(param, next)}
                />
              ))}
            </div>
          </>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onDone}
            className="inline-block rounded-md border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-[var(--on-primary)] shadow-lg"
          >
            Compare medications
          </button>
          {active.length > 0 && (
            <button
              type="button"
              onClick={() => setLabs({})}
              className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)] duration-300 hover:text-[var(--primary-color)]"
            >
              Reset labs
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

// What the test patient currently is, with a way to change it.
export const PatientBar = ({
  file,
  labs,
  onEdit,
  onClear,
}: {
  file: PatientFile | null;
  labs: Labs;
  onEdit: () => void;
  onClear: () => void;
}) => {
  const active = file ? activeOf(labs, file.doc) : [];
  const pending = !file && Object.keys(labs).length > 0;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-[var(--container-color)] p-4">
      <span className="flex items-center gap-x-2 text-sm font-bold text-[var(--title-color)]">
        <PiHeartbeat aria-hidden className="text-[var(--chip-blue-border)]" />
        Test patient
      </span>
      {active.length === 0 ? (
        <span className="text-sm text-[var(--muted-color)]">
          {pending ? "Loading…" : "Labs and vitals all normal."}
        </span>
      ) : (
        active.map(({ state, baseline }) => (
          <span
            key={state.id}
            className="inline-flex items-center gap-x-2 rounded-md bg-[var(--chip-blue)] px-3 py-1 text-sm font-bold text-[var(--title-color)]"
          >
            {state.label}
            <span className="font-mono text-xs font-normal text-[var(--text-color)]">
              {state.bound
                ? state.bound.charAt(0).toUpperCase() + state.bound.slice(1)
                : ""}
              {baseline ? " · baseline" : ""}
            </span>
          </span>
        ))
      )}
      <span className="ml-auto flex items-center gap-x-4">
        {active.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)] duration-300 hover:text-[var(--primary-color)]"
          >
            Reset
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-x-2 rounded-md border border-solid border-transparent bg-[var(--body-color)] px-4 py-2 text-sm font-bold text-[var(--title-color)] duration-300 hover:border-[var(--chip-blue-border)]"
        >
          {active.length > 0 ? "Edit labs" : "Set labs"}
        </button>
      </span>
    </div>
  );
};

// For the medications being compared: each one's reading under the labs that
// are set (grouped by verdict), then each pair among them as this patient
// would have it. Pairs and drugs outside the list never appear here.
export const PatientReadings = ({
  file,
  index,
  labs,
  meds,
  names,
  onOpen,
}: {
  file: PatientFile;
  index: IndexType;
  labs: Labs;
  meds: MedType[];
  names: Map<string, string>;
  onOpen: (id: string) => void;
}) => {
  const { doc } = file;
  const active = useMemo(() => activeOf(labs, doc), [labs, doc]);

  const rows = useMemo(
    () =>
      meds.flatMap((med) =>
        (file.meds[med.id] ?? []).flatMap((entry) => {
          const on = active.find((item) => item.state.id === entry.state);
          return on ? [{ med, entry, active: on }] : [];
        }),
      ),
    [file, meds, active],
  );

  const grouped = useMemo(() => {
    const out: Record<Verdict, RowType[]> = {
      do_not_give: [],
      caution: [],
      treats_this: [],
    };
    rows.forEach((row) =>
      out[effectiveOf(row.entry, row.active.baseline).verdict].push(row),
    );
    return out;
  }, [rows]);

  const pairs = useMemo(
    () =>
      readPairs(
        meds.map((med) => med.id),
        (a, b) => index.pairs.get(keyOf(a, b))?.severity ?? null,
        file,
        active,
      ),
    [file, index, meds, active],
  );

  if (active.length === 0 || meds.length === 0) return null;

  return (
    <div className="grid gap-y-8">
      <section className="rounded-2xl bg-[var(--container-color)] p-5 sm:p-4">
        <Heading>This patient&apos;s medications</Heading>
        {rows.length === 0 ? (
          <p className="text-[var(--muted-color)]">
            None of these medications has a reading for the states set.
          </p>
        ) : (
          <div className="grid gap-y-6">
            {VERDICTS.filter((verdict) => grouped[verdict].length > 0).map(
              (verdict) => (
                <div key={verdict}>
                  <p
                    className="mb-2 flex items-center gap-x-2 text-sm font-bold"
                    style={{ color: TONE[verdict].color }}
                  >
                    {ICON[verdict]}
                    {VERDICT_LABEL[verdict]}
                    <span className="rounded-md bg-[var(--body-color)] px-2 py-0.5 text-xs leading-none text-[var(--text-color)]">
                      {grouped[verdict].length}
                    </span>
                  </p>
                  <p className="mb-2 max-w-[80ch] text-xs text-[var(--muted-color)]">
                    {doc.verdict_key[verdict]}
                  </p>
                  <ul className="grid gap-y-2">
                    {grouped[verdict].map((row) => (
                      <Reading
                        key={`${row.med.id}-${row.entry.state}-${row.active.baseline}`}
                        row={row}
                        file={file}
                        onOpen={onOpen}
                      />
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {meds.length > 1 && pairs.length > 0 && (
        <section className="rounded-2xl bg-[var(--container-color)] p-5 sm:p-4">
          <Heading>Interactions, as this patient would have them</Heading>
          <ul className="grid gap-y-2">
            {pairs.map((pair) => (
              <PairRow
                key={`${pair.key}-${active.map((item) => item.state.id).join(",")}`}
                pair={pair}
                names={names}
                index={index}
                file={file}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

// Under everything else on the interaction check, whenever labs are set.
export const PatientDisclaimer = () => (
  <p className="mt-8 max-w-[80ch] text-xs italic text-[var(--muted-color)]">
    These are teaching scenarios. Please refer to Lexicomp and Davis&apos; Drug
    Guide for further information.
  </p>
);
