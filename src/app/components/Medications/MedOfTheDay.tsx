"use client";
import { CSSProperties, useEffect } from "react";
import { createPortal } from "react-dom";
import { PiXBold } from "react-icons/pi";
import { Critical, Headline } from "./Emphasis";
import { shortName } from "./Interactions";
import { MedType } from "./types";

// The popup that greets you on the drug guide: one medication a day (picked in
// Daily.ts), with just enough to learn it at a glance and a way into its full
// page. Closing it, any way, is remembered for the day by the caller.
const MedOfTheDay = ({
  med,
  date,
  accent,
  onOpen,
  onClose,
}: {
  med: MedType;
  date: Date;
  accent: string;
  onOpen: () => void;
  onClose: () => void;
}) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const today = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const watch = med.quick.watch.slice(0, 2);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-[rgba(0,0,0,0.6)] px-4 py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Medication of the day"
        onClick={(event) => event.stopPropagation()}
        style={
          {
            "--accent": accent,
            "--accent-ink": `color-mix(in srgb, ${accent} 70%, var(--title-color))`,
          } as CSSProperties
        }
        className="m-auto w-full max-w-[30rem] animate-fadeIn rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-6 shadow-2xl md:p-4"
      >
        <div className="mb-4 flex items-start justify-between gap-x-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-ink)]">
              Medication of the day
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted-color)]">{today}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--muted-color)] duration-300 hover:bg-[var(--body-color)] hover:text-[var(--title-color)]"
          >
            <PiXBold />
          </button>
        </div>

        <h2 className="text-3xl font-bold">{shortName(med)}</h2>
        <p className="mt-1 text-sm text-[var(--muted-color)]">
          {med.brand.join(", ")}
          {med.pronunciation ? ` · say it: ${med.pronunciation}` : ""}
        </p>
        <span
          className="mt-3 inline-block rounded-md px-2.5 py-1 text-xs font-bold text-[var(--accent-ink)]"
          style={{
            background: "color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          {med.group}
        </span>

        <p className="mt-4 text-lg font-bold leading-snug">
          <Headline text={med.highlight.headline} />
        </p>
        <p className="mt-2 text-[var(--text-color)]">{med.quick.one_liner}</p>

        {med.why_this_one.text && (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-color)]">
              Reach for it when
            </p>
            <p className="mt-1">{med.why_this_one.text}</p>
          </div>
        )}

        {watch.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-color)]">
              Watch
            </p>
            <ul className="mt-1 grid gap-y-1">
              {watch.map((line) => (
                <li key={line} className="flex gap-x-2 text-sm">
                  <span
                    aria-hidden
                    className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {med.highlight.critical && (
          <Critical text={med.highlight.critical} className="mt-4 text-sm" />
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
          <button
            type="button"
            onClick={onOpen}
            className="inline-block rounded-md border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-[var(--on-primary)] shadow-lg"
          >
            Open the full page
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[var(--muted-color)] duration-300 hover:text-[var(--title-color)]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default MedOfTheDay;
