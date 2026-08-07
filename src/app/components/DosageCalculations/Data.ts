export const numeric = (raw: string) => {
  const [first, ...rest] = raw.replace(/[^\d.,]/g, "").split(".");
  return rest.length ? `${first}.${rest.join("")}` : first;
};
export interface LineType {
  left?: string;
  top?: string;
  bottom?: string;
  decimal?: string;
  unit?: string;
  right: string;
}
export interface PrefixType {
  name: string;
  meaning: string;
  lines: LineType[];
}
export const Prefixes: PrefixType[] = [
  {
    name: "Micro-",
    meaning: "One millionth (u)",
    lines: [
      { left: "1 gram", right: "1,000,000 micrograms" },
      {
        top: "1",
        bottom: "1,000,000",
        decimal: "0.000001",
        unit: "g",
        right: "1 ug (mcg)*",
      },
    ],
  },
  {
    name: "Milli-",
    meaning: "One thousandth (m)",
    lines: [
      { left: "1 gram", right: "1,000 milligrams" },
      { top: "1", bottom: "1,000", decimal: "0.001", unit: "g", right: "1 mg" },
      { left: "1 liter", right: "1,000 milliliters" },
      { top: "1", bottom: "1,000", decimal: "0.001", unit: "L", right: "1 mL" },
      { left: "1 meter", right: "1,000 millimeters" },
      { top: "1", bottom: "1,000", decimal: "0.001", unit: "m", right: "1 mm" },
    ],
  },
  {
    name: "Centi-",
    meaning: "One hundredth (c)",
    lines: [
      { left: "1 meter", right: "100 centimeters" },
      { top: "1", bottom: "100", decimal: "0.01", unit: "m", right: "1 cm" },
    ],
  },
  {
    name: "Deci-",
    meaning: "One tenth (d)",
    lines: [
      { left: "1 liter", right: "10 deciliters" },
      { top: "1", bottom: "10", decimal: "0.1", unit: "L", right: "1 dL" },
    ],
  },
  {
    name: "Kilo-",
    meaning: "One thousand (k)",
    lines: [
      { left: "1,000 grams", right: "1 kilogram" },
      { top: "1", bottom: "1,000", decimal: "0.001", unit: "kg", right: "1 g" },
    ],
  },
];
export interface RowType {
  left: string;
  right: string | string[];
}
export const MetricConversions: RowType[] = [
  { left: "1 kilogram (kg)", right: "1,000 grams (g)" },
  { left: "1 gram (g)", right: "1,000 milligrams (mg)" },
  { left: "1 milligram (mg)", right: "1,000 micrograms (mcg)" },
  { left: "1 liter (L)", right: "1,000 milliliters (mL)" },
  { left: "1 milliliter (mL)", right: "1 cubic centimeter (cc)" },
];
export const Household: RowType[] = [
  { left: "1 teaspoon (tsp)", right: "5 milliliters (mL)" },
  {
    left: "1 tablespoon (Tbsp)",
    right: ["15 milliliters (mL)", "3 teaspoons (tsp)"],
  },
  {
    left: "1 fluid ounce (fl oz)",
    right: ["30 milliliters (mL)", "2 tablespoons (Tbsp)", "6 teaspoons (tsp)"],
  },
  {
    left: "1 cup (c)",
    right: ["240 milliliters (mL)", "8 fluid ounces (fl oz)"],
  },
  {
    left: "1 pint (pt)",
    right: ["480 milliliters (mL)", "2 cups (c)", "16 fluid ounces (fl oz)"],
  },
  {
    left: "1 quart (qt)",
    right: ["960 milliliters (mL)", "2 pints (pts)", "32 fluid ounces (fl oz)"],
  },
  {
    left: "1 gallon (gal)",
    right: ["3,840 milliliters (mL)", "4 quarts (qts)"],
  },
  { left: "1 pound (lb)", right: "16 ounces (oz)" },
  { left: "1 foot (ft)", right: "12 inches (in)" },
];
export const MetricToHousehold: RowType[] = [
  { left: "2.2 pounds (lbs)", right: "1 kilogram (kg)" },
  { left: "1 cup (c) of liquid", right: "240 milliliters (mL)" },
  { left: "1 cup (c) of ice", right: "120 milliliters (mL)" },
  { left: "1 fluid ounce (fl oz)", right: "30 milliliters (mL)" },
  { left: "1 tablespoon (Tbsp)", right: "15 milliliters (mL)" },
  { left: "1 teaspoon (tsp)", right: "5 milliliters (mL)" },
  { left: "1 inch (in)", right: "2.54 centimeters (cm)" },
];
export type FamilyType = "mass" | "volume" | "length" | "household";
export interface LadderType {
  family: FamilyType;
  title: string;
  chain?: string[];
  keys: string[];
}
export const Ladders: LadderType[] = [
  {
    family: "mass",
    title: "Mass",
    chain: ["1 g", "10 dg", "100 cg", "1,000 mg", "1,000,000 mcg"],
    keys: [
      "1 kg = 1,000 g",
      "1 g = 1,000 mg",
      "1 mg = 1,000 mcg",
      "1 kg = 2.2 lbs",
    ],
  },
  {
    family: "volume",
    title: "Volume",
    chain: ["1 L", "10 dL", "100 cL", "1,000 mL"],
    keys: [
      "1 L = 1,000 mL",
      "1 L = 10 dL",
      "1 dL = 100 mL",
      "1 mL = 1 cc",
      "1 c of liquid = 240 mL",
      "1 c of ice = 120 mL",
      "1 fl oz = 30 mL",
      "1 Tbsp = 15 mL",
      "1 tsp = 5 mL",
    ],
  },
  {
    family: "length",
    title: "Length",
    chain: ["1 m", "10 dm", "100 cm", "1,000 mm"],
    keys: ["1 m = 100 cm", "1 m = 1,000 mm", "1 cm = 10 mm", "1 in = 2.54 cm"],
  },
  {
    family: "household",
    title: "Household",
    keys: [
      "1 Tbsp = 3 tsp",
      "1 fl oz = 2 Tbsp",
      "1 fl oz = 6 tsp",
      "1 c = 8 fl oz",
      "1 pt = 2 c",
      "1 pt = 16 fl oz",
      "1 qt = 2 pt",
      "1 qt = 32 fl oz",
      "1 gal = 4 qt",
      "1 lb = 16 oz",
      "1 ft = 12 in",
      "1 tsp = 5 mL",
      "1 Tbsp = 15 mL",
      "1 fl oz = 30 mL",
      "1 c of liquid = 240 mL",
    ],
  },
];
export interface RuleType {
  group: string;
  family: FamilyType;
  from: {
    value: number;
    unit: string;
  };
  to: {
    value: number;
    unit: string;
  };
  steps: number[];
}
export const Rules: RuleType[] = [
  {
    group: "Metric",
    family: "mass",
    from: { value: 1, unit: "g" },
    to: { value: 1000000, unit: "mcg" },
    steps: [0.5, 1, 2],
  },
  {
    group: "Metric",
    family: "mass",
    from: { value: 1, unit: "g" },
    to: { value: 1000, unit: "mg" },
    steps: [0.25, 0.5, 1, 2, 5],
  },
  {
    group: "Metric",
    family: "mass",
    from: { value: 1, unit: "mg" },
    to: { value: 1000, unit: "mcg" },
    steps: [0.125, 0.25, 0.5, 1, 2, 5],
  },
  {
    group: "Metric",
    family: "mass",
    from: { value: 1, unit: "kg" },
    to: { value: 1000, unit: "g" },
    steps: [0.5, 1, 2, 5],
  },
  {
    group: "Metric",
    family: "volume",
    from: { value: 1, unit: "L" },
    to: { value: 1000, unit: "mL" },
    steps: [0.25, 0.5, 1, 2, 3],
  },
  {
    group: "Household",
    family: "household",
    from: { value: 1, unit: "c" },
    to: { value: 8, unit: "fl oz" },
    steps: [1, 2, 3, 4],
  },
  {
    group: "Metric & Household",
    family: "mass",
    from: { value: 1, unit: "kg" },
    to: { value: 2.2, unit: "lbs" },
    steps: [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10],
  },
  {
    group: "Metric & Household",
    family: "volume",
    from: { value: 1, unit: "c of liquid" },
    to: { value: 240, unit: "mL" },
    steps: [0.5, 1, 2, 3, 4],
  },
  {
    group: "Metric & Household",
    family: "volume",
    from: { value: 1, unit: "c of ice" },
    to: { value: 120, unit: "mL" },
    steps: [0.5, 1, 2, 3, 4],
  },
  {
    group: "Metric & Household",
    family: "volume",
    from: { value: 1, unit: "fl oz" },
    to: { value: 30, unit: "mL" },
    steps: [0.5, 1, 2, 3, 4, 5, 8],
  },
  {
    group: "Metric & Household",
    family: "volume",
    from: { value: 1, unit: "Tbsp" },
    to: { value: 15, unit: "mL" },
    steps: [0.5, 1, 2, 3, 4, 5, 8],
  },
  {
    group: "Metric & Household",
    family: "volume",
    from: { value: 1, unit: "tsp" },
    to: { value: 5, unit: "mL" },
    steps: [0.5, 1, 1.5, 2, 3, 4, 5],
  },
];

export interface MixType {
  group: string;
  family: FamilyType;
  given: string;
  unit: string;
  parts: { text: string; value: number }[];
  hint: string[];
}
export const Mixes: MixType[] = [
  {
    group: "Metric & Household",
    family: "volume",
    given: "1 cup of juice + 1 cup of ice",
    unit: "mL",
    parts: [
      { text: "1 cup of juice", value: 240 },
      { text: "1 cup of ice", value: 120 },
    ],
    hint: ["1 c of liquid = 240 mL", "1 c of ice = 120 mL"],
  },
  {
    group: "Metric & Household",
    family: "volume",
    given: "2 cups of water + 1 cup of ice",
    unit: "mL",
    parts: [
      { text: "2 cups of water", value: 480 },
      { text: "1 cup of ice", value: 120 },
    ],
    hint: ["1 c of liquid = 240 mL", "1 c of ice = 120 mL"],
  },
  {
    group: "Metric & Household",
    family: "volume",
    given: "2 cups of ice + 1 cup of tea",
    unit: "mL",
    parts: [
      { text: "2 cups of ice", value: 240 },
      { text: "1 cup of tea", value: 240 },
    ],
    hint: ["1 c of ice = 120 mL", "1 c of liquid = 240 mL"],
  },
  {
    group: "Metric & Household",
    family: "volume",
    given: "1 cup of water + 4 oz of jello",
    unit: "mL",
    parts: [
      { text: "1 cup of water", value: 240 },
      { text: "4 oz of jello", value: 120 },
    ],
    hint: ["1 c of liquid = 240 mL", "1 fl oz = 30 mL"],
  },
  {
    group: "Metric & Household",
    family: "volume",
    given: "6 oz of broth + 1 cup of ice",
    unit: "mL",
    parts: [
      { text: "6 oz of broth", value: 180 },
      { text: "1 cup of ice", value: 120 },
    ],
    hint: ["1 fl oz = 30 mL", "1 c of ice = 120 mL"],
  },
  {
    group: "Metric & Household",
    family: "volume",
    given: "8 oz of milk + 1 cup of ice",
    unit: "mL",
    parts: [
      { text: "8 oz of milk", value: 240 },
      { text: "1 cup of ice", value: 120 },
    ],
    hint: ["1 fl oz = 30 mL", "1 c of ice = 120 mL"],
  },
  {
    group: "Metric & Household",
    family: "volume",
    given: "1 cup of juice + 2 tablespoons of syrup",
    unit: "mL",
    parts: [
      { text: "1 cup of juice", value: 240 },
      { text: "2 tablespoons of syrup", value: 30 },
    ],
    hint: ["1 c of liquid = 240 mL", "1 Tbsp = 15 mL"],
  },
  {
    group: "Metric & Household",
    family: "volume",
    given: "3 teaspoons of medication + 1 cup of water",
    unit: "mL",
    parts: [
      { text: "3 teaspoons of medication", value: 15 },
      { text: "1 cup of water", value: 240 },
    ],
    hint: ["1 tsp = 5 mL", "1 c of liquid = 240 mL"],
  },
  {
    group: "Metric & Household",
    family: "volume",
    given: "500 mL of NS + 1 cup of water",
    unit: "mL",
    parts: [
      { text: "500 mL of NS", value: 500 },
      { text: "1 cup of water", value: 240 },
    ],
    hint: ["1 c of liquid = 240 mL"],
  },
  {
    group: "Metric & Household",
    family: "volume",
    given: "3 cups of ice + 325 mL of Boost",
    unit: "mL",
    parts: [
      { text: "3 cups of ice", value: 360 },
      { text: "325 mL of Boost", value: 325 },
    ],
    hint: ["1 c of ice = 120 mL"],
  },
];
