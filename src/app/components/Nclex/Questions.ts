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
  new?: boolean;
  dailySet?: string;
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
  strategy?: string;
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
export interface ChapterMemberType {
  chapterNumber?: number;
  source?: string;
  title: string;
}

export interface ChapterType {
  id: string;
  chapterNumber?: number;
  source?: string;
  title: string;
  subtitle?: string;
  questions: QuestionType[];
  // Present when this tile combines several source chapters into one deck
  // (e.g. a PPT deck that covers Potter 42 and Iggy 13 together).
  members?: ChapterMemberType[];
}

interface BankType {
  id: string | number;
  chapterNumber?: number;
  source?: string;
  title: string;
  subtitle?: string;
  questions: QuestionType[];
  members?: ChapterMemberType[];
}

interface ChapterGroupType {
  id: string;
  title: string;
  exam?: string;
  chapters: (string | number)[];
}

// Chapter numbers repeat across the two source textbooks (Potter and Iggy),
// so `id` disambiguates (Iggy chapters use id = 1000 + chapterNumber) while
// `chapterNumber` carries the number to actually display; fall back to the
// id for chapters that don't need the split.
export const displayNumberOf = (chapter: ChapterType) =>
  chapter.members?.[0]?.chapterNumber ?? chapter.chapterNumber ?? chapter.id;

export const labelOf = (chapter: ChapterType) => {
  if (chapter.members && chapter.members.length > 1) {
    const numbers = chapter.members.map((member) => member.chapterNumber).join(" & ");
    return `Chapters ${numbers} · ${chapter.title}`;
  }
  return /^\d+$/.test(chapter.id)
    ? `Chapter ${displayNumberOf(chapter)} · ${chapter.title}`
    : chapter.title;
};

// A deck like "Fluid and Electrolytes" covers Potter 42 and Iggy 13 as one
// unit in the real course, so their questions are combined into a single
// tile named after the deck, in the order the group declares.
const mergeGroups = (
  chapters: BankType[],
  groups: ChapterGroupType[] | undefined,
): BankType[] => {
  if (!groups?.length) return chapters;
  const byId = new Map(chapters.map((chapter) => [String(chapter.id), chapter]));
  const consumed = new Set<string>();

  return chapters.reduce<BankType[]>((merged, chapter) => {
    const id = String(chapter.id);
    if (consumed.has(id)) return merged;

    const group = groups.find((entry) =>
      entry.chapters.some((member) => String(member) === id),
    );
    if (!group) {
      merged.push(chapter);
      return merged;
    }

    const members = group.chapters
      .map((member) => byId.get(String(member)))
      .filter((entry): entry is BankType => !!entry);
    members.forEach((member) => consumed.add(String(member.id)));

    merged.push({
      id: group.id,
      title: group.title,
      questions: members.flatMap((member) => member.questions),
      members: members.map((member) => ({
        chapterNumber: member.chapterNumber,
        source: member.source,
        title: member.title,
      })),
    });
    return merged;
  }, []);
};


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
  strategy: question.strategy ? strip(question.strategy) : undefined,
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

interface RawBankFile {
  meta: { course: string; textbook: string; chapterGroups?: ChapterGroupType[] };
  chapters: BankType[];
  skills?: BankType[];
}

interface ExtraFile {
  items: ExtraType[];
}

export interface DerivedBank {
  Chapters: ChapterType[];
  Skills: ChapterType[];
  Cases: ChapterType[];
  Judgment: ChapterType[];
  // A synthetic tile bundling every question currently flagged new/dailySet,
  // for quick review. It's a filtered view, not a move: once a question
  // loses the flag in a later drop it just stops showing up here and is
  // only found in its real chapter, same as it always was.
  New: ChapterType | null;
  Ready: ChapterType[];
  AllQuestions: QuestionType[];
  AllSkillQuestions: QuestionType[];
  AllCaseQuestions: QuestionType[];
  AllJudgmentQuestions: QuestionType[];
  Course: string;
  Textbook: string;
}

const isJudgment = (question: QuestionType) => /-cj\d+$/.test(question.id);

const caseKey = (question: QuestionType) =>
  /^ch(\d+)-/.exec(question.caseId ?? "")?.[1] ?? question.caseId ?? "";

// Builds every derived view (chapters, skills, case studies, clinical
// judgment) from one raw bank file. `extra` grafts supplementary
// further-teaching questions into their chapter by id; omit it for a bank
// that doesn't have (or need) that treatment.
export const buildBank = (data: RawBankFile, extra?: ExtraFile): DerivedBank => {
  const added = (extra?.items ?? []).reduce((map, item) => {
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
        chapterNumber: entry.chapterNumber,
        source: entry.source,
        members: entry.members,
        title: entry.title,
        subtitle: entry.subtitle,
        questions: [...own, ...join].map((question, index) => ({
          ...question,
          ordinal: index + 1,
        })),
      };
    });

  const banked = group(
    mergeGroups(data.chapters, data.meta.chapterGroups),
    !!extra,
  );

  const isFresh = (question: QuestionType) => !!(question.new || question.dailySet);

  const readyForChapters: ChapterType[] = banked.map((chapter) => ({
    ...chapter,
    questions: chapter.questions.filter(
      (question) => !question.caseId && !isJudgment(question),
    ),
  }));

  // Grouped by chapter rather than by clinical-judgment step: the step is
  // the answer, so a step-named group would hand over every answer inside it.
  const Judgment: ChapterType[] = banked
    .map((chapter) => ({
      ...chapter,
      questions: chapter.questions
        .filter(isJudgment)
        .map((question, index) => ({ ...question, ordinal: index + 1 })),
    }))
    .filter((chapter) => chapter.questions.length > 0);

  const New: ChapterType | null = (() => {
    const fresh = readyForChapters.flatMap((chapter) => chapter.questions).filter(isFresh);
    if (!fresh.length) return null;
    return {
      id: "new",
      title: "New",
      questions: fresh.map((question, index) => ({
        ...question,
        ordinal: index + 1,
      })),
    };
  })();

  // Fresh questions live only in the New tile while they're flagged; once a
  // later drop clears the flag they stop matching here and fall straight
  // back into this filter's normal output — no separate "move" needed.
  const Chapters: ChapterType[] = readyForChapters.map((chapter) => ({
    ...chapter,
    questions: chapter.questions
      .filter((question) => !isFresh(question))
      .map((question, index) => ({ ...question, ordinal: index + 1 })),
  }));

  const Skills: ChapterType[] = group(data.skills ?? [], false);

  const Cases: ChapterType[] = (() => {
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

  return {
    Chapters,
    Skills,
    Cases,
    Judgment,
    New,
    Ready: Chapters.filter((chapter) => chapter.questions.length > 0),
    AllQuestions: Chapters.flatMap((chapter) => chapter.questions),
    AllSkillQuestions: Skills.flatMap((skill) => skill.questions),
    AllCaseQuestions: Cases.flatMap((entry) => entry.questions),
    AllJudgmentQuestions: Judgment.flatMap((step) => step.questions),
    Course: data.meta.course,
    Textbook: data.meta.textbook,
  };
};
