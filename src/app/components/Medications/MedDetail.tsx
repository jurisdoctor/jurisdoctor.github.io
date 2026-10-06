"use client";
import { ReactNode } from "react";
import { LuArrowLeft, LuArrowRight, LuCheck, LuPlus } from "react-icons/lu";
import { Critical, Headline } from "./Emphasis";
import { MedType, SideEffectType } from "./types";

const card =
  "rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-5 sm:p-4";

const Heading = ({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: "danger";
}) => (
  <h3
    className={`mb-3 text-xs font-bold uppercase tracking-wide ${
      tone === "danger"
        ? "text-[var(--primary-color)]"
        : "text-[var(--muted-color)]"
    }`}
  >
    {children}
  </h3>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="grid gap-y-2">
    {items.map((item, index) => (
      <li key={index} className="flex gap-x-3 leading-relaxed">
        <span
          aria-hidden
          className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--chip-blue-border)]"
        />
        <span className="min-w-0">{item}</span>
      </li>
    ))}
  </ul>
);

const Pill = ({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: "alert" | "danger" | "accent";
}) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
      tone === "danger"
        ? "bg-[hsla(353,100%,68%,0.16)] text-[var(--primary-color)]"
        : tone === "alert"
          ? "bg-[var(--chip-amber)] text-[hsl(38,100%,60%)] [:root[data-theme=light]_&]:text-[hsl(30,90%,28%)]"
          : tone === "accent"
            ? "bg-[var(--chip-blue)] text-[var(--title-color)]"
            : "bg-[var(--body-color)] text-[var(--muted-color)]"
    }`}
  >
    {children}
  </span>
);

const sideEffectRows = (effects: SideEffectType[]) => (
  <ul className="grid gap-y-3">
    {effects.map((entry, index) => (
      <li
        key={index}
        className="grid grid-cols-[6.5rem_1fr] items-start gap-x-4 sm:grid-cols-1 sm:gap-y-1"
      >
        {/* Same vertical padding and line height as the chips beside it, so
            the label sits on the same line as the first row of chips. */}
        <span className="py-1 text-sm font-bold leading-snug text-[var(--title-color)]">
          {entry.system}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap gap-1.5">
            {entry.effects.map((effect) => (
              <span
                key={effect}
                className={`rounded-lg px-2.5 py-1 text-sm leading-snug ${
                  entry.severity === "life_threatening"
                    ? "bg-[hsla(353,100%,68%,0.14)] text-[var(--title-color)]"
                    : "bg-[var(--body-color)] text-[var(--text-color)]"
                }`}
              >
                {effect}
              </span>
            ))}
          </span>
          {entry.note && (
            <span className="mt-1.5 block text-sm italic text-[var(--muted-color)]">
              {entry.note}
            </span>
          )}
        </span>
      </li>
    ))}
  </ul>
);

const step =
  "inline-flex max-w-[16rem] items-center gap-x-2 rounded-[1.875rem] border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-4 py-2.5 text-sm font-bold text-[var(--title-color)] duration-300 hover:border-[var(--chip-blue-border)]";

const MedDetail = ({
  med,
  neighbours,
  onOpen,
  onBack,
  picked,
  pickedFull,
  onPick,
}: {
  med: MedType;
  neighbours: { prev: MedType | null; next: MedType | null };
  onOpen: (id: string) => void;
  onBack: () => void;
  // Whether this medication is on the interaction-check list, whether the
  // list is full, and the toggle.
  picked: boolean;
  pickedFull: boolean;
  onPick: () => void;
}) => {
  const serious = med.side_effects.filter(
    (entry) => entry.severity === "life_threatening",
  );
  const common = med.side_effects.filter(
    (entry) => entry.severity === "common",
  );
  const sideEffectGroups = [
    {
      label: "Life-threatening",
      tone: "text-[var(--primary-color)]",
      items: serious,
    },
    { label: "Common", tone: "text-[var(--title-color)]", items: common },
  ].filter((entry) => entry.items.length > 0);

  return (
    <article className="grid gap-y-4">
      <header className={`${card} relative`}>
        {/* Adds this medication to the list used by the interaction check.
            Top right of the card; a check shows once it's on the list. */}
        <button
          type="button"
          onClick={onPick}
          disabled={pickedFull}
          aria-pressed={picked}
          aria-label={
            picked
              ? `Remove ${med.generic} from the interaction check`
              : `Add ${med.generic} to the interaction check`
          }
          title={
            picked
              ? "On your interaction-check list. Tap to remove"
              : pickedFull
                ? "The interaction-check list is full (8)"
                : "Add to the interaction check"
          }
          className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border-2 border-solid duration-300 disabled:cursor-not-allowed disabled:opacity-40 sm:right-3 sm:top-3 ${
            picked
              ? "border-[hsl(150,62%,46%)] bg-[hsl(150,62%,46%)] text-white hover:brightness-110"
              : "border-[var(--chip-blue-border)] text-[var(--chip-blue-border)] hover:scale-105 hover:bg-[var(--chip-blue-soft)]"
          }`}
        >
          {picked ? <LuCheck size={22} /> : <LuPlus size={24} />}
        </button>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pr-14">
          <h2 className="text-3xl font-bold text-[var(--title-color)] sm:text-2xl">
            {med.generic}
          </h2>
          <span className="italic text-[var(--muted-color)]">
            {med.pronunciation}
          </span>
        </div>

        <p className="mt-2 text-[var(--text-color)]">
          <span className="font-bold text-[var(--title-color)]">
            {med.brand.length > 1 ? "Brand names: " : "Brand name: "}
          </span>
          {med.brand.join(", ")}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {med.high_alert && <Pill tone="alert">⚠ High-alert medication</Pill>}
          {med.black_box.length > 0 && (
            <Pill tone="danger">Black box warning</Pill>
          )}
          <Pill tone="accent">{med.group}</Pill>
          {med.drug_class.map((entry) => (
            <Pill key={entry}>{entry}</Pill>
          ))}
          <Pill>{med.subclass}</Pill>
          {med.routes.map((route) => (
            <Pill key={route}>{route}</Pill>
          ))}
        </div>
      </header>

      {med.highlight.critical && (
        <section className="crit-glow rounded-2xl border border-solid border-[var(--primary-color)] bg-[linear-gradient(hsla(353,100%,68%,0.1),hsla(353,100%,68%,0.1)),var(--container-color)] px-5 py-4 sm:px-4">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[var(--primary-color)]">
            Do not miss
          </p>
          <Critical
            text={med.highlight.critical}
            className="text-lg sm:text-base"
          />
        </section>
      )}

      <section className={card}>
        <Heading>Why this one</Heading>
        {med.why_this_one.points.length > 1 ? (
          <Bullets items={med.why_this_one.points} />
        ) : (
          <p className="leading-relaxed">{med.why_this_one.text}</p>
        )}
      </section>

      <section className={card}>
        <Heading>Quick reference</Heading>
        <p className="mb-4 font-bold leading-relaxed text-[var(--title-color)]">
          {med.quick.one_liner}
        </p>
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          <div className="rounded-xl bg-[var(--body-color)] p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
              Watch
            </p>
            <Bullets items={med.quick.watch} />
          </div>
          <div className="rounded-xl bg-[var(--body-color)] p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--primary-color)]">
              Never give or hold if
            </p>
            <Bullets items={med.quick.never} />
          </div>
          <div className="rounded-xl bg-[var(--body-color)] p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
              Working when
            </p>
            <p className="leading-relaxed">{med.quick.working}</p>
          </div>
        </div>
      </section>

      {med.black_box.length > 0 && (
        <section className="rounded-2xl border-2 border-solid border-[var(--primary-color)] bg-[linear-gradient(hsla(353,100%,68%,0.1),hsla(353,100%,68%,0.1)),var(--container-color)] p-5 sm:p-4">
          <Heading tone="danger">Black box warning</Heading>
          <Bullets items={med.black_box} />
        </section>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
        <section className={card}>
          <Heading>Used for</Heading>
          <p className="text-lg font-bold leading-relaxed text-[var(--title-color)]">
            <Headline text={med.use.primary} />
          </p>
          {med.use.secondary.length > 0 && (
            <div className="mt-3 text-[var(--text-color)]">
              <Bullets items={med.use.secondary} />
            </div>
          )}
        </section>

        <section className={card}>
          <Heading>How it works</Heading>
          <Bullets items={med.action} />
        </section>
      </div>

      {(med.onset_peak_duration || med.therapeutic_level || med.antidote) && (
        <section className={card}>
          <Heading>Timing, levels and reversal</Heading>
          {med.onset_peak_duration && (
            <dl className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-1">
              {(
                [
                  ["Onset", med.onset_peak_duration.onset],
                  ["Peak", med.onset_peak_duration.peak],
                  ["Duration", med.onset_peak_duration.duration],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl bg-[var(--body-color)] px-4 py-3"
                >
                  <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                    {label}
                  </dt>
                  <dd className="mt-0.5 font-bold text-[var(--title-color)]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {med.therapeutic_level && (
            <p className="mb-2">
              <span className="font-bold text-[var(--title-color)]">
                Therapeutic level:{" "}
              </span>
              {med.therapeutic_level}
            </p>
          )}
          {med.antidote && (
            <p>
              <span className="font-bold text-[var(--title-color)]">
                Antidote:{" "}
              </span>
              <span className="capitalize">{med.antidote}</span>
            </p>
          )}
        </section>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
        <section className={card}>
          <Heading>Do not give if</Heading>
          <Bullets items={med.contraindications} />
        </section>

        <section className={card}>
          <Heading>It is working when</Heading>
          <Bullets items={med.working_because} />
        </section>
      </div>

      <section className={card}>
        {/* The first group's label shares the heading's line ("SIDE EFFECTS
            Common"), so there's no lone sub-heading hanging under it; a
            second group, when there is one, gets its own label below. */}
        {sideEffectGroups.map((entry, index) => (
          <div key={entry.label} className={index > 0 ? "mt-6" : ""}>
            {index === 0 ? (
              <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                  Side effects
                </h3>
                <span className={`text-sm font-bold ${entry.tone}`}>
                  {entry.label}
                </span>
              </div>
            ) : (
              <p className={`mb-3 text-sm font-bold ${entry.tone}`}>
                {entry.label}
              </p>
            )}
            {sideEffectRows(entry.items)}
          </div>
        ))}
      </section>

      <section className={card}>
        <Heading>Nursing interventions</Heading>
        <ol className="grid gap-y-4">
          {med.nursing_interventions.map((entry, index) => {
            const flagged = entry.action.startsWith("BLACK BOX:");
            const text = flagged
              ? entry.action.replace(/^BLACK BOX:\s*/, "")
              : entry.action;
            return (
              <li key={index} className="flex gap-x-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--chip-blue)] text-xs font-bold text-[var(--title-color)]">
                  {index + 1}
                </span>
                <span className="min-w-0 leading-relaxed">
                  {flagged && (
                    <span className="mr-2 rounded-md bg-[hsla(353,100%,68%,0.16)] px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--primary-color)]">
                      Black box
                    </span>
                  )}
                  <span className="font-bold text-[var(--title-color)]">
                    {text}
                  </span>
                  {entry.rationale && (
                    <span className="mt-1 block text-[var(--text-color)]">
                      <span className="italic text-[var(--muted-color)]">
                        Why:{" "}
                      </span>
                      {entry.rationale}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {med.footnotes.length > 0 && (
        <section className={card}>
          <Heading>Notes</Heading>
          <ul className="grid gap-y-2 italic text-[var(--text-color)]">
            {med.footnotes.map((note, index) => (
              <li key={index} className="leading-relaxed">
                {note}
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav
        aria-label={`More in ${med.group}`}
        className="mt-2 flex flex-wrap items-center justify-between gap-3 sm:justify-center"
      >
        {neighbours.prev ? (
          <button
            type="button"
            onClick={() => onOpen(neighbours.prev!.id)}
            title="Previous medication"
            className={step}
          >
            <LuArrowLeft
              aria-hidden
              className="shrink-0 text-[var(--muted-color)]"
            />
            <span className="truncate">{neighbours.prev.generic}</span>
          </button>
        ) : (
          <span aria-hidden className="sm:hidden" />
        )}

        <button
          type="button"
          onClick={onBack}
          className="rounded-[1.875rem] border-[1px] border-solid border-[var(--primary-color)] bg-transparent px-6 py-2.5 text-sm font-bold text-[var(--primary-color)] duration-300 hover:bg-[hsla(353,100%,68%,0.1)]"
        >
          Back to {med.group}
        </button>

        {neighbours.next ? (
          <button
            type="button"
            onClick={() => onOpen(neighbours.next!.id)}
            title="Next medication"
            className={step}
          >
            <span className="truncate">{neighbours.next.generic}</span>
            <LuArrowRight
              aria-hidden
              className="shrink-0 text-[var(--muted-color)]"
            />
          </button>
        ) : (
          <span aria-hidden className="sm:hidden" />
        )}
      </nav>
    </article>
  );
};

export default MedDetail;
