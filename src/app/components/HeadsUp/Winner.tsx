"use client";
import { useEffect, useState } from "react";
import { PiCrownSimpleFill, PiTrophyFill } from "react-icons/pi";
import { CARDS, CATEGORIES, NEEDED, TurnType, clock } from "./game";

const COLORS = [
  "#e0463a",
  "#3b7ddd",
  "#eab72b",
  "#2f9e5f",
  "#e2689f",
  "#ffffff",
];

interface PieceType {
  left: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  sway: number;
  round: boolean;
}

const pieces = (): PieceType[] =>
  Array.from({ length: 90 }, (_, index) => ({
    left: Math.random() * 100,
    size: 6 + Math.random() * 8,
    delay: Math.random() * 2.5,
    duration: 3.2 + Math.random() * 2.8,
    color: COLORS[index % COLORS.length],
    sway: (Math.random() - 0.5) * 160,
    round: Math.random() > 0.6,
  }));

// The winning team's moment: a trophy, the team's name and time, and
// confetti falling over the page. Confetti is skipped for visitors who ask
// their device for reduced motion.
const Winner = ({ turn, team }: { turn: TurnType; team: string }) => {
  const [confetti, setConfetti] = useState<PieceType[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setConfetti(pieces());
  }, []);

  const card = CARDS.find((entry) => entry.id === turn.card);
  const category = CATEGORIES.find((entry) => entry.slug === turn.slug);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
      >
        {confetti.map((piece, index) => (
          <span
            key={index}
            className="confetti"
            style={
              {
                left: `${piece.left}%`,
                width: piece.size,
                height: piece.round ? piece.size : piece.size * 1.6,
                borderRadius: piece.round ? "50%" : "2px",
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                "--sway": `${piece.sway}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="winner-card relative mb-2 flex w-full animate-fadeIn flex-col items-center rounded-xl bg-[var(--container-color)] px-7 py-10 text-center shadow-xl md:px-5">
        <span className="winner-trophy mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#eab72b] text-5xl text-[#3a2a00] shadow-lg">
          <PiTrophyFill aria-hidden />
        </span>
        <p className="mb-1 flex items-center gap-x-2 text-sm font-bold uppercase tracking-[0.2em] text-[#eab72b]">
          <PiCrownSimpleFill aria-hidden />
          winner
          <PiCrownSimpleFill aria-hidden />
        </p>
        <h2 className="mb-3 text-5xl font-bold leading-tight text-[var(--title-color)] md:text-4xl">
          {team}
        </h2>
        <p className="text-lg text-[var(--muted-color)]">
          <span
            aria-hidden
            className="mr-2 inline-block h-3 w-3 rounded-full align-middle"
            style={{ backgroundColor: card?.color }}
          />
          {category?.name} ·{" "}
          <span className="font-bold tabular-nums text-[var(--title-color)]">
            {clock(turn.seconds)}
          </span>{" "}
          · {turn.correct} of {NEEDED} words
        </p>
      </div>
    </>
  );
};

export default Winner;
