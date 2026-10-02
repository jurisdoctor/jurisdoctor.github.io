import { ReactNode } from "react";
import { QuestionType } from "../Nclex/Questions";

export type CalloutTone = "tip" | "critical" | "idea" | "takeaway" | "reference";

export type Block =
  | { type: "heading"; text: string }
  | { type: "p"; text: ReactNode }
  | { type: "callout"; tone: CalloutTone; title: string; text: ReactNode }
  | { type: "table"; headers: string[]; rows: ReactNode[][] }
  | { type: "list"; ordered?: boolean; items: ReactNode[] }
  | { type: "node"; node: ReactNode }
  | { type: "name" }
  | {
      type: "mcq";
      id: string;
      q: ReactNode;
      options: string[];
      answer: number;
      explain: string;
    }
  | { type: "reveal"; id: string; q: ReactNode; answer: ReactNode }
  | {
      type: "flip";
      id: string;
      items: { emoji: string; title: string; back: ReactNode }[];
    }
  | {
      type: "sort";
      id: string;
      q: string;
      buckets: string[];
      items: { text: string; answer: number; explain?: string }[];
    }
  | { type: "order"; id: string; q: string; items: string[] }
  | { type: "check"; id: string; q: string; items: string[] }
  | {
      type: "fields";
      id: string;
      items: { key: string; label: string; rating?: boolean }[];
    }
  | { type: "after"; title: string; node: ReactNode }
  | {
      type: "readinessQuiz";
      id: string;
      questions: { q: string; options: string[]; answer: number }[];
    }
  | { type: "nclexQuiz"; id: string; label: string; questions: QuestionType[] };

export interface Step {
  id: string;
  section: string;
  title: string;
  icon: string;
  meta?: string;
  final?: boolean;
  blocks: Block[];
}
