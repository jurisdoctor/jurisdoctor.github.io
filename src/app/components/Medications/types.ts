export interface HighlightType {
  headline: string;
  critical: string | null;
}

export interface QuickType {
  one_liner: string;
  watch: string[];
  never: string[];
  working: string;
}

export interface WhyType {
  text: string;
  points: string[];
}

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
  flashcard: FlashcardType;
  sections: SectionType[];
  tags: string[];
  nclex: boolean;
}

export interface GroupType {
  name: string;
  count: number;
  medication_ids: string[];
}

export interface FilterFamily {
  family: string;
  tags: { tag: string; label: string; count: number }[];
}

export interface MedFile {
  schema_version: string;
  generated: string;
  stats: Record<string, number>;
  groups: GroupType[];
  medications: MedType[];
  filters: { families: FilterFamily[]; label_of: Record<string, string> };
  course_list: { count: number; what_it_is: string };
}
