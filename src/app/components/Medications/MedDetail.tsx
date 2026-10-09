"use client";
import { CSSProperties, ReactNode } from "react";
import { LuArrowLeft, LuArrowRight, LuCheck, LuPlus } from "react-icons/lu";
import { Critical, Headline } from "./Emphasis";
import {
  GroupItem,
  LinkItem,
  MedType,
  PairItem,
  SectionType,
  StepItem,
} from "./types";

// The page is drawn from the medication's own `sections` array: the data says
// which sections exist, in what order, and how each is laid out (see
// types.ts). Nothing here writes drug content.

const plain =
  "rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-5 sm:p-4";

const Heading = ({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: "danger" | "caution";
}) => (
  <h3
    className={`mb-3 text-xs font-bold uppercase tracking-wide ${
      tone === "danger"
        ? "text-[var(--primary-color)]"
        : tone === "caution"
          ? "text-[hsl(38,100%,60%)] [:root[data-theme=light]_&]:text-[hsl(30,90%,28%)]"
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
    className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-bold ${
      tone === "danger"
        ? "bg-[hsla(14, 100%, 57%,0.16)] text-[var(--primary-color)]"
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

// "(CV) peripheral edema*, angina" -> system "CV", effects ["peripheral
// edema*", "angina"]. Commas inside parentheses stay inside their effect.
const splitEffect = (line: string) => {
  const match = line.match(/^\(([^)]+)\)\s*(.*)$/);
  const system = match ? match[1] : "";
  const rest = match ? match[2] : line;
  const effects: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of rest) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (char === "," && depth === 0) {
      effects.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) effects.push(current.trim());
  return { system, effects };
};

const Pairs = ({ items }: { items: PairItem[] }) => (
  <dl className="grid gap-y-2.5">
    {items.map((item) => (
      <div
        key={item.label}
        className="grid grid-cols-[9.5rem_1fr] gap-x-4 sm:grid-cols-1 sm:gap-y-0.5"
      >
        <dt className="text-sm font-bold text-[var(--muted-color)]">
          {item.label}
        </dt>
        <dd className="min-w-0 leading-relaxed text-[var(--title-color)]">
          {item.value}
        </dd>
      </div>
    ))}
  </dl>
);

const Steps = ({ items }: { items: StepItem[] }) => (
  <ol className="grid gap-y-4">
    {items.map((entry, index) => {
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
              <span className="mr-2 rounded-md bg-[hsla(14, 100%, 57%,0.16)] px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--primary-color)]">
                Black box
              </span>
            )}
            <span className="font-bold text-[var(--title-color)]">
              <Consideration line={text} />
            </span>
            {entry.rationale && (
              <span className="mt-1 block text-[var(--text-color)]">
                <span className="italic text-[var(--muted-color)]">Why: </span>
                {entry.rationale}
              </span>
            )}
          </span>
        </li>
      );
    })}
  </ol>
);

// Serious and Common side effects, one row per body system. The first
// group's label shares the heading's line ("SIDE EFFECTS  Serious"); a
// second group gets its own label below. CAPITALS are Davis's marker for
// life-threatening reactions and are shown exactly as written.
const Grouped = ({ title, groups }: { title: string; groups: GroupItem[] }) => (
  <>
    {groups.map((group, index) => {
      const serious = group.label.toLowerCase() === "serious";
      return (
        <div key={group.label} className={index > 0 ? "mt-6" : ""}>
          {index === 0 ? (
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                {title}
              </h3>
              <span
                className={`text-sm font-bold ${
                  serious
                    ? "text-[var(--primary-color)]"
                    : "text-[var(--title-color)]"
                }`}
              >
                {group.label}
              </span>
            </div>
          ) : (
            <p
              className={`mb-3 text-sm font-bold ${
                serious
                  ? "text-[var(--primary-color)]"
                  : "text-[var(--title-color)]"
              }`}
            >
              {group.label}
            </p>
          )}
          <ul className="grid gap-y-3">
            {group.items.map((line, position) => {
              const { system, effects } = splitEffect(line);
              return (
                <li
                  key={position}
                  className="grid grid-cols-[6.5rem_1fr] items-start gap-x-4 sm:grid-cols-[4.5rem_1fr] sm:gap-x-2.5"
                >
                  <span className="py-1 text-sm font-bold leading-snug text-[var(--title-color)]">
                    {system}
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {effects.map((effect) => (
                      <span
                        key={effect}
                        className={`rounded-lg px-2.5 py-1 text-sm leading-snug ${
                          serious
                            ? "bg-[hsla(14, 100%, 57%,0.14)] text-[var(--title-color)]"
                            : "bg-[var(--body-color)] text-[var(--text-color)]"
                        }`}
                      >
                        {effect}
                      </span>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      );
    })}
  </>
);

const SEVERITY: Record<LinkItem["severity"], { label: string; color: string }> =
  {
    avoid: { label: "Avoid", color: "hsl(14, 100%, 57%)" },
    high: { label: "High risk", color: "hsl(14, 100%, 57%)" },
    moderate: { label: "Use with care", color: "hsl(38, 96%, 54%)" },
  };

// Interactions with other medications in the guide. Each name opens that
// medication; the rule is the reason in a few words.
const Linked = ({
  items,
  onOpen,
}: {
  items: LinkItem[];
  onOpen: (id: string) => void;
}) => (
  <div className="grid gap-y-5">
    {(["avoid", "high", "moderate"] as const).map((level) => {
      const rows = items.filter((entry) => entry.severity === level);
      if (!rows.length) return null;
      return (
        <div key={level}>
          <p
            className="mb-2 text-sm font-bold"
            style={{ color: SEVERITY[level].color }}
          >
            {SEVERITY[level].label}{" "}
            <span className="font-normal text-[var(--muted-color)]">
              ({rows.length})
            </span>
          </p>
          <ul className="grid grid-cols-3 gap-x-6 gap-y-2 lg:grid-cols-2 sm:grid-cols-1">
            {rows.map((row) => (
              <li
                key={`${row.with_id}-${row.rule}`}
                className="flex items-baseline gap-x-2"
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 translate-y-[-1px] rounded-full"
                  style={{ background: SEVERITY[level].color }}
                />
                <span className="min-w-0 leading-snug">
                  <button
                    type="button"
                    onClick={() => onOpen(row.with_id)}
                    className="text-left font-bold text-[var(--title-color)] hover:text-[var(--chip-blue-border)] hover:underline"
                  >
                    {row.with}
                  </button>
                  <span className="block text-sm text-[var(--muted-color)]">
                    {row.rule}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    })}
  </div>
);

// The medication card: one card per drug, drawn from its `flashcard` block —
// name, trade name, indication, action, classes, side effects and nursing
// considerations, each as a labelled row. Everything on it is a value from
// the data. The group's color tints the header and the labels.
const Label = ({ children }: { children: ReactNode }) => (
  <span
    className="inline-flex w-fit items-center rounded-xl px-3.5 py-1.5 text-sm font-bold"
    style={{
      color: "var(--accent-ink)",
      background: "color-mix(in srgb, var(--accent) 20%, transparent)",
    }}
  >
    {children}
  </span>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid grid-cols-[11.5rem_1fr] items-baseline gap-x-6 gap-y-2 border-t border-solid border-[var(--border-color)] px-7 py-4 first:border-t-0 sm:grid-cols-1 sm:px-5">
    <Label>{label}</Label>
    <div className="min-w-0 text-lg leading-snug text-[var(--title-color)] sm:text-base">
      {children}
    </div>
  </div>
);

// "Contraindicated: ...", "Antidote: ..." and "BLACK BOX: ..." keep their
// text exactly; only the lead-in is picked out.
const Consideration = ({ line }: { line: string }) => {
  // A lead-in is one of the named ones, or an ALL-CAPS label such as
  // "VITALS BEFORE AND AFTER:" or "RESPIRATORY RATE BEFORE AND AFTER:".
  const match = line.match(
    /^(BLACK BOX|HIGH ALERT|Contraindicated|Antidote|[A-Z][A-Z ]{2,}[A-Z]):\s*(.*)$/,
  );
  if (!match) return <>{line}</>;
  const tone =
    match[1] === "BLACK BOX"
      ? "text-[var(--primary-color)]"
      : match[1] === "HIGH ALERT"
        ? "text-[hsl(38,100%,60%)] [:root[data-theme=light]_&]:text-[hsl(30,90%,28%)]"
        : "text-[var(--title-color)]";
  return (
    <>
      <span className={`font-bold ${tone}`}>{match[1]}:</span> {match[2]}
    </>
  );
};

const Effects = ({
  label,
  lines,
  tone,
}: {
  label: string;
  lines: string[];
  tone: "serious" | "common";
}) => (
  <div>
    <p
      className={`mb-2 text-sm font-bold ${
        tone === "serious"
          ? "text-[var(--primary-color)]"
          : "text-[var(--muted-color)]"
      }`}
    >
      {label}
    </p>
    <ul className="grid gap-y-2.5">
      {lines.map((line, position) => {
        const { system, effects } = splitEffect(line);
        return (
          <li
            key={position}
            className="grid grid-cols-[5.5rem_1fr] items-start gap-x-3 sm:grid-cols-[4.5rem_1fr] sm:gap-x-2.5"
          >
            <span className="py-1 text-sm font-bold leading-snug text-[var(--muted-color)]">
              {system}
            </span>
            <span className="flex flex-wrap gap-1.5">
              {effects.map((effect) => (
                <span
                  key={effect}
                  className={`rounded-lg px-2.5 py-1 text-base leading-snug sm:text-sm ${
                    tone === "serious"
                      ? "bg-[hsla(14, 100%, 57%,0.14)] text-[var(--title-color)]"
                      : "bg-[var(--body-color)] text-[var(--text-color)]"
                  }`}
                >
                  {effect}
                </span>
              ))}
            </span>
          </li>
        );
      })}
    </ul>
  </div>
);

// Below the card, the sections that add to it: why this drug, what rules it
// out, how you know it's working, and the safety flags. The data also has
// "interactions" and "notes" sections; they are left off the page on purpose
// (interactions live in the Interaction check).
// (Name, indication, action, classes and side effects are already on the card.)
const ROWS: string[][] = [
  ["why", "working"],
  ["contraindications", "cautions"],
  ["safety"],
  ["nursing"],
];

const step =
  "inline-flex max-w-[16rem] items-center gap-x-2 rounded-md border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-4 py-2.5 text-sm font-bold text-[var(--title-color)] duration-300 hover:border-[var(--chip-blue-border)]";

const MedDetail = ({
  med,
  neighbours,
  onOpen,
  onBack,
  picked,
  pickedFull,
  onPick,
  accent,
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
  // The color of this drug's group.
  accent: string;
}) => {
  const byId = new Map(med.sections.map((section) => [section.id, section]));
  // The card reads the medication's `flashcard` block. If a field is ever
  // missing from the data, the page falls back to the same fact from another
  // field (or leaves the row out) rather than failing to draw.
  const flash = med.flashcard;
  const card = {
    name: flash?.name ?? med.generic,
    trade_name: flash?.trade_name ?? med.brand.join(", "),
    indication: flash?.indication ?? med.use.primary,
    action: flash?.action ?? "",
    therapeutic_class: flash?.therapeutic_class ?? med.drug_class.join(", "),
    pharmacologic_class: flash?.pharmacologic_class ?? med.subclass,
    serious: flash?.side_effects?.serious ?? [],
    common: flash?.side_effects?.common ?? [],
    nursing: flash?.nursing_considerations ?? [],
  };
  const badges =
    med.sections.find(
      (section): section is Extract<SectionType, { type: "pairs" }> =>
        section.type === "pairs" && !!section.badges?.length,
    )?.badges ?? [];

  const body = (section: SectionType): ReactNode => {
    switch (section.type) {
      case "pairs":
        return <Pairs items={section.items} />;
      case "steps":
        return <Steps items={section.items} />;
      case "grouped":
        return <Grouped title={section.title} groups={section.groups} />;
      case "linked":
        return <Linked items={section.items} onOpen={onOpen} />;
      default:
        return section.id === "notes" ? (
          <ul className="grid gap-y-2 italic text-[var(--text-color)]">
            {section.items.map((note, index) => (
              <li key={index} className="leading-relaxed">
                {note}
              </li>
            ))}
          </ul>
        ) : (
          <Bullets items={section.items} />
        );
    }
  };

  const sectionCard = (section: SectionType) => {
    const danger = section.id === "safety";
    const title =
      section.id === "nursing"
        ? "Nursing considerations, with the reasons"
        : section.title;
    return (
      <section
        key={section.id}
        className={
          danger
            ? "rounded-2xl border-2 border-solid border-[var(--primary-color)] bg-[linear-gradient(hsla(14, 100%, 57%,0.08),hsla(14, 100%, 57%,0.08)),var(--container-color)] p-5 sm:p-4"
            : plain
        }
      >
        {section.type !== "grouped" && (
          <Heading
            tone={
              danger
                ? "danger"
                : section.id === "cautions"
                  ? "caution"
                  : undefined
            }
          >
            {title}
          </Heading>
        )}
        {body(section)}
      </section>
    );
  };

  return (
    <article
      className="grid gap-y-4"
      style={
        {
          "--accent": accent,
          "--accent-ink": `color-mix(in srgb, ${accent} 70%, var(--title-color))`,
        } as CSSProperties
      }
    >
      <div className="overflow-hidden rounded-md border border-solid border-[var(--border-color)] bg-[var(--container-color)] shadow-xl">
        <header
          className="relative px-7 pb-6 pt-7 sm:px-5 sm:pb-5 sm:pt-5"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent) 34%, var(--container-color)) 0%, color-mix(in srgb, var(--accent) 8%, var(--container-color)) 100%)",
          }}
        >
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
            className={`absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-solid backdrop-blur duration-300 disabled:cursor-not-allowed disabled:opacity-40 sm:right-3 sm:top-3 ${
              picked
                ? "border-[hsl(150,62%,46%)] bg-[hsl(150,62%,46%)] text-white hover:brightness-110"
                : "border-[var(--title-color)] bg-[var(--container-color)] text-[var(--title-color)] hover:scale-105"
            }`}
          >
            {picked ? <LuCheck size={22} /> : <LuPlus size={24} />}
          </button>

          <p
            className="mb-1 text-xs font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--accent-ink)" }}
          >
            {med.group}
          </p>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pr-14">
            <h2 className="text-5xl font-bold tracking-tight text-[var(--title-color)] sm:text-4xl">
              {card.name}
            </h2>
            <span className="text-lg italic text-[var(--text-color)]">
              {med.pronunciation}
            </span>
          </div>
          {badges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Pill
                  key={badge}
                  tone={badge.startsWith("BLACK") ? "danger" : "alert"}
                >
                  {badge.startsWith("HIGH") ? "⚠ " : ""}
                  {badge}
                </Pill>
              ))}
            </div>
          )}
        </header>

        {med.highlight.critical && (
          <div className="crit-glow border-y border-solid border-[var(--primary-color)] bg-[linear-gradient(hsla(14, 100%, 57%,0.1),hsla(14, 100%, 57%,0.1)),var(--container-color)] px-7 py-4 sm:px-5">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[var(--primary-color)]">
              Do not miss
            </p>
            <Critical
              text={med.highlight.critical}
              className="text-lg sm:text-base"
            />
          </div>
        )}

        <div>
          <Row label="Name">
            <span className="font-bold">{card.name}</span>
          </Row>
          <Row label="Trade name">{card.trade_name}</Row>
          <Row label="Indication">
            <span className="font-bold">
              <Headline text={card.indication} />
            </span>
          </Row>
          {card.action && <Row label="Action">{card.action}</Row>}
          <Row label="Therapeutic class">{card.therapeutic_class}</Row>
          <Row label="Pharmacologic class">{card.pharmacologic_class}</Row>
          {(card.serious.length > 0 || card.common.length > 0) && (
            <Row label="Side effects">
              <div className="grid gap-y-5">
                {card.serious.length > 0 && (
                  <Effects
                    label="Serious"
                    lines={card.serious}
                    tone="serious"
                  />
                )}
                {card.common.length > 0 && (
                  <Effects label="Common" lines={card.common} tone="common" />
                )}
              </div>
            </Row>
          )}
          {card.nursing.length > 0 && (
            <div className="border-t border-solid border-[var(--border-color)] px-7 py-5 sm:px-5">
              <Label>Nursing considerations</Label>
              <ul className="mt-4 grid gap-y-3">
                {card.nursing.map((line, position) => (
                  <li
                    key={position}
                    className="flex gap-x-3 text-lg leading-snug text-[var(--text-color)] sm:text-base"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.6em] h-2 w-2 shrink-0 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                    <span className="min-w-0">
                      <Consideration line={line} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {ROWS.map((ids) => {
        const present = ids.flatMap((id) => {
          const section = byId.get(id);
          return section ? [section] : [];
        });
        if (!present.length) return null;
        return present.length > 1 ? (
          <div
            key={ids.join("+")}
            className="grid grid-cols-2 gap-4 lg:grid-cols-1"
          >
            {present.map(sectionCard)}
          </div>
        ) : (
          sectionCard(present[0])
        );
      })}

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
          className="rounded-md border-[1px] border-solid border-[var(--primary-color)] bg-transparent px-6 py-2.5 text-sm font-bold text-[var(--primary-color)] duration-300 hover:bg-[hsla(14, 100%, 57%,0.1)]"
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
