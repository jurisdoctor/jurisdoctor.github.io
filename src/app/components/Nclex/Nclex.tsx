"use client";
import { useCallback, useState } from "react";
import Shapes from "../Home/Shapes";
import ChapterSet, { PickType, ResultType } from "./ChapterSet";
import Quiz from "./Quiz";
import {
  AllQuestions,
  Chapters,
  Course,
  labelOf,
  QuestionType,
  Textbook,
} from "./Questions";

const shuffle = (items: QuestionType[]) => {
  const order = [...items];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

interface StartType {
  pick: PickType;
  at: number;
}
const Nclex = () => {
  const [started, setStarted] = useState<StartType | null>(null);
  const [results, setResults] = useState<Record<string, ResultType>>({});
  const [deck, setDeck] = useState<QuestionType[] | null>(null);
  const [at, setAt] = useState(0);
  const [run, setRun] = useState(0);
  const pick = started?.pick ?? null;

  const mark = useCallback((id: string, correct: boolean) => {
    setResults((prev) => ({ ...prev, [id]: correct ? "solved" : "missed" }));
  }, []);

  const chapter =
    pick && pick !== "all"
      ? Chapters.find((entry) => entry.id === pick)
      : undefined;

  const questions =
    pick === "all" ? (deck ?? AllQuestions) : (chapter?.questions ?? []);

  const reset = () => {
    setResults({});
    setAt(started?.at ?? 0);
    setRun((prev) => prev + 1);
  };
  const label =
    pick === "all" ? "All chapters" : chapter ? labelOf(chapter) : "";

  return (
    <section className="relative mx-auto max-w-[1080px] animate-fadeIn px-10 pb-24 pt-28 lg:pt-12 md:px-6">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Shapes />
      </div>

      <div className="relative z-10">
        <h1 className="relative mb-2 ml-3.5 text-4xl font-bold lg:ml-0 lg:text-center">
          NCLEX-<em>style</em> Questions
        </h1>
        <p className="mb-14 ml-3.5 lg:ml-0 lg:text-center">
          {Course}. Questions follow {Textbook}.
        </p>

        <h2 className="relative mb-4 ml-3.5 text-3xl font-bold lg:ml-0 lg:text-center">
          Chapters
        </h2>

        <ChapterSet
          chapters={Chapters}
          active={pick}
          results={results}
          current={questions[at]?.id ?? null}
          onStart={(next, index) => {
            setDeck(next === "all" ? shuffle(AllQuestions) : null);
            setAt(index);
            setStarted({ pick: next, at: index });
          }}
          onReset={reset}
        />

        {started === null ? (
          <p className="ml-3.5 text-[#8b88b1] lg:ml-0 lg:text-center">
            Pick a chapter above to see its questions, or hit All to run the
            whole bank.
          </p>
        ) : (
          <>
            <h3 className="mb-4 ml-3.5 text-xl lg:ml-0 lg:text-center">
              {label}
            </h3>
            <Quiz
              key={`${String(pick)}-${started.at}-${run}`}
              label={label}
              questions={questions}
              start={started.at}
              results={results}
              onResult={mark}
              onMove={setAt}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default Nclex;
