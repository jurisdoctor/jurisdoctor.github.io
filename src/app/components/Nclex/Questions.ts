import data from "./questions.json";

export interface OptionType {
  id: string;
  text: string;
  correct: boolean;
  rationale: string;
}
export interface PoolType {
  label: string;
  select: number;
  options: OptionType[];
}

export interface SegmentType {
  id: string;
  text: string;
  correct: boolean;
  rationale: string;
}

export interface RowType {
  id: string;
  text: string;
  answer: string | string[];
  rationale: string;
}

export interface QuestionType {
  id: string;
  type?: string;
  topic: string;
  difficulty: string;
  scenario?: string;
  stem: string;
  options: OptionType[];
  pools?: Record<string, PoolType>;
  segments?: SegmentType[];
  columns?: string[];
  rows?: RowType[];
  select?: number;
  constraint?: string;
  note?: string;
  answer: string | string[];
  takeaway: string;
  strategy: string;
}

export const isHighlight = (question: QuestionType) =>
  question.type === "highlight";

export const isGrid = (question: QuestionType) =>
  question.type === "matrix" || question.type === "matrix_multiple_response";

export const rowKeys = (row: RowType) =>
  Array.isArray(row.answer) ? row.answer : [row.answer];

const SUPPORTED = ["multiple_choice", "sata", "extended_response"];

export const poolsOf = (question: QuestionType) =>
  Object.entries(question.pools ?? {});

const pooled = (question: QuestionType) => {
  const pools = poolsOf(question);
  return (
    pools.length > 0 &&
    pools.every(
      ([, pool]) =>
        Array.isArray(pool.options) &&
        pool.options.filter((option) => option.correct).length === pool.select,
    )
  );
};

export const renderable = (question: QuestionType) => {
  if (question.type === "bowtie") return pooled(question);

  if (isHighlight(question))
    return (
      Array.isArray(question.segments) &&
      question.segments.some((segment) => segment.correct)
    );

  if (isGrid(question))
    return (
      Array.isArray(question.columns) &&
      Array.isArray(question.rows) &&
      question.rows.length > 0 &&
      question.rows.every((row) =>
        rowKeys(row).every((key) => question.columns?.includes(key)),
      )
    );

  return (
    SUPPORTED.includes(question.type ?? "multiple_choice") &&
    Array.isArray(question.options) &&
    question.options.some((option) => option.correct)
  );
};

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

const answerOf = (question: QuestionType) => {
  if (Array.isArray(question.answer)) return question.answer;
  if (typeof question.answer !== "string" || !Array.isArray(question.options))
    return question.answer;
  const packed = question.options
    .map((option) => option.id)
    .filter((id) => question.answer.includes(id));
  return packed.length > 1 ? packed : question.answer;
};

const tidy = (option: OptionType) => ({
  ...option,
  text: strip(option.text),
  rationale: strip(option.rationale),
});

const cleanPools = (question: QuestionType) => {
  if (!question.pools) return undefined;
  return Object.fromEntries(
    Object.entries(question.pools).map(([key, pool]) => [
      key,
      { ...pool, label: strip(pool.label), options: pool.options.map(tidy) },
    ]),
  );
};

const clean = (question: QuestionType): QuestionType => ({
  ...question,
  answer: answerOf(question),
  topic: strip(question.topic),
  scenario: question.scenario ? strip(question.scenario) : undefined,
  stem: strip(question.stem),
  takeaway: strip(question.takeaway),
  strategy: strip(question.strategy),
  options: Array.isArray(question.options)
    ? question.options.map(tidy)
    : question.options,
  pools: cleanPools(question),
  segments: question.segments?.map((segment) => ({
    ...segment,
    text: strip(segment.text),
    rationale: strip(segment.rationale),
  })),
  rows: question.rows?.map((row) => ({
    ...row,
    text: strip(row.text),
    rationale: strip(row.rationale),
  })),
});

const bank = data.chapters as unknown as BankType[];

export const Chapters: ChapterType[] = bank.map((chapter) => ({
  id: String(chapter.id),
  title: chapter.title,
  questions: chapter.questions.filter(renderable).map(clean),
}));

export const Ready = Chapters.filter((chapter) => chapter.questions.length > 0);
export const AllQuestions = Chapters.flatMap((chapter) => chapter.questions);
export const Course = data.meta.course;
export const Textbook = data.meta.textbook;
