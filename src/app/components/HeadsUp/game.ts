import { useSaved } from "../DosageCalculations/Saved";
import { CATEGORIES } from "./data";

export * from "./data";

export const TITLE = "Culture Project: Heads Up! Philippines!";
export const DIGEST =
  "c63b9dfff2edf3cdb6e137831a8fa89188949d78611730c431101a0f94cce095";
export const MIN_TEAMS = 2;
export const MAX_TEAMS = 5;
export const PLAYERS = 7;
export const NEEDED = 3;
export const SKIP_SECONDS = 15;
export const FLIP_MS = 2000;

export type CardId = "red" | "blue" | "yellow" | "green" | "pink";

export const CARDS: { id: CardId; label: string; color: string }[] = [
  { id: "red", label: "Red", color: "#e0463a" },
  { id: "blue", label: "Blue", color: "#3b7ddd" },
  { id: "yellow", label: "Yellow", color: "#eab72b" },
  { id: "green", label: "Green", color: "#2f9e5f" },
  { id: "pink", label: "Pink", color: "#e2689f" },
];

export interface TurnType {
  team: number;
  card: CardId;
  slug: string;
  seconds: number;
  correct: number;
}

export interface ActiveType {
  team: number;
  card: CardId;
  slug: string;
}

export type Stage = "rules" | "teams" | "cards";

export interface StateType {
  key: string;
  stage: Stage;
  teams: string[];
  deal: Record<CardId, string> | null;
  turns: TurnType[];
  active: ActiveType | null;
}

const fresh = (): StateType => ({
  key: "",
  stage: "rules",
  teams: Array.from({ length: MIN_TEAMS }, () => ""),
  deal: null,
  turns: [],
  active: null,
});

const valid = (saved: StateType) =>
  !!saved &&
  typeof saved === "object" &&
  typeof saved.key === "string" &&
  (saved.stage === "rules" ||
    saved.stage === "teams" ||
    saved.stage === "cards") &&
  Array.isArray(saved.teams) &&
  saved.teams.length >= MIN_TEAMS &&
  saved.teams.length <= MAX_TEAMS &&
  saved.teams.every((team) => typeof team === "string") &&
  (saved.deal === null || typeof saved.deal === "object") &&
  Array.isArray(saved.turns) &&
  (saved.active === null || typeof saved.active === "object");

export const useGame = () =>
  useSaved<StateType>("headsup:state:v1", fresh, valid);

export const shuffled = <T>(items: T[]) => {
  const order = [...items];
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

export const dealCards = (): Record<CardId, string> => {
  const order = shuffled(CATEGORIES.map((entry) => entry.slug));
  return Object.fromEntries(
    CARDS.map((card, index) => [card.id, order[index]]),
  ) as Record<CardId, string>;
};

const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth"];
export const ordinal = (index: number) => ORDINALS[index] ?? `${index + 1}th`;

export const clock = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, "0")}`;
};

export const hash = async (word: string) => {
  const bytes = new TextEncoder().encode(word);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const standings = (turns: TurnType[]) =>
  [...turns].sort((a, b) => b.correct - a.correct || a.seconds - b.seconds);

export const primary =
  "inline-block rounded-md border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-[var(--on-primary)] shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none";
export const ghost =
  "inline-flex items-center gap-x-2 rounded-md border-[1px] border-solid border-transparent bg-[color-mix(in_srgb,var(--primary-color)_16%,transparent)] px-6 py-3 font-bold leading-4 text-[var(--primary-color)]";
export const field =
  "h-14 w-full rounded-xl border border-solid border-transparent bg-[var(--body-color)] px-5 text-[var(--title-color)] shadow-inner outline-none duration-300 placeholder:text-[var(--muted-color)] focus:border-[var(--chip-blue-border)]";
