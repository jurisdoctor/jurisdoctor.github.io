"use client";
import { useState } from "react";

const Stop = ({
  n,
  emoji,
  title,
  sub,
}: {
  n: number;
  emoji: string;
  title: string;
  sub: string;
}) => (
  <div className="flex min-w-[7.5rem] flex-1 flex-col items-center gap-y-1 rounded-xl bg-[var(--body-color)] p-4 text-center">
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--chip-blue-border)] text-xs font-bold text-white">
      {n}
    </span>
    <span className="text-2xl">{emoji}</span>
    <span className="font-bold text-[var(--title-color)]">{title}</span>
    <span className="text-xs text-[var(--muted-color)]">{sub}</span>
  </div>
);

export const RoadTrip = () => (
  <div className="flex flex-wrap gap-3 rounded-xl bg-[var(--container-color)] p-4">
    <Stop n={1} emoji="🚪" title="Absorption" sub="getting in" />
    <Stop n={2} emoji="🩸" title="Distribution" sub="getting around" />
    <Stop n={3} emoji="🧪" title="Metabolism" sub="breaking down" />
    <Stop n={4} emoji="🚽" title="Excretion" sub="getting out" />
  </div>
);

export const ThreeChecks = () => (
  <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-[var(--container-color)] p-4">
    <Stop n={1} emoji="🗄️" title="Pull" sub="from the med system" />
    <span className="text-xl text-[var(--muted-color)]">→</span>
    <Stop n={2} emoji="🧴" title="Prepare" sub="before opening" />
    <span className="text-xl text-[var(--muted-color)]">→</span>
    <Stop n={3} emoji="🛏️" title="Bedside" sub="armband + scan" />
  </div>
);

const FlowNode = ({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "give" | "hold" | "clarify";
  children: React.ReactNode;
}) => {
  const toneClass =
    tone === "give"
      ? "border-[rgb(68,215,182)] bg-[rgba(68,215,182,0.12)]"
      : tone === "hold"
        ? "border-[var(--primary-color)] bg-[hsla(353,100%,65%,0.1)]"
        : tone === "clarify"
          ? "border-[var(--chip-blue-border)] bg-[var(--chip-blue-soft)]"
          : "border-[var(--border-color)] bg-[var(--body-color)]";
  return (
    <div
      className={`rounded-xl border border-solid px-4 py-2.5 text-center text-sm font-semibold text-[var(--title-color)] ${toneClass}`}
    >
      {children}
    </div>
  );
};

export const CjmmFlow = () => (
  <div className="flex flex-col items-center gap-y-2 rounded-xl bg-[var(--container-color)] p-4">
    <FlowNode>
      🔍 Recognize cues
      <div className="mt-0.5 text-xs font-normal text-[var(--muted-color)]">
        vitals, labs, symptoms
      </div>
    </FlowNode>
    <span className="text-[var(--muted-color)]">↓</span>
    <FlowNode>
      🧠 Analyze cues
      <div className="mt-0.5 text-xs font-normal text-[var(--muted-color)]">
        safe to give now?
      </div>
    </FlowNode>
    <span className="text-[var(--muted-color)]">↓</span>
    <div className="flex flex-wrap items-start justify-center gap-4">
      <div className="flex flex-col items-center gap-y-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
          Yes
        </span>
        <FlowNode tone="give">✅ Give the med</FlowNode>
        <span className="text-[var(--muted-color)]">↓</span>
        <FlowNode>
          🔁 Evaluate outcomes
          <div className="mt-0.5 text-xs font-normal text-[var(--muted-color)]">
            did it work? any harm?
          </div>
        </FlowNode>
      </div>
      <div className="flex flex-col items-center gap-y-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
          No
        </span>
        <FlowNode tone="hold">✋ Hold + notify provider</FlowNode>
      </div>
      <div className="flex flex-col items-center gap-y-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
          Unsure
        </span>
        <FlowNode tone="clarify">❓ Clarify the order</FlowNode>
      </div>
    </div>
    <span className="text-[var(--muted-color)]">↓</span>
    <FlowNode>📝 Document</FlowNode>
  </div>
);

export const TherapeuticWindow = () => {
  const [level, setLevel] = useState(50);
  const zone =
    level > 66
      ? "🔴 Toxic: hold, notify, check levels"
      : level < 33
        ? "🔵 Too low: not working"
        : "🟢 In the window: working safely";

  return (
    <div className="grid gap-4 rounded-xl bg-[var(--container-color)] p-4 sm:grid-cols-[7rem_1fr]">
      <div className="relative h-40 w-full overflow-hidden rounded-xl sm:w-28">
        <div className="absolute inset-x-0 top-0 h-1/3 bg-[hsla(353,100%,65%,0.25)]" />
        <div className="absolute inset-x-0 top-1/3 h-1/3 bg-[rgba(68,215,182,0.22)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[var(--chip-blue)]" />

        <div
          className="absolute inset-x-1 h-1 -translate-y-1/2 rounded-full bg-[var(--title-color)] shadow-md duration-150"
          style={{ bottom: `${level}%` }}
        />

        <div className="absolute inset-x-0 top-0 flex h-1/3 items-start justify-center pt-2">
          <span className="rounded bg-[var(--body-color)] px-1.5 py-0.5 text-center text-[10px] font-bold leading-tight text-[var(--title-color)] shadow-md">
            Toxic
          </span>
        </div>
        <div className="absolute inset-x-0 top-1/3 flex h-1/3 items-start justify-center pt-2">
          <span className="rounded bg-[var(--body-color)] px-1.5 py-0.5 text-center text-[10px] font-bold leading-tight text-[var(--title-color)] shadow-md">
            Therapeutic window
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-1/3 items-start justify-center pt-2">
          <span className="rounded bg-[var(--body-color)] px-1.5 py-0.5 text-center text-[10px] font-bold leading-tight text-[var(--title-color)] shadow-md">
            Too low
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <label
          className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]"
          htmlFor="pharm-window-level"
        >
          Drug level
        </label>
        <input
          id="pharm-window-level"
          type="range"
          min={2}
          max={98}
          value={level}
          onChange={(event) => setLevel(Number(event.target.value))}
          className="mt-2 w-full accent-[var(--chip-blue-border)]"
        />
        <div className="mt-2 font-bold text-[var(--title-color)]">{zone}</div>
        <p className="mt-2 text-xs text-[var(--muted-color)]">
          Narrow-range drugs have a thin safe band, so small changes push
          them out of it.
        </p>
      </div>
    </div>
  );
};

export const PatientChart = ({
  emoji,
  name,
  sub,
  pills,
  children,
}: {
  emoji: string;
  name: string;
  sub: string;
  pills: [string, boolean][];
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-solid border-[var(--border-color)] bg-[var(--body-color)] p-5">
    <div className="mb-3 flex items-center gap-x-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--chip-blue)] text-xl">
        {emoji}
      </span>
      <div>
        <p className="font-bold text-[var(--title-color)]">{name}</p>
        <p className="text-xs text-[var(--muted-color)]">{sub}</p>
      </div>
    </div>
    <div className="text-[var(--text-color)]">{children}</div>
    <div className="mt-3 flex flex-wrap gap-2">
      {pills.map(([label, bad]) => (
        <span
          key={label}
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            bad
              ? "bg-[hsla(353,100%,65%,0.15)] text-[var(--primary-color)]"
              : "bg-[rgba(68,215,182,0.15)] text-[rgb(68,215,182)]"
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  </div>
);

export const Objectives = ({ items }: { items: [string, string][] }) => (
  <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
    {items.map(([, text]) => (
      <div key={text} className="flex items-start gap-x-3">
        <span className="mt-1 shrink-0 text-sm font-light leading-none text-[var(--chip-blue-border)]">
          +
        </span>
        <span className="text-sm leading-relaxed text-[var(--text-color)]">
          {text}
        </span>
      </div>
    ))}
  </div>
);
