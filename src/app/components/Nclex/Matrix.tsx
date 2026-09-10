"use client";
import { useRef, useState } from "react";
import { QuestionType, rowKeys, RowType } from "./Questions";

const SHAKE = [
  { transform: "translateX(0)" },
  { transform: "translateX(-7px)" },
  { transform: "translateX(6px)" },
  { transform: "translateX(-4px)" },
  { transform: "translateX(0)" },
];
const POP = [
  { transform: "scale(1)" },
  { transform: "scale(1.02)" },
  { transform: "scale(0.998)" },
  { transform: "scale(1)" },
];

const Cell = ({
  on,
  answered,
  right,
  multi,
  label,
  onToggle,
}: {
  on: boolean;
  answered: boolean;
  right: boolean;
  multi: boolean;
  label: string;
  onToggle: () => void;
}) => {
  const tone = answered
    ? on && right
      ? "border-[rgb(68,215,182)] bg-[rgb(68,215,182)] text-white"
      : on
        ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
        : right
          ? "border-dashed border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.12)] text-[rgb(68,215,182)]"
          : "border-[#d3d0e4] bg-[var(--container-color)] text-transparent"
    : on
      ? "border-[hsl(219,100%,72%)] bg-[hsl(219,100%,72%)] text-white"
      : "border-[#d3d0e4] bg-[var(--container-color)] text-transparent hover:border-[hsl(219,100%,72%)]";

  return (
    <td className="p-2 text-center">
      <button
        type="button"
        role={multi ? "checkbox" : "radio"}
        aria-checked={on}
        aria-label={label}
        disabled={answered}
        onClick={onToggle}
        className={`h-6 w-6 border-2 border-solid text-xs font-bold leading-none duration-200 ${
          multi ? "rounded-[5px]" : "rounded-full"
        } ${tone}`}
      >
        {answered && !on && right ? "·" : "✓"}
      </button>
    </td>
  );
};

const Matrix = ({
  question,
  answered,
  onSettle,
  onClear,
}: {
  question: QuestionType;
  answered: boolean;
  onSettle: (correct: boolean) => void;
  onClear: () => void;
}) => {
  const columns = question.columns ?? [];
  const rows = question.rows ?? [];
  const multi = question.type === "matrix_multiple_response";
  const [marks, setMarks] = useState<Record<string, string[]>>({});
  const frameRef = useRef<HTMLDivElement>(null);

  const on = (row: RowType, column: string) =>
    (marks[row.id] ?? []).includes(column);

  const toggle = (row: RowType, column: string) => {
    if (answered) return;
    setMarks((prev) => {
      const here = prev[row.id] ?? [];
      if (!multi)
        return { ...prev, [row.id]: here[0] === column ? [] : [column] };
      return {
        ...prev,
        [row.id]: here.includes(column)
          ? here.filter((entry) => entry !== column)
          : [...here, column],
      };
    });
  };

  const rowRight = (row: RowType) => {
    const want = rowKeys(row);
    const here = marks[row.id] ?? [];
    return (
      here.length === want.length && want.every((key) => here.includes(key))
    );
  };

  const everyRowAnswered = rows.every(
    (row) => (marks[row.id] ?? []).length > 0,
  );
  const columnsCovered = question.constraint
    ? columns.every((column) =>
        rows.some((row) => (marks[row.id] ?? []).includes(column)),
      )
    : true;
  const ready = everyRowAnswered && columnsCovered;

  const solved = rows.filter(rowRight).length;

  const check = () => {
    const perfect = solved === rows.length;
    const node = frameRef.current;
    if (
      node &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      node.animate(perfect ? POP : SHAKE, {
        duration: perfect ? 460 : 480,
        easing: "ease-out",
      });
    }
    onSettle(perfect);
  };

  const reset = () => {
    setMarks({});
    onClear();
  };

  return (
    <div className="mb-6">
      {!answered && question.note && (
        <p className="mb-4 rounded-2xl border-2 border-dashed border-[#d3d0e4] p-4 text-sm text-[#8b88b1]">
          {question.note}
        </p>
      )}

      <div ref={frameRef} className="mb-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-2/5 p-2 text-left text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
                Finding
              </th>
              {columns.map((column) => (
                <th
                  key={column}
                  className="p-2 text-center text-xs font-bold uppercase tracking-wide text-[var(--title-color)]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`border-t-[1px] border-solid border-[#e6e4f0] ${
                  answered
                    ? rowRight(row)
                      ? "bg-[rgba(68,215,182,0.08)]"
                      : "bg-[hsla(353,100%,65%,0.07)]"
                    : ""
                }`}
              >
                <td className="p-2 align-middle">{row.text}</td>
                {columns.map((column) => (
                  <Cell
                    key={column}
                    on={on(row, column)}
                    answered={answered}
                    right={rowKeys(row).includes(column)}
                    multi={multi}
                    label={`${row.text}: ${column}`}
                    onToggle={() => toggle(row, column)}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {answered && (
        <div className="mb-6 grid gap-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className={`animate-fadeIn rounded-xl border-2 border-solid p-3 text-sm ${
                rowRight(row)
                  ? "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.12)]"
                  : "border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)]"
              }`}
            >
              <span className="font-bold text-[var(--title-color)]">
                {row.text}
              </span>
              <span className="ml-2 text-xs uppercase tracking-wide text-[#8b88b1]">
                {rowKeys(row).join(", ") || "none"}
              </span>
              <p className="mt-1 text-[#8b88b1]">{row.rationale}</p>
            </div>
          ))}
        </div>
      )}

      {answered ? (
        <p className="animate-fadeIn rounded-2xl bg-[var(--body-color)] p-4 text-center">
          <span className="font-bold text-[var(--title-color)]">
            {solved} of {rows.length}
          </span>{" "}
          rows correct.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={!ready}
            onClick={check}
            className="inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            Check answer
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs font-bold uppercase tracking-wide text-[#8b88b1] duration-300 hover:text-[var(--primary-color)]"
          >
            Clear
          </button>
          <span className="text-sm text-[#8b88b1]">
            {!everyRowAnswered
              ? `${rows.filter((row) => (marks[row.id] ?? []).length).length} of ${rows.length} rows answered`
              : !columnsCovered
                ? "Each column needs at least one selection"
                : "Ready to check"}
          </span>
        </div>
      )}
    </div>
  );
};

export default Matrix;
