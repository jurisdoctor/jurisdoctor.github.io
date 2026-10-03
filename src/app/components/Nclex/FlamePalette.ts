// Flame colors for the "new question" glow. Each chapter takes one by its
// position in the chapter list (first chapter -> first color, and so on,
// wrapping after 20), so a chapter's own tile and its questions in the New
// section all burn the same color. Neighbours in the list are kept far apart
// on the color wheel so adjacent chapters never look alike.
//
// `hue` is the middle of the flame (the orange-ish stop in the original
// ember look); the Glow component spreads the rest of its gradient around it.
export interface FlameColor {
  name: string;
  hue: number;
}

export const FLAME_PALETTE: FlameColor[] = [
  { name: "Ember", hue: 28 },
  { name: "Cobalt", hue: 220 },
  { name: "Lime", hue: 85 },
  { name: "Magenta", hue: 315 },
  { name: "Teal", hue: 175 },
  { name: "Gold", hue: 46 },
  { name: "Violet", hue: 265 },
  { name: "Crimson", hue: 355 },
  { name: "Sky", hue: 195 },
  { name: "Chartreuse", hue: 65 },
  { name: "Rose", hue: 335 },
  { name: "Indigo", hue: 240 },
  { name: "Green", hue: 130 },
  { name: "Scarlet", hue: 10 },
  { name: "Orchid", hue: 285 },
  { name: "Mint", hue: 155 },
  { name: "Amber", hue: 36 },
  { name: "Azure", hue: 207 },
  { name: "Fuchsia", hue: 303 },
  { name: "Moss", hue: 100 },
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

export const flameStops = (hue: number) =>
  STOPS.map(([offset, shift, sat, light]) => ({
    offset: `${offset}%`,
    color: `hsl(${wrap(hue + shift)}, ${sat}%, ${light}%)`,
  }));

export const flameHueAt = (index: number) =>
  FLAME_PALETTE[
    ((index % FLAME_PALETTE.length) + FLAME_PALETTE.length) %
      FLAME_PALETTE.length
  ].hue;
