"use client";
import {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LuX } from "react-icons/lu";
import {
  COLORS,
  IndexType,
  indexOf,
  keyOf,
  LABELS,
  loadInteractions,
  ORDER,
  PairType,
  shortName,
  Status,
  statusOf,
  Tone,
  toneOf,
} from "./Interactions";
import { MedType } from "./types";

// ---------------------------------------------------------------- geometry
const NODE_H = 38;

// Two canvases: a wide one for laptops, and a tall, narrow one for phones, so
// the labels stay a readable size instead of shrinking with the screen.
const WIDE = { W: 900, H: 560, rx: 335, ry: 200, maxW: 214, font: 15 };
const NARROW = { W: 400, H: 560, rx: 110, ry: 215, maxW: 140, font: 13 };
type Dims = typeof WIDE;

interface NodeType {
  med: MedType;
  label: string;
  x: number;
  y: number;
  w: number;
}

const layout = (meds: MedType[], dims: Dims): NodeType[] => {
  const { W, H } = dims;
  const count = meds.length;
  return meds.map((med, index) => {
    const full = shortName(med);
    const perChar = dims.font * 0.52;
    const fit = Math.floor((dims.maxW - 24) / perChar);
    const label = full.length > fit ? `${full.slice(0, fit - 1)}…` : full;
    const w = Math.min(dims.maxW, Math.max(84, 30 + label.length * perChar));
    // Two sit side by side, one sits in the middle, and the rest go round an
    // ellipse (wider than tall, to match the page) starting from the top.
    const angle =
      count === 2
        ? index === 0
          ? Math.PI
          : 0
        : -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const single = count === 1;
    return {
      med,
      label,
      w,
      x: single ? W / 2 : W / 2 + dims.rx * Math.cos(angle),
      y: single ? H / 2 : H / 2 + dims.ry * Math.sin(angle),
    };
  });
};

interface LineType {
  key: string;
  a: NodeType;
  b: NodeType;
  status: Status;
  tone: Tone;
  pair?: PairType;
  // Where the badge sits along the line. Even-sided rings send several
  // lines through the exact middle, so the badges are spread along them.
  t: number;
}

// ----------------------------------------------------------- text content
const Badge = ({ status }: { status: Status }) => {
  const tone = toneOf(status);
  return (
    <span
      className="inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      style={{
        color: COLORS[tone],
        background: `color-mix(in srgb, ${COLORS[tone]} 16%, transparent)`,
      }}
    >
      {LABELS[status]}
    </span>
  );
};

const Names = ({ a, b }: { a: MedType; b: MedType }) => (
  <span className="font-bold text-[var(--title-color)]">
    {shortName(a)}{" "}
    <span className="font-normal text-[var(--muted-color)]">+</span>{" "}
    {shortName(b)}
  </span>
);

const PairBody = ({
  a,
  b,
  line,
  index,
  full,
}: {
  a: MedType;
  b: MedType;
  line: { status: Status; pair?: PairType };
  index: IndexType;
  full: boolean;
}) => {
  const clean = [a, b]
    .filter((med) => index.file.clean[med.id])
    .map((med) => ({ med, why: index.file.clean[med.id] }));
  const rules = line.pair?.rules ?? [];
  const shown = full ? rules : rules.slice(0, 2);

  return (
    <div className="grid gap-y-3.5">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <Names a={a} b={b} />
        <Badge status={line.status} />
      </div>

      {line.status === "ok" ? (
        <>
          <p className="text-[var(--text-color)]">
            Nothing flagged between these two in this guide.
          </p>
          {clean.map(({ med, why }) => (
            <p key={med.id} className="text-sm text-[var(--muted-color)]">
              <span className="font-bold text-[var(--title-color)]">
                {shortName(med)}:
              </span>{" "}
              {why}
            </p>
          ))}
        </>
      ) : (
        // One block per rule, with room between the title, the explanation
        // and the "Watch" line, and a divider when a pair has several rules.
        <div className="grid gap-y-5">
          {shown.map((rule, position) => {
            const def = index.rules.get(rule.rule);
            return (
              <div
                key={rule.rule}
                className={`grid gap-y-2 ${
                  position > 0
                    ? "border-t border-solid border-[var(--border-color)] pt-5"
                    : ""
                }`}
              >
                <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm font-bold text-[var(--title-color)]">
                  {def?.name ?? rule.rule}
                  {rule.highest && (
                    <span className="rounded-md bg-[hsla(14, 100%, 57%,0.16)] px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--primary-color)]">
                      Highest-risk pairing
                    </span>
                  )}
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-color)]">
                  {rule.why}
                </p>
                {full && def?.watch && (
                  <p className="text-sm leading-relaxed text-[var(--muted-color)]">
                    <span className="font-bold text-[var(--title-color)]">
                      Watch:{" "}
                    </span>
                    {def.watch}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!full && rules.length > shown.length && (
        <p className="text-xs italic text-[var(--muted-color)]">
          +{rules.length - shown.length} more — tap the line to read everything
        </p>
      )}
    </div>
  );
};

const jumpTo = (element: Element | null) =>
  element?.scrollIntoView({
    behavior:
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    block: "center",
  });

// ------------------------------------------------------------------- view
const CompareMap = ({
  meds,
  onRemove,
  onClear,
  onOpen,
}: {
  meds: MedType[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpen: (id: string) => void;
}) => {
  const [index, setIndex] = useState<IndexType | null>(null);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<{
    key: string;
    x: number;
    y: number;
  } | null>(null);
  const [pinned, setPinned] = useState<{
    key: string;
    x: number;
    y: number;
  } | null>(null);
  const [focusNode, setFocusNode] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    loadInteractions()
      .then((file) => alive && setIndex(indexOf(file)))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const [narrow, setNarrow] = useState(false);
  const dims = narrow ? NARROW : WIDE;
  const { W, H } = dims;
  const mapShown = meds.length >= 2;
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const measure = () => setNarrow(element.clientWidth < 560);
    measure();
    const watcher = new ResizeObserver(measure);
    watcher.observe(element);
    return () => watcher.disconnect();
  }, [mapShown]);

  const nodes = useMemo(() => layout(meds, dims), [meds, dims]);

  const lines = useMemo<LineType[]>(() => {
    if (!index) return [];
    const out: LineType[] = [];
    nodes.forEach((a, i) => {
      nodes.forEach((b, j) => {
        if (j <= i) return;
        const status = statusOf(index, a.med.id, b.med.id);
        out.push({
          key: keyOf(a.med.id, b.med.id),
          a,
          b,
          status,
          tone: toneOf(status),
          pair: index.pairs.get(keyOf(a.med.id, b.med.id)),
          t: nodes.length <= 3 ? 0.5 : 0.3 + ((i + j) % 3) * 0.1,
        });
      });
    });
    return out;
  }, [index, nodes]);

  // A change to who is in the list invalidates anything pinned or hovered.
  useEffect(() => {
    setHover(null);
    setPinned(null);
    setFocusNode(null);
  }, [meds]);

  const byKey = useMemo(() => new Map(lines.map((l) => [l.key, l])), [lines]);
  const medById = useMemo(() => new Map(meds.map((m) => [m.id, m])), [meds]);

  const counts = useMemo(() => {
    const c = { red: 0, amber: 0, green: 0 };
    lines.forEach((l) => (c[l.tone] += 1));
    return c;
  }, [lines]);

  const sorted = useMemo(
    () =>
      [...lines].sort(
        (x, y) =>
          ORDER[x.status] - ORDER[y.status] ||
          x.a.label.localeCompare(y.a.label),
      ),
    [lines],
  );

  const where = (event: { clientX: number; clientY: number }) => {
    const rect = box.current?.getBoundingClientRect();
    return rect
      ? { x: event.clientX - rect.left, y: event.clientY - rect.top }
      : { x: 0, y: 0 };
  };

  const active = hover ?? pinned;
  const activeLine = active ? byKey.get(active.key) : undefined;

  const enter = (key: string) => (event: PointerEvent) =>
    setHover({ key, ...where(event) });
  const press = (key: string) => (event: MouseEvent | KeyboardEvent) => {
    if ("key" in event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
    }
    event.stopPropagation();
    const at =
      "clientX" in event
        ? where(event)
        : (() => {
            const line = byKey.get(key);
            return line
              ? {
                  x:
                    ((line.a.x + line.b.x) / 2 / W) *
                    (box.current?.clientWidth ?? W),
                  y:
                    ((line.a.y + line.b.y) / 2 / H) *
                    (box.current?.clientHeight ?? H),
                }
              : { x: 0, y: 0 };
          })();
    const unpin = pinned?.key === key;
    setPinned(unpin ? null : { key, ...at });
    setHover(null);
    // The popup is a quick peek; the full text reads better in its block
    // below, so a click takes you there.
    if (!unpin) jumpTo(document.getElementById(`pair-${key}`));
  };

  if (failed) {
    return (
      <div className="rounded-2xl bg-[var(--container-color)] p-7 text-center text-[var(--muted-color)]">
        The interaction data couldn&apos;t be loaded. Refresh to try again.
      </div>
    );
  }

  const boxWidth = box.current?.clientWidth ?? 900;
  const tipWidth = Math.min(352, boxWidth - 16);

  return (
    <div className="grid gap-y-5">
      {/* Who is being compared */}
      <section className="rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
            Comparing {meds.length}{" "}
            {meds.length === 1 ? "medication" : "medications"}
          </h2>
          {meds.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-bold text-[var(--muted-color)] duration-300 hover:text-[var(--primary-color)]"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {meds.map((med) => (
            <span
              key={med.id}
              className="inline-flex items-center gap-x-1 rounded-md bg-[var(--chip-blue)] py-1 pl-4 pr-1.5 text-sm font-bold text-[var(--title-color)]"
            >
              <button
                type="button"
                onClick={() => onOpen(med.id)}
                className="hover:underline"
                title={`Open ${med.generic}`}
              >
                {shortName(med)}
              </button>
              <button
                type="button"
                onClick={() => onRemove(med.id)}
                aria-label={`Remove ${med.generic}`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted-color)] duration-300 hover:bg-[var(--body-color)] hover:text-[var(--title-color)]"
              >
                <LuX size={14} />
              </button>
            </span>
          ))}
        </div>
        {meds.length < 2 && (
          <p className="mt-3 text-[var(--text-color)]">
            {meds.length === 0
              ? "Nothing here yet. "
              : "Add at least one more medication. "}
            Open any medication and tap the <span className="font-bold">+</span>{" "}
            in the top right of its card to add it.
          </p>
        )}
      </section>

      {meds.length >= 2 && (
        <>
          {/* Verdict + legend */}
          <section className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] px-5 py-4 sm:px-4">
            <p className="font-bold text-[var(--title-color)]">
              {!index
                ? "Checking…"
                : counts.red > 0
                  ? `${counts.red} ${counts.red === 1 ? "combination is" : "combinations are"} flagged red`
                  : counts.amber > 0
                    ? "No red flags, but some need care"
                    : "No known interactions between these"}
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[var(--text-color)]">
              {(
                [
                  ["red", "Avoid or high risk", counts.red],
                  ["amber", "Use with care", counts.amber],
                  ["green", "No known interaction", counts.green],
                ] as const
              ).map(([tone, label, n]) => (
                <li key={tone} className="inline-flex items-center gap-x-2">
                  <span
                    aria-hidden
                    className="h-1 w-6 rounded-full"
                    style={{ background: COLORS[tone] }}
                  />
                  {label}
                  {index && (
                    <span className="text-[var(--muted-color)]">({n})</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* The map */}
          <section className="rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-3 sm:p-1">
            <div ref={box} className="relative">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="block h-auto w-full select-none"
                role="group"
                aria-label="Interaction map. Each line joins two medications."
                onClick={() => setPinned(null)}
              >
                {/* lines */}
                {lines.map((line, i) => {
                  const dim =
                    (focusNode &&
                      line.a.med.id !== focusNode &&
                      line.b.med.id !== focusNode) ||
                    (pinned && !hover && pinned.key !== line.key);
                  const on = active?.key === line.key;
                  const color = COLORS[line.tone];
                  const mx = line.a.x + (line.b.x - line.a.x) * line.t;
                  const my = line.a.y + (line.b.y - line.a.y) * line.t;
                  const width =
                    line.status === "avoid" ? 5 : line.status === "ok" ? 3 : 4;
                  return (
                    <g
                      key={line.key}
                      style={{
                        opacity: dim ? 0.22 : 1,
                        transition: "opacity 0.25s",
                      }}
                    >
                      <line
                        x1={line.a.x}
                        y1={line.a.y}
                        x2={line.b.x}
                        y2={line.b.y}
                        stroke={color}
                        strokeWidth={on ? width + 3 : width}
                        strokeLinecap="round"
                        strokeDasharray={
                          line.status === "moderate" ? "2 9" : undefined
                        }
                        pathLength={line.status === "moderate" ? undefined : 1}
                        className={
                          line.status === "moderate" ? "map-fade" : "map-line"
                        }
                        style={
                          {
                            "--line-delay": `${i * 0.04}s`,
                            transition: "stroke-width 0.2s",
                            filter: on
                              ? `drop-shadow(0 0 6px ${color})`
                              : undefined,
                          } as CSSProperties
                        }
                      />
                      {/* a wide, invisible stroke so a thin line is easy to hit */}
                      <line
                        x1={line.a.x}
                        y1={line.a.y}
                        x2={line.b.x}
                        y2={line.b.y}
                        stroke="transparent"
                        strokeWidth={26}
                        strokeLinecap="round"
                        tabIndex={0}
                        role="button"
                        aria-label={`${line.a.med.generic} and ${line.b.med.generic}: ${LABELS[line.status]}. Press for the reason.`}
                        className="cursor-pointer outline-none"
                        onPointerEnter={enter(line.key)}
                        onPointerMove={enter(line.key)}
                        onPointerLeave={() => setHover(null)}
                        onFocus={() => {
                          const rect = box.current?.getBoundingClientRect();
                          if (rect)
                            setHover({
                              key: line.key,
                              x: (mx / W) * rect.width,
                              y: (my / H) * rect.height,
                            });
                        }}
                        onBlur={() => setHover(null)}
                        onClick={press(line.key)}
                        onKeyDown={press(line.key)}
                      />
                      {/* a badge with a different shape per state, so the
                          colors are never the only clue */}
                      <circle
                        cx={mx}
                        cy={my}
                        r={on ? 15 : 12}
                        fill="var(--container-color)"
                        stroke={color}
                        strokeWidth={2.5}
                        pointerEvents="none"
                        style={{ transition: "r 0.2s" }}
                      />
                      <g
                        transform={`translate(${mx - 7} ${my - 7})`}
                        stroke={color}
                        pointerEvents="none"
                        fill="none"
                        strokeWidth={2.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {line.tone === "green" ? (
                          <path d="M1.5 7.5 L5.5 11.5 L12.5 3" />
                        ) : line.tone === "amber" ? (
                          <path d="M2 7 H12" />
                        ) : (
                          <path d="M2.5 2.5 L11.5 11.5 M11.5 2.5 L2.5 11.5" />
                        )}
                      </g>
                    </g>
                  );
                })}

                {/* medications */}
                {nodes.map((node) => {
                  const lit = focusNode === node.med.id;
                  const faded = focusNode && !lit;
                  return (
                    <g
                      key={node.med.id}
                      transform={`translate(${node.x} ${node.y})`}
                      style={{
                        opacity: faded ? 0.55 : 1,
                        transition: "opacity 0.25s",
                      }}
                      className="cursor-pointer"
                      onPointerEnter={() => setFocusNode(node.med.id)}
                      onPointerLeave={() => setFocusNode(null)}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpen(node.med.id);
                      }}
                    >
                      <rect
                        x={-node.w / 2}
                        y={-NODE_H / 2}
                        width={node.w}
                        height={NODE_H}
                        rx={NODE_H / 2}
                        fill="var(--chip-blue)"
                        stroke={
                          lit
                            ? "var(--chip-blue-border)"
                            : "var(--border-color)"
                        }
                        strokeWidth={lit ? 2.5 : 1.5}
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={dims.font}
                        fontWeight={700}
                        fill="var(--title-color)"
                        style={{ fontFamily: "inherit" }}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* hover / pinned popup */}
              {active && activeLine && index && (
                <div
                  role="tooltip"
                  className="pointer-events-none absolute z-20 rounded-2xl border border-solid p-4 text-left shadow-2xl backdrop-blur"
                  style={{
                    width: tipWidth,
                    left: Math.min(
                      Math.max(active.x - tipWidth / 2, 8),
                      boxWidth - tipWidth - 8,
                    ),
                    top: active.y < 190 ? active.y + 22 : undefined,
                    bottom:
                      active.y < 190
                        ? undefined
                        : (box.current?.clientHeight ?? H) - active.y + 18,
                    background: "var(--container-color)",
                    borderColor: COLORS[activeLine.tone],
                  }}
                >
                  <PairBody
                    a={activeLine.a.med}
                    b={activeLine.b.med}
                    line={activeLine}
                    index={index}
                    full={false}
                  />
                </div>
              )}
            </div>
            <p className="px-3 pb-2 pt-1 text-center text-xs text-[var(--muted-color)]">
              Hover or tap a line for the reason · click a medication to open it
            </p>
          </section>

          {/* Everything, in words: works without a mouse, and on a phone */}
          {index && (
            <section className="rounded-2xl border border-solid border-[var(--border-color)] bg-[var(--container-color)] p-5 sm:p-4">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-[var(--muted-color)]">
                Every combination
              </h2>
              <ul className="grid gap-y-3">
                {sorted.map((line) => {
                  const selected = pinned?.key === line.key;
                  return (
                    <li
                      key={line.key}
                      id={`pair-${line.key}`}
                      className={`rounded-xl border-l-4 border-solid bg-[var(--body-color)] p-4 duration-300 ${
                        selected ? "pair-flash" : ""
                      }`}
                      style={
                        {
                          borderColor: COLORS[line.tone],
                          "--flash": COLORS[line.tone],
                          outline: selected
                            ? `2px solid ${COLORS[line.tone]}`
                            : undefined,
                        } as CSSProperties
                      }
                    >
                      <PairBody
                        a={medById.get(line.a.med.id)!}
                        b={medById.get(line.b.med.id)!}
                        line={line}
                        index={index}
                        full
                      />
                      {selected && (
                        <button
                          type="button"
                          onClick={() => jumpTo(box.current)}
                          className="mt-3 text-sm font-bold text-[var(--chip-blue-border)] duration-300 hover:underline"
                        >
                          ↑ Show on the map
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default CompareMap;
