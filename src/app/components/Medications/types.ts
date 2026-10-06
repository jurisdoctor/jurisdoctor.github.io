export interface HighlightType {
  // What the drug is for, in a few words ("↓ BP and heart rate").
  headline: string;
  // The one thing not to miss, when there is one.
  critical: string | null;
}

export interface QuickType {
  one_liner: string;
  watch: string[];
  never: string[];
  working: string;
}

export interface WhyType {
  // Why you'd reach for this drug over the others in its group: the whole
  // answer as one sentence, and the same answer split into its separate points.
  text: string;
  points: string[];
}

// The page for each medication is laid out in the data itself, as an ordered
// list of sections. Each has a type that says how to draw it:
//   pairs    label/value rows
//   list     plain bullets
//   steps    a bullet plus an indented rationale line
//   grouped  sub-headings inside one card (Serious / Common side effects)
//   linked   interaction rows; `with_id` links to another medication
export interface PairItem {
  label: string;
  value: string;
}
export interface StepItem {
  action: string;
  rationale: string;
}
export interface LinkItem {
  severity: "avoid" | "high" | "moderate";
  with: string;
  with_id: string;
  rule: string;
}
export interface GroupItem {
  label: string;
  items: string[];
}

interface SectionBase {
  id: string;
  title: string;
}
export type SectionType =
  | (SectionBase & { type: "pairs"; items: PairItem[]; badges?: string[] })
  | (SectionBase & { type: "list"; items: string[] })
  | (SectionBase & { type: "steps"; items: StepItem[] })
  | (SectionBase & { type: "grouped"; groups: GroupItem[] })
  | (SectionBase & { type: "linked"; items: LinkItem[] });

export interface FlashcardType {
  name: string;
  trade_name: string;
  indication: string;
  action: string;
  therapeutic_class: string;
  pharmacologic_class: string;
  side_effects: { serious: string[]; common: string[] };
  nursing_considerations: string[];
}

export interface MedType {
  id: string;
  generic: string;
  pronunciation: string;
  brand: string[];
  group: string;
  drug_class: string[];
  subclass: string;
  highlight: HighlightType;
  quick: QuickType;
  why_this_one: WhyType;
  use: { primary: string; secondary: string[] };
  working_because: string[];
  high_alert: boolean;
  black_box: string[];
  antidote: string | null;
  // The condensed card for this drug: what the medication card on the page
  // shows, and what the flashcards read.
  flashcard: FlashcardType;
  sections: SectionType[];
}

export interface GroupType {
  name: string;
  count: number;
  medication_ids: string[];
}

export interface MedFile {
  schema_version: string;
  generated: string;
  stats: Record<string, number>;
  groups: GroupType[];
  medications: MedType[];
}
