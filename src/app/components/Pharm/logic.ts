import { ResultType } from "../Nclex/ChapterSet";
import { Block, Step } from "./types";

const ACTIVITY_TYPES = new Set([
  "name",
  "mcq",
  "order",
  "reveal",
  "flip",
  "sort",
  "check",
  "fields",
  "readinessQuiz",
  "nclexQuiz",
]);

export const isActivity = (block: Block) => ACTIVITY_TYPES.has(block.type);

export const blockDone = (
  block: Block,
  data: Record<string, any>,
  name: string,
): boolean => {
  switch (block.type) {
    case "name":
      return name.trim().length >= 2;
    case "mcq":
    case "order": {
      const d = data[block.id];
      return !!d?.ok;
    }
    case "reveal": {
      const d = data[block.id];
      return !!d?.shown;
    }
    case "flip": {
      const d = data[block.id];
      return Array.isArray(d) && d.length === block.items.length;
    }
    case "sort":
    case "check": {
      const d = data[block.id];
      return !!d && block.items.every((_, index) => d[index]);
    }
    case "fields": {
      const d = data[block.id];
      return (
        !!d &&
        block.items.every((field) =>
          field.rating
            ? !!d[field.key]
            : typeof d[field.key] === "string" && d[field.key].trim().length >= 3,
        )
      );
    }
    case "readinessQuiz": {
      const d = data[block.id];
      return !!d?.ok;
    }
    case "nclexQuiz": {
      const d = data[block.id] as Record<string, ResultType> | undefined;
      return block.questions.every((question) => d?.[question.id] === "solved");
    }
    default:
      return true;
  }
};

export const stepTasks = (step: Step) => step.blocks.filter(isActivity);

export const stepDone = (
  step: Step,
  data: Record<string, any>,
  name: string,
) => stepTasks(step).every((block) => blockDone(block, data, name));
