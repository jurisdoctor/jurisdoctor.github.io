import { CARDS, CATEGORIES, NEEDED, TurnType, clock } from "./game";

// Every team that has already played, with its card, category and time.
const Results = ({
  turns,
  teams,
  heading,
  ranked = false,
}: {
  turns: TurnType[];
  teams: string[];
  heading: string;
  ranked?: boolean;
}) => {
  if (turns.length === 0) return null;
  return (
    <div className="mt-8 w-full animate-fadeIn rounded-xl bg-[var(--container-color)] p-6 shadow-xl md:p-5">
      <h3 className="mb-4 text-lg font-bold text-[var(--title-color)]">
        {heading}
      </h3>
      <ol className="grid gap-y-2">
        {turns.map((turn, index) => {
          const card = CARDS.find((entry) => entry.id === turn.card);
          const category = CATEGORIES.find((entry) => entry.slug === turn.slug);
          return (
            <li
              key={`${turn.team}-${turn.card}`}
              className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 rounded-xl p-3 ${
                ranked && index === 0
                  ? "bg-[color-mix(in_srgb,#eab72b_20%,transparent)]"
                  : "bg-[var(--body-color)]"
              }`}
            >
              <span
                aria-hidden
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: card?.color }}
              />
              <span className="min-w-0">
                <span className="block truncate font-bold text-[var(--title-color)]">
                  {index + 1}. {teams[turn.team] || `Team ${turn.team + 1}`}
                </span>
                <span className="block truncate text-xs text-[var(--muted-color)]">
                  {category?.name} · {turn.correct} of {NEEDED} words
                </span>
              </span>
              <span className="text-lg font-bold tabular-nums text-[var(--title-color)]">
                {clock(turn.seconds)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default Results;
