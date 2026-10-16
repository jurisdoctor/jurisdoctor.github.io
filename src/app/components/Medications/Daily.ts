import { MedType } from "./types";

const DAY_MS = 86_400_000;

// Whole days since 1 Jan 1970 by the calendar date on this device, so the
// medication changes at the viewer's own midnight.
export const dayNumber = (date: Date) =>
  Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
  );

// A date key for remembering which day the popup was dismissed ("2026-10-14").
export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// A small seeded random number generator (mulberry32): the same seed always
// gives the same run of numbers.
const generator = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const SALT = 20261014;

// One cycle: every medication once, in random order, never two of the same
// category in a row (and not starting with the category the last cycle ended
// on). Categories are picked in proportion to how many of their medications
// are left, except that a category holding more than half of what remains is
// picked as soon as it can be, so the end of the cycle can always be arranged.
const arrange = (meds: MedType[], cycle: number, after: string | null) => {
  const next = generator(SALT + cycle * 7919);
  const pools = new Map<string, MedType[]>();
  meds.forEach((med) => {
    const pool = pools.get(med.group) ?? [];
    pool.push(med);
    pools.set(med.group, pool);
  });
  pools.forEach((pool) => {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  });

  const order: MedType[] = [];
  let left = meds.length;
  let previous = after;
  while (left > 0) {
    const open = Array.from(pools.entries()).filter(
      ([, pool]) => pool.length > 0,
    );
    const allowed = open.filter(([group]) => group !== previous);
    const choices = allowed.length ? allowed : open;
    const crowded = choices.find(([, pool]) => pool.length * 2 > left);
    let pick = crowded;
    if (!pick) {
      let roll =
        next() * choices.reduce((sum, [, pool]) => sum + pool.length, 0);
      pick =
        choices.find(([, pool]) => (roll -= pool.length) < 0) ?? choices[0];
    }
    const med = pick[1].pop() as MedType;
    order.push(med);
    previous = med.group;
    left -= 1;
  }
  return order;
};

export const medOfTheDay = (meds: MedType[], date: Date): MedType | null => {
  if (!meds.length) return null;
  const base = [...meds].sort((a, b) => a.id.localeCompare(b.id));
  const day = dayNumber(date);
  const cycle = Math.floor(day / base.length);
  let last: string | null = null;
  let order: MedType[] = [];
  for (let k = 0; k <= cycle; k++) {
    order = arrange(base, k, last);
    last = order[order.length - 1].group;
  }
  return order[day - cycle * base.length];
};
