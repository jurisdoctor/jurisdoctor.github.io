"use client";
import {
  Fragment,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { PiCaretDownBold } from "react-icons/pi";
import { useKeepInView } from "./KeepInView";
import { QuestionType } from "./Questions";

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

interface ChoiceType {
  id: string;
  text: string;
}

// One blank in a sentence: a small field that opens a panel of choices, picked
// with the mouse or the arrow keys and Enter, closed with Escape or a press
// outside.
const Blank = ({
  label,
  choices,
  value,
  disabled,
  tone,
  mark,
  onPick,
}: {
  label: string;
  choices: ChoiceType[];
  value: string;
  disabled: boolean;
  tone: string;
  mark: string;
  onPick: (id: string) => void;
}) => {
  const [shown, setShown] = useState(false);
  const [cursor, setCursor] = useState(0);
  const root = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLUListElement>(null);
  const shift = useKeepInView(panel, shown);
  const current = choices.find((choice) => choice.id === value);

  useEffect(() => {
    if (!shown) return;
    const away = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setShown(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [shown]);

  const show = () => {
    const at = choices.findIndex((choice) => choice.id === value);
    setCursor(at >= 0 ? at : 0);
    setShown(true);
  };

  const choose = (id: string) => {
    setShown(false);
    onPick(id);
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (disabled) return;
    if (!shown) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        show();
      }
      return;
    }
    if (event.key === "Escape") {
      setShown(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((at) => (at + 1) % choices.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((at) => (at - 1 + choices.length) % choices.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (choices[cursor]) choose(choices[cursor].id);
    }
  };

  return (
    <span
      ref={root}
      onKeyDown={onKeyDown}
      className="relative mx-1 inline-block max-w-[calc(100%-0.5rem)] align-middle"
    >
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={shown}
        onClick={() => (shown ? setShown(false) : show())}
        className={`inline-flex max-w-[min(20rem,100%)] items-center justify-between gap-x-2 rounded-lg border-2 border-solid px-3 py-0.5 text-left text-sm font-bold outline-none duration-300 focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] disabled:cursor-default ${tone}`}
      >
        <span className="grid min-w-0">
          <span
            className={`col-start-1 row-start-1 truncate ${current ? "" : "font-normal"}`}
          >
            {current?.text ?? "Select"}
          </span>
          {["Select", ...choices.map((choice) => choice.text)].map(
            (text, index) => (
              <span
                key={index}
                aria-hidden
                className="invisible col-start-1 row-start-1 h-0 overflow-hidden whitespace-nowrap font-bold"
              >
                {text}
              </span>
            ),
          )}
        </span>
        {mark && <span className="shrink-0">{mark}</span>}
        {!disabled && (
          <PiCaretDownBold
            aria-hidden
            className={`shrink-0 text-xs opacity-70 duration-300 ${shown ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {shown && (
        <ul
          ref={panel}
          role="listbox"
          style={{ left: shift }}
          className="absolute left-0 top-full z-30 mt-1.5 max-h-72 w-max min-w-full max-w-[min(26rem,calc(100vw-4rem))] animate-fadeIn overflow-auto rounded-xl bg-[var(--container-color)] p-1.5 text-left leading-snug shadow-xl ring-1 ring-[var(--chip-blue-border)]"
        >
          {choices.map((choice, index) => (
            <li
              key={choice.id}
              role="option"
              aria-selected={choice.id === value}
            >
              <button
                type="button"
                onClick={() => choose(choice.id)}
                onMouseEnter={() => setCursor(index)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm duration-150 ${
                  choice.id === value
                    ? "bg-[var(--chip-blue)] font-bold text-[var(--title-color)]"
                    : index === cursor
                      ? "bg-[var(--body-color)] text-[var(--title-color)]"
                      : "text-[var(--muted-color)]"
                }`}
              >
                {choice.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </span>
  );
};

const Cloze = ({
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
  const blanks = question.blanks ?? [];
  const [picks, setPicks] = useState<Record<number, string>>({});
  const frameRef = useRef<HTMLDivElement>(null);

  const blankOf = (id: number) => blanks.find((blank) => blank.id === id);
  const keyFor = (id: number) =>
    blankOf(id)?.options.find((option) => option.correct)?.id;
  const rightFor = (id: number) => picks[id] === keyFor(id);
  const scored = blanks.filter((blank) => rightFor(blank.id)).length;
  const full = blanks.every((blank) => picks[blank.id]);

  const parts = (question.sentence ?? "").split(/(\[\[\d+\]\])/g);

  const check = () => {
    const perfect = scored === blanks.length;
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
    setPicks({});
    onClear();
  };

  return (
    <div className="mb-6">
      <div
        ref={frameRef}
        className="mb-6 rounded-2xl bg-[var(--body-color)] p-5 leading-[1.875rem] sm:p-4"
      >
        {parts.map((part, index) => {
          const hit = part.match(/^\[\[(\d+)\]\]$/);
          if (!hit) return <Fragment key={index}>{part}</Fragment>;

          const id = Number(hit[1]);
          const blank = blankOf(id);
          if (!blank) return <Fragment key={index}>{part}</Fragment>;

          const chosen = picks[id];
          const right = answered && rightFor(id);
          const tone = answered
            ? right
              ? "border-[rgb(var(--success-rgb))] bg-[rgba(var(--success-rgb),0.18)] text-[var(--title-color)]"
              : "border-[var(--danger-color)] bg-[color-mix(in_srgb,var(--danger-color)_14%,transparent)] text-[var(--title-color)]"
            : chosen
              ? "border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)] text-[var(--title-color)]"
              : "border-transparent bg-[var(--container-color)] text-[var(--muted-color)] hover:text-[var(--title-color)]";

          return (
            <Blank
              key={index}
              label={`Blank ${id}`}
              choices={blank.options.map((option) => ({
                id: option.id,
                text: option.text,
              }))}
              value={chosen ?? ""}
              disabled={answered}
              tone={tone}
              mark={answered ? (right ? " ✅" : " ❌") : ""}
              onPick={(next) => setPicks((prev) => ({ ...prev, [id]: next }))}
            />
          );
        })}
      </div>

      {answered && (
        <div className="mb-6 grid gap-y-3">
          {blanks.map((blank) => {
            const chosen = picks[blank.id];
            const right = rightFor(blank.id);
            return (
              <div
                key={blank.id}
                className={`animate-fadeIn rounded-xl border-2 border-solid p-4 ${
                  right
                    ? "border-[rgb(var(--success-rgb))] bg-[rgba(var(--success-rgb),0.12)]"
                    : "border-[var(--danger-color)] bg-[color-mix(in_srgb,var(--danger-color)_10%,transparent)]"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                  Blank {blank.id}
                </span>
                {blank.options.map((option) => {
                  if (!option.correct && option.id !== chosen) return null;
                  return (
                    <p key={option.id} className="mt-1 text-sm">
                      <span className="font-bold text-[var(--title-color)]">
                        {option.text}
                        {option.correct ? " ✅" : " ❌"}
                      </span>
                      <span className="ml-2 text-[var(--muted-color)]">
                        {option.rationale}
                      </span>
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {answered ? (
        <p className="animate-fadeIn rounded-2xl bg-[var(--body-color)] p-4 text-center">
          <span className="font-bold text-[var(--title-color)]">
            {scored} of {blanks.length}
          </span>{" "}
          blanks correct.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={!full}
            onClick={check}
            className="inline-block rounded-md border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-[var(--on-primary)] shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            Check answer
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)] duration-300 hover:text-[var(--primary-color)]"
          >
            Clear
          </button>
          <span className="text-sm text-[var(--muted-color)]">
            {Object.values(picks).filter(Boolean).length} of {blanks.length}{" "}
            filled
          </span>
        </div>
      )}
    </div>
  );
};

export default Cloze;
