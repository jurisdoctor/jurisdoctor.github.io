import { CSSProperties } from "react";

// The key line (what the drug does): fades in sharp, then a band of color
// keeps flowing through the letters. `delay` staggers a list of cards so they
// come in one after another instead of all at once.
export const Headline = ({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) => (
  <span
    className={`hl-flow ${className}`}
    style={{ "--hl-delay": `${delay}s` } as CSSProperties}
  >
    {text}
  </span>
);

// The one thing not to miss: a beacon dot that pulses next to the text.
export const Critical = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => (
  <span className={`flex items-start gap-x-2.5 ${className}`}>
    <span
      aria-hidden
      className="crit-dot mt-[0.5em] h-2 w-2 shrink-0 rounded-full bg-[var(--primary-color)]"
    />
    <span className="min-w-0 font-bold leading-snug text-[var(--primary-color)]">
      {text}
    </span>
  </span>
);
