export type SeverityType = "common" | "life_threatening";

export interface SideEffectType {
  system: string;
  effects: string[];
  severity: SeverityType;
  note?: string;
}

export interface NursingType {
  action: string;
  rationale: string;
}

export interface TimingType {
  onset: string;
  peak: string;
  duration: string;
}

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

export interface MedType {
  id: string;
  generic: string;
  pronunciation: string;
  brand: string[];
  group: string;
  drug_class: string[];
  subclass: string;
  routes: string[];
  therapeutic_level: string | null;
  onset_peak_duration: TimingType | null;
  use: { primary: string; secondary: string[] };
  action: string[];
  contraindications: string[];
  side_effects: SideEffectType[];
  nursing_interventions: NursingType[];
  working_because: string[];
  high_alert: boolean;
  black_box: string[];
  antidote: string | null;
  footnotes: string[];
  highlight: HighlightType;
  quick: QuickType;
  why_this_one: WhyType;
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
