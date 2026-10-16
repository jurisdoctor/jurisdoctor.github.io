import { keyOf, Level } from "./Interactions";

export type Verdict = "do_not_give" | "caution" | "treats_this";

export interface ParamType {
  label: string;
  unit: string;
  normal: string;
}

export interface StateType {
  id: string;
  label: string;
  param: string;
  dir: string;
  bound?: string | null;
}

export interface BaselineType {
  possible: boolean;
  warning: string;
  changes?: string;
}

export interface SpotlightType {
  rule: string;
  why: string;
  direct: boolean;
}

export interface PatientDoc {
  note: string;
  how_it_works: string;
  not_a_calculator: string;
  baseline_note: string;
  verdict_key: Record<Verdict, string>;
  held_note: { both: string; one: string; how?: string };
  parameters: Record<string, ParamType>;
  states: StateType[];
  baseline: Record<string, BaselineType>;
  rule_spotlight: Record<string, SpotlightType[]>;
}

export interface ReadingType {
  verdict: Verdict;
  line: string;
  why: string;
}

export interface DrugStateType extends ReadingType {
  state: string;
  source: string;
  threshold?: { value: number; comparator: string; card_text: string };
  baseline?: ReadingType;
  also?: ReadingType[];
}

export interface InPatientType {
  rule: string;
  severity_here: Level;
  normally: Level;
  direct: boolean;
  why: string;
  held_acute?: string[];
}

export interface PatientFile {
  doc: PatientDoc;
  meds: Record<string, DrugStateType[]>;
  pairs: Record<string, Record<string, InPatientType[]>>;
}

// Loaded only when the Test Patient page opens (about 900 KB).
export const loadPatient = (): Promise<PatientFile> =>
  import("./patient.json").then((mod) => mod.default as unknown as PatientFile);

export type Labs = Record<string, string>;

export const PARAM_ORDER = [
  "sodium",
  "potassium",
  "calcium",
  "magnesium",
  "glucose",
  "osmolarity",
  "bp",
  "hr",
  "renal",
  "liver",
  "qt",
];

const BASE = ":base";

export const isBaselineChoice = (choice: string) => choice.endsWith(BASE);
export const baselineChoice = (id: string) => `${id}${BASE}`;
export const stateIdOf = (choice: string) =>
  isBaselineChoice(choice) ? choice.slice(0, -BASE.length) : choice;

// "Low" / "High", except the two states that are not a direction.
export const shortLabel = (state: StateType) =>
  state.id === "renal_impairment" || state.id === "liver_impairment"
    ? "Impaired"
    : state.id === "qt_long"
      ? "Prolonged"
      : state.dir.charAt(0).toUpperCase() + state.dir.slice(1);

export interface ActiveType {
  state: StateType;
  baseline: boolean;
}

// The states switched on, in parameter order. Anything saved that no longer
// names a real state is ignored.
export const activeOf = (labs: Labs, doc: PatientDoc): ActiveType[] =>
  PARAM_ORDER.flatMap((param) => {
    const choice = labs[param];
    if (!choice) return [];
    const state = doc.states.find(
      (entry) => entry.id === stateIdOf(choice) && entry.param === param,
    );
    return state ? [{ state, baseline: false }] : [];
  });

export interface EffectiveType extends ReadingType {
  chronic: boolean;
}

export const effectiveOf = (
  entry: DrugStateType,
  baseline: boolean,
): EffectiveType =>
  baseline && entry.baseline
    ? { ...entry.baseline, chronic: true }
    : {
        verdict: entry.verdict,
        line: entry.line,
        why: entry.why,
        chronic: false,
      };

export const VERDICTS: Verdict[] = ["do_not_give", "caution", "treats_this"];

export const VERDICT_LABEL: Record<Verdict, string> = {
  do_not_give: "Do not give",
  caution: "Caution",
  treats_this: "Treats this",
};

const SEVERITY_RANK: Record<Level, number> = { avoid: 0, high: 1, moderate: 2 };

export interface PairReading {
  key: string;
  a: string;
  b: string;
  severity: Level;
  normally: Level;
  shifted: boolean;
  direct: boolean;
  heldNote: string | null;
  entries: { state: StateType; item: InPatientType }[];
}

// Pairs inside the medication list only, read through the active states.
// Whether a drug is a hold in a state by its own verdict. The data says to
// compose the "already a hold" note from each drug's own verdict, after any
// baseline reading is applied, rather than trusting a stored list: here that
// is the plain verdict, as baselines are not offered.
const heldIn = (file: PatientFile, drug: string, state: string) =>
  (file.meds[drug] ?? []).some(
    (entry) => entry.state === state && entry.verdict === "do_not_give",
  );

// "Both" beats "one"; none gives no note.
const heldNoteOf = (
  a: string,
  b: string,
  entries: { state: StateType }[],
  file: PatientFile,
): string | null => {
  let held = 0;
  entries.forEach(({ state }) => {
    held = Math.max(
      held,
      Number(heldIn(file, a, state.id)) + Number(heldIn(file, b, state.id)),
    );
  });
  return held === 2
    ? file.doc.held_note.both
    : held === 1
      ? file.doc.held_note.one
      : null;
};

export const readPairs = (
  ids: string[],
  pairOwn: (a: string, b: string) => Level | null,
  file: PatientFile,
  active: ActiveType[],
): PairReading[] => {
  const out: PairReading[] = [];
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const normally = pairOwn(ids[i], ids[j]);
      if (!normally) continue;
      const key = keyOf(ids[i], ids[j]);
      const [a, b] = key.split("|");
      const covers = file.pairs[key] ?? {};
      const entries = active.flatMap(({ state }) =>
        (covers[state.id] ?? []).map((item) => ({ state, item })),
      );
      const severity = entries.reduce<Level>(
        (worst, { item }) =>
          SEVERITY_RANK[item.severity_here] < SEVERITY_RANK[worst]
            ? item.severity_here
            : worst,
        entries[0]?.item.severity_here ?? normally,
      );
      out.push({
        key,
        a,
        b,
        severity,
        normally,
        shifted: entries.length > 0 && severity !== normally,
        direct: entries.some(({ item }) => item.direct),
        heldNote: heldNoteOf(a, b, entries, file),
        entries,
      });
    }
  }
  return out.sort(
    (x, y) =>
      Number(!!y.heldNote) - Number(!!x.heldNote) ||
      Number(y.direct) - Number(x.direct) ||
      SEVERITY_RANK[x.severity] - SEVERITY_RANK[y.severity] ||
      x.key.localeCompare(y.key),
  );
};
