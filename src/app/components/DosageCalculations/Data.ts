export interface PrefixType {
  name: string;
  meaning: string;
  lines: string[];
}

export const Prefixes: PrefixType[] = [
  {
    name: "Micro-",
    meaning: "One millionth (u)",
    lines: ["1 gram = 1,000,000 micrograms", "1/1,000,000 g = 1 ug (mcg)*"],
  },
  {
    name: "Milli-",
    meaning: "One thousandth (m)",
    lines: [
      "1 gram = 1,000 milligrams",
      "1/1,000 g = 1 mg",
      "1 liter = 1,000 milliliters",
      "1/1,000 L = 1 mL",
      "1 meter = 1,000 millimeters",
      "1/1,000 m = 1 mm",
    ],
  },
  {
    name: "Centi-",
    meaning: "One hundredth (c)",
    lines: ["1 meter = 100 centimeters", "1/100 m = 1 cm"],
  },
  {
    name: "Deci-",
    meaning: "One tenth (d)",
    lines: ["1 liter = 10 deciliters", "1/10 L = 1 dL"],
  },
  {
    name: "Kilo-",
    meaning: "One thousand (k)",
    lines: ["1,000 grams = 1 kilogram", "1/1,000 kg = 1 g"],
  },
];

export interface RowType {
  left: string;
  right: string;
}

export const Household: RowType[] = [
  { left: "1 pound (lb)", right: "16 ounces (oz)" },
  { left: "1 tablespoon (Tbsp)", right: "3 teaspoons (tsp)" },
  { left: "1 cup (c)", right: "8 fluid ounces (fl oz)" },
  { left: "1 pint (pt)", right: "2 cups (c)" },
  { left: "1 quart (qt)", right: "2 pints (pts)" },
  { left: "1 gallon (gal)", right: "4 quarts (qts)" },
  { left: "1 foot (ft)", right: "12 inches (in)" },
];

export const MetricToHousehold: RowType[] = [
  { left: "1 kilogram (kg)", right: "2.2 pounds (lbs)" },
  { left: "30 milliliters (mL)", right: "1 fluid ounce (fl oz)" },
  { left: "15 milliliters (mL)", right: "1 tablespoon (Tbsp)" },
  { left: "5 milliliters (mL)", right: "1 teaspoon (tsp)" },
  { left: "2.54 centimeters (cm)", right: "1 inch (in)" },
];

export type FamilyType = "mass" | "volume" | "length" | "household";

export interface LadderType {
  family: FamilyType;
  title: string;
  /** the whole ladder in one line, biggest unit first */
  chain?: string[];
  /** the equalities worth knowing cold */
  keys: string[];
}

export const Ladders: LadderType[] = [
  {
    family: "mass",
    title: "Mass",
    chain: ["1 g", "10 dg", "100 cg", "1,000 mg", "1,000,000 mcg"],
    keys: ["1 kg = 1,000 g", "1 g = 1,000 mg", "1 mg = 1,000 mcg"],
  },
  {
    family: "volume",
    title: "Volume",
    chain: ["1 L", "10 dL", "100 cL", "1,000 mL"],
    keys: ["1 L = 1,000 mL", "1 L = 10 dL", "1 dL = 100 mL"],
  },
  {
    family: "length",
    title: "Length",
    chain: ["1 m", "10 dm", "100 cm", "1,000 mm"],
    keys: ["1 m = 100 cm", "1 m = 1,000 mm", "1 cm = 10 mm"],
  },
  {
    family: "household",
    title: "Household",
    keys: [
      "1 Tbsp = 3 tsp",
      "1 c = 8 fl oz",
      "1 pt = 2 c",
      "1 qt = 2 pt",
      "1 gal = 4 qt",
      "1 lb = 16 oz",
    ],
  },
];

export interface RuleType {
  group: string;
  family: FamilyType;
  from: { value: number; unit: string };
  to: { value: number; unit: string };
  /** multipliers that keep both sides of the question tidy */
  steps: number[];
}

export const Rules: RuleType[] = [
  // ======== Metric ========
  {
    group: "Metric",
    family: "mass",
    from: { value: 1, unit: "g" },
    to: { value: 1000000, unit: "mcg" },
    steps: [1, 2, 3, 5],
  },
  {
    group: "Metric",
    family: "mass",
    from: { value: 1, unit: "g" },
    to: { value: 1000, unit: "mg" },
    steps: [1, 2, 4, 5, 10],
  },
  {
    group: "Metric",
    family: "mass",
    from: { value: 1, unit: "mg" },
    to: { value: 1000, unit: "mcg" },
    steps: [1, 2, 4, 5, 10],
  },
  {
    group: "Metric",
    family: "volume",
    from: { value: 1, unit: "L" },
    to: { value: 1000, unit: "mL" },
    steps: [1, 2, 3, 5, 10],
  },
  {
    group: "Metric",
    family: "length",
    from: { value: 1, unit: "m" },
    to: { value: 1000, unit: "mm" },
    steps: [1, 2, 5],
  },
  {
    group: "Metric",
    family: "length",
    from: { value: 1, unit: "m" },
    to: { value: 100, unit: "cm" },
    steps: [1, 2, 3, 5, 10],
  },
  {
    group: "Metric",
    family: "volume",
    from: { value: 1, unit: "L" },
    to: { value: 10, unit: "dL" },
    steps: [1, 2, 3, 5, 10],
  },
  {
    group: "Metric",
    family: "mass",
    from: { value: 1, unit: "kg" },
    to: { value: 1000, unit: "g" },
    steps: [1, 2, 3, 5, 10],
  },

  // ======== Household ========
  {
    group: "Household",
    family: "household",
    from: { value: 1, unit: "lb" },
    to: { value: 16, unit: "oz" },
    steps: [1, 2, 3, 4, 5, 10],
  },
  {
    group: "Household",
    family: "household",
    from: { value: 1, unit: "Tbsp" },
    to: { value: 3, unit: "tsp" },
    steps: [1, 2, 3, 4, 5, 10],
  },
  {
    group: "Household",
    family: "household",
    from: { value: 1, unit: "c" },
    to: { value: 8, unit: "fl oz" },
    steps: [1, 2, 3, 4, 5, 10],
  },
  {
    group: "Household",
    family: "household",
    from: { value: 1, unit: "pt" },
    to: { value: 2, unit: "c" },
    steps: [1, 2, 3, 4, 5, 10],
  },
  {
    group: "Household",
    family: "household",
    from: { value: 1, unit: "qt" },
    to: { value: 2, unit: "pt" },
    steps: [1, 2, 3, 4, 5, 10],
  },
  {
    group: "Household",
    family: "household",
    from: { value: 1, unit: "gal" },
    to: { value: 4, unit: "qt" },
    steps: [1, 2, 3, 4, 5, 10],
  },
  {
    group: "Household",
    family: "household",
    from: { value: 1, unit: "ft" },
    to: { value: 12, unit: "in" },
    steps: [1, 2, 3, 4, 5, 10],
  },

  // ======== Metric <-> Household ========
  {
    group: "Metric & Household",
    family: "mass",
    from: { value: 1, unit: "kg" },
    to: { value: 2.2, unit: "lbs" },
    steps: [1, 2, 3, 4, 5, 10],
  },
  {
    group: "Metric & Household",
    family: "volume",
    from: { value: 1, unit: "fl oz" },
    to: { value: 30, unit: "mL" },
    steps: [1, 2, 3, 4, 5, 8],
  },
  {
    group: "Metric & Household",
    family: "volume",
    from: { value: 1, unit: "Tbsp" },
    to: { value: 15, unit: "mL" },
    steps: [1, 2, 3, 4, 5, 10],
  },
  {
    group: "Metric & Household",
    family: "volume",
    from: { value: 1, unit: "tsp" },
    to: { value: 5, unit: "mL" },
    steps: [1, 2, 3, 4, 5, 10],
  },
  {
    group: "Metric & Household",
    family: "length",
    from: { value: 1, unit: "in" },
    to: { value: 2.54, unit: "cm" },
    steps: [1, 2, 3, 4, 5, 10],
  },
];
