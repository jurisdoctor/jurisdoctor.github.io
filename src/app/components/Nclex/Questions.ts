import data from "./questions.json";

export interface OptionType {
  id: string;
  text: string;
  correct: boolean;
  rationale: string;
}
export interface QuestionType {
  id: string;
  type?: string;
  topic: string;
  difficulty: string;
  stem: string;
  options: OptionType[];
  answer: string | string[];
  takeaway: string;
  strategy: string;
}

export const keysOf = (question: QuestionType) =>
  question.options
    .filter((option) => option.correct)
    .map((option) => option.id);

export const isMulti = (question: QuestionType) =>
  question.type === "sata" ||
  Array.isArray(question.answer) ||
  keysOf(question).length > 1;
export interface ChapterType {
  id: number;
  title: string;
  pages: number;
  questions: QuestionType[];
}

interface BankType {
  id: number;
  title: string;
  questions: QuestionType[];
}

const ROSTER = [
  { id: 1, title: "Nursing Today", pages: 11 },
  { id: 2, title: "Health Care Delivery", pages: 11 },
  { id: 6, title: "Health and Wellness", pages: 9 },
  { id: 7, title: "Caring", pages: 7 },
  { id: 15, title: "Critical Thinking and Clinical Judgment", pages: 6 },
  { id: 16, title: "Nursing Assessment", pages: 7 },
  { id: 17, title: "Nursing Diagnosis", pages: 6 },
  { id: 18, title: "Planning Nursing Care", pages: 7 },
  { id: 19, title: "Implementing Nursing Care", pages: 7 },
  { id: 20, title: "Evaluation", pages: 6 },
  { id: 22, title: "Ethics and Values", pages: 9 },
  { id: 23, title: "Legal Implications", pages: 10 },
  { id: 24, title: "Communication", pages: 7 },
  { id: 25, title: "Patient Education", pages: 7 },
  { id: 26, title: "Informatics and Documentation", pages: 10 },
];

const bank = data.chapters as unknown as BankType[];
const banked = new Map(bank.map((chapter) => [chapter.id, chapter.questions]));

export const Chapters: ChapterType[] = ROSTER.map((entry) => ({
  ...entry,
  questions: banked.get(entry.id) ?? [],
}));

export const Ready = Chapters.filter((chapter) => chapter.questions.length > 0);
export const AllQuestions = Chapters.flatMap((chapter) => chapter.questions);
export const Course = data.meta.course;
export const Textbook = data.meta.textbook;
