import { buildBank, DerivedBank } from "./Questions";

export type ExamId = "exam1" | "exam2";

export const EXAM_KEY = "nclex:exam:v1";

export const EXAM_TITLES: Record<ExamId, string> = {
  exam1: "Exam 1",
  exam2: "Exam 2",
};

export const EXAMS: ExamId[] = ["exam1", "exam2"];

export const isExamId = (value: unknown): value is ExamId =>
  value === "exam1" || value === "exam2";

const cache = new Map<ExamId, Promise<DerivedBank>>();

// Each exam's question bank is its own JSON file, dynamically imported so a
// visitor only ever downloads the exam they picked rather than both.
export const loadBank = (exam: ExamId): Promise<DerivedBank> => {
  const cached = cache.get(exam);
  if (cached) return cached;

  const promise =
    exam === "exam2"
      ? import("./questions-2.json").then((mod) =>
          buildBank(mod.default as unknown as Parameters<typeof buildBank>[0]),
        )
      : Promise.all([import("./questions.json"), import("./teaching.json")]).then(
          ([data, extra]) =>
            buildBank(
              data.default as unknown as Parameters<typeof buildBank>[0],
              extra.default as unknown as Parameters<typeof buildBank>[1],
            ),
        );

  cache.set(exam, promise);
  return promise;
};
