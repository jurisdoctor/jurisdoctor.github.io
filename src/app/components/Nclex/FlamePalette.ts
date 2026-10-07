// Flame colors for the "new question" glow. Each chapter takes one by its
// position in the chapter list (first chapter -> first color, and so on,
// wrapping after 24), so a chapter's own tile and its questions in the New
// section all burn the same color. Neighbours in the list are kept far apart
// on the color wheel so adjacent chapters never look alike.
//
// `hue` is the color of the flame; each chapter uses the same one for every
// tile, so the color identifies the chapter and is never random.
export interface FlameColor {
  name: string;
  hue: number;
}

export const FLAME_PALETTE: FlameColor[] = [
  // The first twelve sit exactly 30 degrees apart on the color wheel and are
  // ordered so neighbours in the list are far apart; a bank with up to twelve
  // chapter groups never reuses a color or puts two similar ones side by side.
  { name: "Red", hue: 0 },
  { name: "Mint", hue: 150 },
  { name: "Magenta", hue: 300 },
  { name: "Lime", hue: 90 },
  { name: "Indigo", hue: 240 },
  { name: "Ember", hue: 30 },
  { name: "Cyan", hue: 180 },
  { name: "Rose", hue: 330 },
  { name: "Green", hue: 120 },
  { name: "Violet", hue: 270 },
  { name: "Gold", hue: 60 },
  { name: "Azure", hue: 210 },
  // The rest fall between those, for banks with more chapters.
  { name: "Crimson", hue: 345 },
  { name: "Cobalt", hue: 225 },
  { name: "Emerald", hue: 135 },
  { name: "Amber", hue: 45 },
  { name: "Fuchsia", hue: 315 },
  { name: "Sky", hue: 195 },
  { name: "Chartreuse", hue: 105 },
  { name: "Orchid", hue: 285 },
  // And four more for guides with more than twenty categories.
  { name: "Vermilion", hue: 15 },
  { name: "Spring", hue: 165 },
  { name: "Periwinkle", hue: 255 },
  { name: "Olive", hue: 75 },
];

// Where each stop sits relative to the flame's hue, and its saturation and
// lightness: a dark rim, through the hot body, to a pale-white tip. At the
// default hue (28) this reproduces the original ember gradient exactly.
const STOPS: [offset: number, hue: number, sat: number, light: number][] = [
  [0, -24, 90, 38],
  [22, -14, 100, 48],
  [48, 0, 100, 58],
  [70, 10, 100, 62],
  [88, 18, 100, 74],
  [100, 24, 100, 88],
];

const wrap = (hue: number) => ((hue % 360) + 360) % 360;

// `spread` scales how far the stops stray from the base hue. 1 is the
// original red-to-yellow ember; a chapter's flame uses a small value so the
// whole ring reads as that chapter's one color, with only its lightness
// (dark rim to pale tip) changing as the gradient turns.
export const flameStops = (hue: number, spread = 1) =>
  STOPS.map(([offset, shift, sat, light]) => ({
    offset: `${offset}%`,
    color: `hsl(${wrap(hue + shift * spread)}, ${sat}%, ${light}%)`,
  }));

export const flameHueAt = (index: number) =>
  FLAME_PALETTE[
    ((index % FLAME_PALETTE.length) + FLAME_PALETTE.length) %
      FLAME_PALETTE.length
  ].hue;
