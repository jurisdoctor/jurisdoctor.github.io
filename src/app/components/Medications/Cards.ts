import { IndexType, keyOf, LABELS, PairType } from "./Interactions";
import { GroupType, MedType } from "./types";

// Flashcards are assembled from fields that already exist in the data. A card
// is never made for a field that is empty or null, and no drug content is
// written here: every front and back is a value from the file, unchanged.

export type CardKind =
  | "headline"
  | "brand"
  | "watch"
  | "working"
  | "never"
  | "serious"
  | "blackbox"
  | "antidote"
  | "headline_drug"
  | "critical_drug"
  | "interaction";

export interface KindInfo {
  kind: CardKind;
  label: string;
  hint: string;
  family: "facts" | "reverse" | "interaction";
}

export const KINDS: KindInfo[] = [
  {
    kind: "headline",
    label: "What it's for, and why this one",
    hint: "Generic → headline and why",
    family: "facts",
  },
  {
    kind: "brand",
    label: "Which generic?",
    hint: "Brand name → generic and class",
    family: "facts",
  },
  {
    kind: "watch",
    label: "What do you watch?",
    hint: "Generic → what to monitor",
    family: "facts",
  },
  {
    kind: "working",
    label: "How do you know it's working?",
    hint: "Generic → signs it's working",
    family: "facts",
  },
  {
    kind: "never",
    label: "What are the hard stops?",
    hint: "Generic → never give or hold if",
    family: "facts",
  },
  {
    kind: "serious",
    label: "Serious side effects",
    hint: "Generic → the full serious list",
    family: "facts",
  },
  {
    kind: "blackbox",
    label: "Black box warning",
    hint: "Generic → the warning",
    family: "facts",
  },
  {
    kind: "antidote",
    label: "Antidote",
    hint: "Generic → the antidote",
    family: "facts",
  },
  {
    kind: "headline_drug",
    label: "Headline → which drug?",
    hint: "Pick from four in the same group",
    family: "reverse",
  },
  {
    kind: "critical_drug",
    label: "Critical fact → which drug?",
    hint: "Pick from four in the same group",
    family: "reverse",
  },
  {
    kind: "interaction",
    label: "Can these be given together?",
    hint: "True / false on drug pairs",
    family: "interaction",
  },
];

export type Grade = "got" | "shaky" | "missed";

export interface Block {
  heading?: string;
  lines: string[];
  bullets?: boolean;
  tone?: "danger" | "strong";
}

export interface Card {
  // Results are saved under this: "{medication id}:{card type}", or
  // "{a}+{b}:interaction" for a pair.
  key: string;
  kind: CardKind;
  medId: string;
  group: string;
  // Front: a small question, then the subject in large type.
  prompt: string;
  subject: string;
  options?: string[];
  // Back
  answer?: string;
  blocks: Block[];
}

const has = (text: string | null | undefined): text is string =>
  typeof text === "string" && text.trim().length > 0;
const some = (list: string[] | null | undefined): list is string[] =>
  Array.isArray(list) && list.some(has);

export const shuffle = <T>(items: T[]): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// ---------------------------------------------------------- per-drug cards
// Whether this medication can make a card of this kind (its field isn't empty).
export const supports = (med: MedType, kind: CardKind): boolean => {
  switch (kind) {
    case "headline":
      return has(med.highlight.headline) && some(med.why_this_one.points);
    case "brand":
      return some(med.brand);
    case "watch":
      return some(med.quick.watch);
    case "working":
      return some(med.working_because);
    case "never":
      return some(med.quick.never);
    case "serious":
      return some(med.flashcard?.side_effects?.serious);
    case "blackbox":
      return some(med.black_box);
    case "antidote":
      return has(med.antidote);
    case "headline_drug":
      return has(med.highlight.headline);
    case "critical_drug":
      return has(med.highlight.critical);
    default:
      return false;
  }
};

const base = (med: MedType, kind: CardKind) => ({
  key: `${med.id}:${kind}`,
  kind,
  medId: med.id,
  group: med.group,
});

// Three wrong answers: the same group first, then drugs sharing a drug class,
// then anyone. Never the answer, never a repeated name.
export const distractors = (med: MedType, all: MedType[]): MedType[] => {
  const chosen: MedType[] = [];
  const names = new Set([med.generic]);
  const take = (pool: MedType[]) => {
    for (const candidate of shuffle(pool)) {
      if (chosen.length === 3) return;
      if (candidate.id === med.id || names.has(candidate.generic)) continue;
      names.add(candidate.generic);
      chosen.push(candidate);
    }
  };
  take(all.filter((other) => other.group === med.group));
  if (chosen.length < 3)
    take(
      all.filter((other) =>
        other.drug_class.some((entry) => med.drug_class.includes(entry)),
      ),
    );
  if (chosen.length < 3) take(all);
  return chosen;
};

export const makeCard = (
  med: MedType,
  kind: CardKind,
  all: MedType[],
): Card | null => {
  if (!supports(med, kind)) return null;
  const common = base(med, kind);

  switch (kind) {
    case "headline":
      return {
        ...common,
        prompt: "What is it for, and why this one?",
        subject: med.generic,
        blocks: [
          { lines: [med.highlight.headline], tone: "strong" },
          {
            heading: "Why this one",
            lines: med.why_this_one.points,
            bullets: true,
          },
        ],
      };
    case "brand":
      return {
        ...common,
        prompt: "Which generic?",
        subject: med.brand.join(", "),
        answer: med.generic,
        blocks: [
          { lines: [med.generic], tone: "strong" },
          { lines: [med.subclass] },
        ],
      };
    case "watch":
      return {
        ...common,
        prompt: "What do you watch?",
        subject: med.generic,
        blocks: [{ lines: med.quick.watch, bullets: true }],
      };
    case "working":
      return {
        ...common,
        prompt: "How do you know it's working?",
        subject: med.generic,
        blocks: [{ lines: med.working_because, bullets: true }],
      };
    case "never":
      return {
        ...common,
        prompt: "What are the hard stops?",
        subject: med.generic,
        blocks: [{ lines: med.quick.never, bullets: true, tone: "danger" }],
      };
    case "serious":
      return {
        ...common,
        prompt: "Serious side effects?",
        subject: med.generic,
        // The whole list, always: nothing is cut off or hidden behind a toggle.
        blocks: [
          {
            lines: med.flashcard?.side_effects?.serious ?? [],
            bullets: true,
            tone: "danger",
          },
        ],
      };
    case "blackbox":
      return {
        ...common,
        prompt: "Black box?",
        subject: med.generic,
        blocks: [{ lines: med.black_box, bullets: true, tone: "danger" }],
      };
    case "antidote":
      return {
        ...common,
        prompt: "Antidote?",
        subject: med.generic,
        blocks: [{ lines: [med.antidote as string], tone: "strong" }],
      };
    case "headline_drug":
    case "critical_drug": {
      const subject =
        kind === "headline_drug"
          ? med.highlight.headline
          : (med.highlight.critical as string);
      return {
        ...common,
        prompt:
          kind === "headline_drug"
            ? "Which drug?"
            : "Which drug is this critical fact about?",
        subject,
        options: shuffle([med, ...distractors(med, all)]).map(
          (entry) => entry.generic,
        ),
        answer: med.generic,
        blocks: [{ lines: [med.generic], tone: "strong" }],
      };
    }
    default:
      return null;
  }
};

// ------------------------------------------------------- interaction cards
const WEIGHT = { avoid: 4, high: 2, moderate: 1 } as const;
const CAP = 12;

export interface InteractionPlan {
  flagged: PairType[];
  safeCount: number;
  perHalf: number;
}

// How many true and how many false interaction cards a selection supports.
// "In the selection" means at least one of the two drugs is.
export const planInteractions = (
  index: IndexType,
  selected: Set<string>,
  all: MedType[],
): InteractionPlan => {
  const flagged = index.file.pairs.filter(
    (pair) => selected.has(pair.a) || selected.has(pair.b),
  );
  const total = all.length;
  let possible = 0;
  selected.forEach(() => {
    possible += total - 1;
  });
  // pairs touching the selection that were not flagged (an upper bound that
  // is plenty: a sample is drawn from it)
  const safeCount = Math.max(0, possible - flagged.length * 2);
  const perHalf = Math.min(CAP, flagged.length, safeCount);
  return { flagged, safeCount, perHalf };
};

const pairCard = (
  a: MedType,
  b: MedType,
  pair: PairType | undefined,
  index: IndexType,
): Card => {
  const [first, second] = a.id < b.id ? [a, b] : [b, a];
  const key = `${first.id}+${second.id}:interaction`;
  const common = {
    key,
    kind: "interaction" as const,
    medId: first.id,
    group: first.group,
    prompt: "Can these be given together?",
    subject: `${first.generic} + ${second.generic}`,
  };
  if (!pair) {
    return {
      ...common,
      blocks: [
        { lines: [LABELS.ok], tone: "strong" },
        {
          lines: [
            "This data did not flag the pair. That is not proof they are safe together: an unflagged pair is just one nobody wrote a rule for.",
          ],
        },
      ],
    };
  }
  const first_rule = pair.rules[0];
  const name = index.rules.get(first_rule.rule)?.name ?? first_rule.rule;
  return {
    ...common,
    blocks: [
      { lines: [LABELS[pair.severity]], tone: "danger" },
      { lines: [index.file.severity_key[pair.severity]] },
      { heading: name, lines: [first_rule.why] },
    ],
  };
};

export const interactionCards = (
  index: IndexType,
  selected: Set<string>,
  all: MedType[],
): Card[] => {
  const { flagged, perHalf } = planInteractions(index, selected, all);
  if (perHalf === 0) return [];
  const byId = new Map(all.map((med) => [med.id, med]));

  // Weighted draw without replacement: avoid pairs come up far more often
  // than moderate ones.
  const picked = flagged
    .map((pair) => ({
      pair,
      score: Math.pow(Math.random(), 1 / WEIGHT[pair.severity]),
    }))
    .sort((x, y) => y.score - x.score)
    .slice(0, perHalf)
    .map((entry) => entry.pair);

  const cards = picked.map((pair) =>
    pairCard(byId.get(pair.a)!, byId.get(pair.b)!, pair, index),
  );

  // The other half: two drugs that do not appear together in pairs[].
  const chosen = Array.from(selected);
  const seen = new Set<string>();
  let guard = 0;
  while (seen.size < perHalf && guard < 4000) {
    guard += 1;
    const a = byId.get(chosen[Math.floor(Math.random() * chosen.length)]);
    const b = all[Math.floor(Math.random() * all.length)];
    if (!a || a.id === b.id) continue;
    const key = keyOf(a.id, b.id);
    if (seen.has(key) || index.pairs.has(key)) continue;
    seen.add(key);
    cards.push(pairCard(a, b, undefined, index));
  }
  return cards;
};

// A saved interaction key back into a card.
export const cardForPairKey = (
  key: string,
  all: MedType[],
  index: IndexType,
): Card | null => {
  const [pairPart] = key.split(":");
  const [a, b] = pairPart.split("+");
  const first = all.find((med) => med.id === a);
  const second = all.find((med) => med.id === b);
  if (!first || !second) return null;
  return pairCard(first, second, index.pairs.get(keyOf(a, b)), index);
};

// ------------------------------------------------------------- group colors
export const groupIndex = (groups: GroupType[], name: string) =>
  Math.max(
    0,
    groups.findIndex((entry) => entry.name === name),
  );
