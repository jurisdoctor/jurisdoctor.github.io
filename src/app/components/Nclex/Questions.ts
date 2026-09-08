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
  id: string;
  title: string;
  questions: QuestionType[];
}

interface BankType {
  id: string | number;
  title: string;
  questions: QuestionType[];
}

export const labelOf = (chapter: ChapterType) =>
  /^\d+$/.test(chapter.id)
    ? `Chapter ${chapter.id} · ${chapter.title}`
    : chapter.title;

const strip = (text: string) =>
  text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const clean = (question: QuestionType): QuestionType => ({
  ...question,
  topic: strip(question.topic),
  stem: strip(question.stem),
  takeaway: strip(question.takeaway),
  strategy: strip(question.strategy),
  options: question.options.map((option) => ({
    ...option,
    text: strip(option.text),
    rationale: strip(option.rationale),
  })),
});

const bank = data.chapters as unknown as BankType[];

export const Chapters: ChapterType[] = bank.map((chapter) => ({
  id: String(chapter.id),
  title: chapter.title,
  questions: chapter.questions.map(clean),
}));

export const Ready = Chapters.filter((chapter) => chapter.questions.length > 0);
export const AllQuestions = Chapters.flatMap((chapter) => chapter.questions);
export const Course = data.meta.course;
export const Textbook = data.meta.textbook;
