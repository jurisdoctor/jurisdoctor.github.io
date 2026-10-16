import { MedType } from "./types";

export type Level = "avoid" | "high" | "moderate";
export type Status = "ok" | Level;

export interface RuleDef {
  id: string;
  name: string;
  severity: Level;
  mechanism: string;
  watch: string;
  exam: string;
  brief?: { result: string; do: string; watch: string };
}

export interface PairRule {
  rule: string;
  severity: Level;
  why: string;
  highest?: boolean;
}

export interface PairType {
  a: string;
  b: string;
  severity: Level;
  rules: PairRule[];
}

export interface InteractionFile {
  note: string;
  severity_key: Record<Level, string>;
  rules: RuleDef[];
  pairs: PairType[];
  clean: Record<string, string>;
  clean_note: string;
}

// Loaded only when the interaction map opens; it is about as large as the
// rest of the guide again and nobody needs it until then.
export const loadInteractions = (): Promise<InteractionFile> =>
  import("./interactions.json").then(
    (mod) => mod.default as unknown as InteractionFile,
  );

export const MAX_COMPARE = 8;

export const keyOf = (a: string, b: string) =>
  a < b ? `${a}|${b}` : `${b}|${a}`;

export interface IndexType {
  file: InteractionFile;
  pairs: Map<string, PairType>;
  rules: Map<string, RuleDef>;
}

export const indexOf = (file: InteractionFile): IndexType => ({
  file,
  pairs: new Map(file.pairs.map((pair) => [keyOf(pair.a, pair.b), pair])),
  rules: new Map(file.rules.map((rule) => [rule.id, rule])),
});

export const statusOf = (index: IndexType, a: string, b: string): Status =>
  index.pairs.get(keyOf(a, b))?.severity ?? "ok";

export type Tone = "green" | "amber" | "red";

export const toneOf = (status: Status): Tone =>
  status === "ok" ? "green" : status === "moderate" ? "amber" : "red";

export const COLORS: Record<Tone, string> = {
  green: "hsl(156, 100%, 42%)",
  amber: "hsl(38, 96%, 54%)",
  red: "hsl(4, 82%, 60%)",
};

export const LABELS: Record<Status, string> = {
  ok: "No known interaction",
  moderate: "Use with care",
  high: "High risk",
  avoid: "Avoid",
};

export const ORDER: Record<Status, number> = {
  avoid: 0,
  high: 1,
  moderate: 2,
  ok: 3,
};

// A name short enough for a map label: "Aspirin (acetylsalicylic acid)" and
// "Niacin (vitamin B3)" lose their parentheses.
export const shortName = (med: MedType) =>
  med.generic.replace(/\s*\(.*?\)\s*/g, " ").trim();
