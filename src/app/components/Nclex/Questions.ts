import data from "./questions.json";
import extra from "./teaching.json";

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

export interface ItemType {
  id: string;
  text: string;
  rationale: string;
}

export interface TermType {
  id: string;
  text: string;
}

export interface DataType {
  headers: string[];
  rows: string[][];
}

export interface BlankType {
  id: number;
  options: OptionType[];
}

const seedOf = (text: string) => {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
};

export const shuffled = <T>(items: T[], seed: string) => {
  let state = seedOf(seed);
  const order = [...items];
  for (let i = order.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  const same = order.every((entry, index) => entry === items[index]);
  return same && order.length > 1 ? [...order.slice(1), order[0]] : order;
};

export interface QuestionType {
  id: string;
  ordinal?: number;
  type?: string;
  scenario?: string;
  stem: string;
  options: OptionType[];
  pools?: Record<string, PoolType>;
  segments?: SegmentType[];
  columns?: string[];
  rows?: RowType[];
  items?: ItemType[];
  terms?: TermType[];
  data?: DataType;
  sentence?: string;
  blanks?: BlankType[];
  baseline?: string;
  nursesNote?: string;
  caseId?: string;
  caseTitle?: string;
  caseStep?: number;
  caseSteps?: number;
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
  question.type === "matrix" ||
  question.type === "matrix_multiple_response" ||
  question.type === "trend_matrix";

export const isCountedPick = (question: QuestionType) =>
  question.type === "select_n";

export const isOrdered = (question: QuestionType) =>
  question.type === "ordered_response";

export const isMatching = (question: QuestionType) =>
  question.type === "matching";

export const isCloze = (question: QuestionType) => question.type === "cloze";

export const rowKeys = (row: RowType) =>
  Array.isArray(row.answer) ? row.answer : [row.answer];

const SUPPORTED = [
  "multiple_choice",
  "sata",
  "extended_response",
  "trend",
  "select_n",
];

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

  if (isCloze(question))
    return (
      typeof question.sentence === "string" &&
      Array.isArray(question.blanks) &&
      question.blanks.length > 0 &&
      question.blanks.every((blank) =>
        blank.options.some((option) => option.correct),
      )
    );

  if (isOrdered(question))
    return (
      Array.isArray(question.options) &&
      Array.isArray(question.answer) &&
      question.answer.length === question.options.length
    );

  if (isMatching(question))
    return (
      Array.isArray(question.items) &&
      Array.isArray(question.terms) &&
      question.items.length > 0 &&
      question.items.every(
        (item) =>
          typeof (question.answer as unknown as Record<string, string>)?.[
            item.id
          ] === "string",
      )
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
  subtitle?: string;
  questions: QuestionType[];
}

interface BankType {
  id: string | number;
  title: string;
  subtitle?: string;
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
  items: question.items?.map((item) => ({
    ...item,
    text: strip(item.text),
    rationale: strip(item.rationale),
  })),
  terms: question.terms?.map((term) => ({ ...term, text: strip(term.text) })),
  sentence: question.sentence ? strip(question.sentence) : undefined,
  baseline: question.baseline ? strip(question.baseline) : undefined,
  nursesNote: question.nursesNote ? strip(question.nursesNote) : undefined,
  blanks: question.blanks?.map((blank) => ({
    ...blank,
    options: blank.options.map(tidy),
  })),
});

interface ExtraType extends QuestionType {
  chapter: string;
}

const added = (extra.items as unknown as ExtraType[]).reduce((map, item) => {
  const bucket = map.get(item.chapter) ?? [];
  bucket.push(item);
  map.set(item.chapter, bucket);
  return map;
}, new Map<string, QuestionType[]>());

const group = (entries: BankType[], graft: boolean): ChapterType[] =>
  entries.map((entry) => {
    const id = String(entry.id);
    const own = entry.questions.filter(renderable).map(clean);
    const join = graft
      ? (added.get(id) ?? []).filter(renderable).map(clean)
      : [];
    return {
      id,
      title: entry.title,
      subtitle: entry.subtitle,
      questions: [...own, ...join].map((question, index) => ({
        ...question,
        ordinal: index + 1,
      })),
    };
  });

const banked = group(data.chapters as unknown as BankType[], true);

const isJudgment = (question: QuestionType) => /-cj\d+$/.test(question.id);

export const Chapters: ChapterType[] = banked.map((chapter) => ({
  ...chapter,
  questions: chapter.questions
    .filter((question) => !question.caseId && !isJudgment(question))
    .map((question, index) => ({ ...question, ordinal: index + 1 })),
}));

// Grouped by chapter rather than by clinical-judgment step: the step is the
// answer, so a step-named group would hand over every answer inside it.
export const Judgment: ChapterType[] = banked
  .map((chapter) => ({
    ...chapter,
    questions: chapter.questions
      .filter(isJudgment)
      .map((question, index) => ({ ...question, ordinal: index + 1 })),
  }))
  .filter((chapter) => chapter.questions.length > 0);

export const Skills: ChapterType[] = group(
  ((data as { skills?: unknown }).skills ?? []) as BankType[],
  false,
);

const caseKey = (question: QuestionType) =>
  /^ch(\d+)-/.exec(question.caseId ?? "")?.[1] ?? question.caseId ?? "";

export const Cases: ChapterType[] = (() => {
  const held = new Map<string, QuestionType[]>();
  banked.forEach((chapter) =>
    chapter.questions.forEach((question) => {
      if (!question.caseId) return;
      const bucket = held.get(question.caseId) ?? [];
      bucket.push(question);
      held.set(question.caseId, bucket);
    }),
  );

  return Array.from(held.entries())
    .map(([id, steps]) => {
      const order = [...steps].sort(
        (a, b) => (a.caseStep ?? 0) - (b.caseStep ?? 0),
      );
      return {
        id: caseKey(order[0]),
        title: order[0].caseTitle ?? "Case study",
        subtitle: id,
        questions: order.map((question, index) => ({
          ...question,
          ordinal: question.caseStep ?? index + 1,
        })),
      };
    })
    .sort((a, b) => Number(a.id) - Number(b.id));
})();

export const AllCaseQuestions = Cases.flatMap((entry) => entry.questions);
export const AllJudgmentQuestions = Judgment.flatMap((step) => step.questions);

export const Ready = Chapters.filter((chapter) => chapter.questions.length > 0);
export const AllQuestions = Chapters.flatMap((chapter) => chapter.questions);
export const AllSkillQuestions = Skills.flatMap((skill) => skill.questions);
export const Course = data.meta.course;
export const Textbook = data.meta.textbook;
