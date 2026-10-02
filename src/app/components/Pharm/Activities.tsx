"use client";
import { ReactNode, useMemo, useState } from "react";
import { LuCheck } from "react-icons/lu";
import { shuffled } from "../Nclex/Questions";

type Setter<T> = (value: T | ((prev: T | undefined) => T)) => void;

const ActivityShell = ({
  label,
  done,
  children,
}: {
  label: string;
  done: boolean;
  children: ReactNode;
}) => (
  <div
    className={`rounded-lg border border-l-4 border-solid bg-[var(--body-color)] p-5 duration-300 ${
      done
        ? "border-[var(--border-color)] border-l-[rgb(68,215,182)]"
        : "border-[var(--border-color)] border-l-[var(--chip-blue-border)]"
    }`}
  >
    <div className="mb-3 flex items-center justify-between gap-x-3">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
        {label}
      </span>
      {done && (
        <span className="flex items-center gap-x-1 text-xs font-bold text-[rgb(68,215,182)]">
          <LuCheck /> Done
        </span>
      )}
    </div>
    {children}
  </div>
);

export const NameField = ({
  value,
  onChange,
  ok,
}: {
  value: string;
  onChange: (value: string) => void;
  ok: boolean;
}) => (
  <ActivityShell label="Your turn" done={ok}>
    <label
      className="mb-2 block font-semibold text-[var(--title-color)]"
      htmlFor="pharm-name"
    >
      What&apos;s your name?{" "}
      <span className="font-normal text-[var(--muted-color)]">
        (for your certificate)
      </span>
    </label>
    <input
      id="pharm-name"
      type="text"
      placeholder="First and last name"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-4 py-2.5 text-[var(--title-color)] outline-none focus:border-[var(--chip-blue-border)]"
    />
  </ActivityShell>
);

interface McqData {
  ok: boolean;
}

export const Mcq = ({
  q,
  options,
  answer,
  explain,
  data,
  setData,
}: {
  q: ReactNode;
  options: string[];
  answer: number;
  explain: string;
  data: McqData | undefined;
  setData: Setter<McqData>;
}) => {
  const ok = !!data?.ok;
  const [wrong, setWrong] = useState<number | null>(null);

  const pick = (index: number) => {
    if (index === answer) {
      setData({ ok: true });
      setWrong(null);
    } else {
      setWrong(index);
    }
  };

  return (
    <ActivityShell label="Quick check" done={ok}>
      <p className="mb-4 font-semibold text-[var(--title-color)]">{q}</p>
      <div className="grid gap-y-2">
        {options.map((option, index) => {
          const isRight = ok && index === answer;
          const isWrong = !ok && wrong === index;
          return (
            <button
              key={index}
              type="button"
              disabled={ok}
              onClick={() => pick(index)}
              className={`rounded-xl border border-solid p-3 text-left duration-200 disabled:cursor-default ${
                isRight
                  ? "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.12)] text-[var(--title-color)]"
                  : isWrong
                    ? "border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)] text-[var(--title-color)]"
                    : "border-[var(--border-color)] bg-[var(--container-color)] text-[var(--text-color)] hover:border-[var(--chip-blue-border)]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {ok ? (
        <p className="mt-3 text-sm text-[var(--muted-color)]">✓ {explain}</p>
      ) : (
        wrong !== null && (
          <p className="mt-3 text-sm text-[var(--primary-color)]">
            Not quite. Think it through and try again.
          </p>
        )
      )}
    </ActivityShell>
  );
};

interface RevealData {
  text?: string;
  shown?: boolean;
}

export const Reveal = ({
  q,
  answer,
  data,
  setData,
}: {
  q: ReactNode;
  answer: ReactNode;
  data: RevealData | undefined;
  setData: Setter<RevealData>;
}) => {
  const text = data?.text ?? "";
  const shown = !!data?.shown;

  return (
    <ActivityShell label="Self-check" done={shown}>
      <p className="mb-3 font-semibold text-[var(--title-color)]">{q}</p>
      <textarea
        rows={3}
        placeholder="Type your answer…"
        value={text}
        onChange={(event) =>
          setData((prev) => ({ ...prev, text: event.target.value }))
        }
        className="w-full rounded-xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-3 text-[var(--text-color)] outline-none focus:border-[var(--chip-blue-border)]"
      />
      {shown ? (
        <>
          <div className="mt-3 rounded-xl bg-[var(--chip-blue-soft)] p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--case-label-color)]">
              Model answer
            </p>
            <p className="text-[var(--title-color)]">{answer}</p>
          </div>
          <p className="mt-2 text-sm text-[var(--muted-color)]">
            Compare: did you hit the key points? Edit yours if you want.
          </p>
        </>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={text.trim().length < 8}
            onClick={() => setData((prev) => ({ ...prev, shown: true }))}
            className="inline-block rounded-full border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Compare with model answer
          </button>
          <span className="text-sm text-[var(--muted-color)]">
            Write at least a few words first.
          </span>
        </div>
      )}
    </ActivityShell>
  );
};

export const FlipCards = ({
  items,
  data,
  setData,
}: {
  items: { emoji: string; title: string; back: ReactNode }[];
  data: number[] | undefined;
  setData: Setter<number[]>;
}) => {
  const seen = data ?? [];
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const flip = (index: number) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    if (!seen.includes(index)) {
      setData((prev) => Array.from(new Set([...(prev ?? []), index])));
    }
  };

  return (
    <ActivityShell label="Flip them all" done={seen.length === items.length}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, index) => {
          const isFlipped = flipped.has(index);
          return (
            <div key={index} className="[perspective:1000px]">
              <button
                type="button"
                onClick={() => flip(index)}
                aria-label={`Flip card ${index + 1}: ${item.title}`}
                className="relative h-36 w-full [transform-style:preserve-3d] transition-transform duration-500"
                style={{ transform: isFlipped ? "rotateY(180deg)" : "none" }}
              >
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-y-1 rounded-lg border border-solid p-3 text-center [backface-visibility:hidden] ${
                    seen.includes(index)
                      ? "border-[var(--border-color)] bg-[rgba(68,215,182,0.05)]"
                      : "border-[var(--border-color)] bg-[var(--container-color)]"
                  }`}
                >
                  {seen.includes(index) && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[rgb(68,215,182)] text-white">
                      <LuCheck size={10} />
                    </span>
                  )}
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-sm font-bold text-[var(--title-color)]">
                    {item.title}
                  </span>
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-lg border border-solid border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)] p-3 text-center text-sm text-[var(--title-color)] [backface-visibility:hidden]"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  {item.back}
                </div>
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-[var(--muted-color)]">
        {seen.length} of {items.length} flipped
      </p>
    </ActivityShell>
  );
};

export const SortActivity = ({
  q,
  buckets,
  items,
  data,
  setData,
}: {
  q: string;
  buckets: string[];
  items: { text: string; answer: number; explain?: string }[];
  data: Record<number, 1> | undefined;
  setData: Setter<Record<number, 1>>;
}) => {
  const state = data ?? {};
  const [wrong, setWrong] = useState<Record<number, number>>({});
  const allDone = items.every((_, index) => state[index]);

  const pick = (itemIndex: number, bucketIndex: number) => {
    if (bucketIndex === items[itemIndex].answer) {
      setData((prev) => ({ ...(prev ?? {}), [itemIndex]: 1 }));
    } else {
      setWrong((prev) => ({ ...prev, [itemIndex]: bucketIndex }));
    }
  };

  return (
    <ActivityShell label="Sort it" done={allDone}>
      <p className="mb-3 font-semibold text-[var(--title-color)]">{q}</p>
      <div className="grid gap-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={`rounded-xl border border-solid p-3 ${
              state[index]
                ? "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.08)]"
                : "border-[var(--border-color)] bg-[var(--container-color)]"
            }`}
          >
            <p className="mb-2 text-[var(--text-color)]">{item.text}</p>
            {state[index] ? (
              <span className="inline-block rounded-full bg-[rgb(68,215,182)] px-3 py-1 text-xs font-bold text-white">
                ✓ {buckets[item.answer]}
              </span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {buckets.map((bucket, bucketIndex) => (
                  <button
                    key={bucketIndex}
                    type="button"
                    onClick={() => pick(index, bucketIndex)}
                    className={`rounded-full border border-solid px-3 py-1 text-xs font-bold duration-150 ${
                      wrong[index] === bucketIndex
                        ? "border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)] text-[var(--title-color)]"
                        : "border-[var(--chip-blue-border)] text-[var(--chip-blue-border)] hover:bg-[var(--chip-blue-soft)]"
                    }`}
                  >
                    {bucket}
                  </button>
                ))}
              </div>
            )}
            {state[index] && item.explain && (
              <p className="mt-2 text-sm text-[var(--muted-color)]">
                {item.explain}
              </p>
            )}
          </div>
        ))}
      </div>
    </ActivityShell>
  );
};

export const OrderActivity = ({
  id,
  q,
  items,
  data,
  setData,
}: {
  id: string;
  q: string;
  items: string[];
  data: { ok?: boolean } | undefined;
  setData: Setter<{ ok?: boolean }>;
}) => {
  const ok = !!data?.ok;
  const pool = useMemo(
    () => shuffled(items.map((text, index) => ({ text, index })), id),
    [items, id],
  );
  const [seq, setSeq] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  if (ok) {
    return (
      <ActivityShell label="Put in order" done>
        <p className="mb-3 font-semibold text-[var(--title-color)]">{q}</p>
        <div className="grid gap-y-2">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-solid border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.08)] p-3 text-[var(--title-color)]"
            >
              {item}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--muted-color)]">
          ✓ Perfect order.
        </p>
      </ActivityShell>
    );
  }

  const add = (index: number) => {
    const next = [...seq, index];
    if (
      next.length === items.length &&
      next.every((value, position) => value === position)
    ) {
      setData({ ok: true });
      return;
    }
    setChecked(next.length === items.length);
    setSeq(next);
  };

  const remove = (position: number) => {
    setSeq(seq.filter((_, index) => index !== position));
    setChecked(false);
  };

  return (
    <ActivityShell label="Put in order" done={false}>
      <p className="mb-3 font-semibold text-[var(--title-color)]">{q}</p>
      <div className="grid gap-y-2">
        {items.map((_, position) =>
          seq[position] !== undefined ? (
            <button
              key={position}
              type="button"
              onClick={() => remove(position)}
              className={`rounded-xl border border-solid p-3 text-left ${
                checked
                  ? seq[position] === position
                    ? "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.08)] text-[var(--title-color)]"
                    : "border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)] text-[var(--title-color)]"
                  : "border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)] text-[var(--title-color)]"
              }`}
            >
              {items[seq[position]]}
            </button>
          ) : (
            <div
              key={position}
              className="rounded-xl border border-dashed border-[var(--border-color)] p-3 text-[var(--muted-color)]"
            >
              Tap an item below
            </div>
          ),
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {pool
          .filter(({ index }) => !seq.includes(index))
          .map(({ text, index }) => (
            <button
              key={index}
              type="button"
              onClick={() => add(index)}
              className="rounded-full border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-3 py-1.5 text-sm text-[var(--text-color)] hover:border-[var(--chip-blue-border)]"
            >
              {text}
            </button>
          ))}
      </div>
      {checked ? (
        <p className="mt-3 text-sm text-[var(--primary-color)]">
          Green steps are in the right spot. Tap the red ones to send them
          back, then try again.
        </p>
      ) : (
        <p className="mt-3 text-sm text-[var(--muted-color)]">
          Tap a placed step to remove it.
        </p>
      )}
    </ActivityShell>
  );
};

export const Checklist = ({
  q,
  items,
  data,
  setData,
}: {
  q: string;
  items: string[];
  data: Record<number, boolean> | undefined;
  setData: Setter<Record<number, boolean>>;
}) => {
  const state = data ?? {};
  return (
    <ActivityShell
      label="Commit"
      done={items.every((_, index) => state[index])}
    >
      <p className="mb-3 font-semibold text-[var(--title-color)]">{q}</p>
      <div className="grid gap-y-2">
        {items.map((item, index) => (
          <label
            key={index}
            className="flex cursor-pointer items-start gap-x-3 text-[var(--text-color)]"
          >
            <input
              type="checkbox"
              checked={!!state[index]}
              onChange={(event) =>
                setData((prev) => ({
                  ...(prev ?? {}),
                  [index]: event.target.checked,
                }))
              }
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--chip-blue-border)]"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </ActivityShell>
  );
};

export const Fields = ({
  items,
  data,
  setData,
  ok,
}: {
  items: { key: string; label: string; rating?: boolean }[];
  data: Record<string, string | number> | undefined;
  setData: Setter<Record<string, string | number>>;
  ok: boolean;
}) => {
  const state = data ?? {};
  const set = (key: string, value: string | number) =>
    setData((prev) => ({ ...(prev ?? {}), [key]: value }));

  return (
    <ActivityShell label="Reflect" done={ok}>
      <div className="grid gap-y-4">
        {items.map((field) => (
          <div key={field.key}>
            <p className="mb-2 text-sm font-semibold text-[var(--title-color)]">
              {field.label}
            </p>
            {field.rating ? (
              <div className="flex gap-x-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set(field.key, n)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-solid font-bold duration-150 ${
                      state[field.key] === n
                        ? "border-[var(--chip-blue-border)] bg-[var(--chip-blue-border)] text-white"
                        : "border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--chip-blue-border)]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                rows={2}
                value={(state[field.key] as string) ?? ""}
                onChange={(event) => set(field.key, event.target.value)}
                className="w-full rounded-xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-3 text-[var(--text-color)] outline-none focus:border-[var(--chip-blue-border)]"
              />
            )}
          </div>
        ))}
      </div>
    </ActivityShell>
  );
};

interface ReadinessQuizData {
  ok: boolean;
  picks: (number | null)[];
  attempts: number;
}

export const ReadinessQuiz = ({
  questions,
  data,
  setData,
}: {
  questions: { q: string; options: string[]; answer: number }[];
  data: ReadinessQuizData | undefined;
  setData: Setter<ReadinessQuizData>;
}) => {
  const passed = !!data?.ok;
  const [picks, setPicks] = useState<(number | null)[]>(
    () => data?.picks?.slice() ?? Array(questions.length).fill(null),
  );
  const [graded, setGraded] = useState(false);

  const correct = picks.filter((pick, index) => pick === questions[index].answer)
    .length;
  const answered = picks.filter((pick) => pick !== null).length;

  const choose = (questionIndex: number, optionIndex: number) => {
    setPicks((prev) =>
      prev.map((value, index) => (index === questionIndex ? optionIndex : value)),
    );
    setGraded(false);
  };

  const submit = () => {
    const allCorrect = correct === questions.length;
    setGraded(true);
    setData((prev) => ({
      ok: allCorrect,
      picks,
      attempts: (prev?.attempts ?? 0) + 1,
    }));
  };

  return (
    <ActivityShell label="Readiness quiz" done={passed}>
      <div className="grid gap-y-6">
        {questions.map((question, qi) => (
          <div key={qi}>
            <p className="mb-2 font-semibold text-[var(--title-color)]">
              {qi + 1}. {question.q}
            </p>
            <div className="grid gap-y-2">
              {question.options.map((option, oi) => {
                let state: "right" | "wrong" | "selected" | "neutral" =
                  "neutral";
                if (passed && oi === question.answer) state = "right";
                else if (!passed && picks[qi] === oi)
                  state = graded ? (oi === question.answer ? "right" : "wrong") : "selected";

                const cls =
                  state === "right"
                    ? "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.12)] text-[var(--title-color)]"
                    : state === "wrong"
                      ? "border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)] text-[var(--title-color)]"
                      : state === "selected"
                        ? "border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)] text-[var(--title-color)]"
                        : "border-[var(--border-color)] bg-[var(--container-color)] text-[var(--text-color)] hover:border-[var(--chip-blue-border)]";

                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={passed || (graded && picks[qi] === question.answer)}
                    onClick={() => choose(qi, oi)}
                    className={`rounded-xl border border-solid p-3 text-left duration-150 ${cls}`}
                  >
                    {"ABCD"[oi]}. {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {passed ? (
        <p className="mt-4 text-sm text-[var(--muted-color)]">
          🎉 {questions.length} / {questions.length}. You&apos;re ready for
          class!
          {data && data.attempts > 1 ? ` (took ${data.attempts} attempts)` : ""}
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={answered < questions.length}
            onClick={submit}
            className="inline-block rounded-full border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-6 py-2.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit answers
          </button>
          <span className="text-sm text-[var(--muted-color)]">
            {graded
              ? `${correct} / ${questions.length} correct. Change the red ones and resubmit.`
              : `${answered} of ${questions.length} answered`}
          </span>
        </div>
      )}
    </ActivityShell>
  );
};
