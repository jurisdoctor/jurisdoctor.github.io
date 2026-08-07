export interface TermType {
  value?: string;
  top?: string;
  bottom?: string;
}
export interface StepType {
  label: string;
  chain: TermType[];
  result: string;
  tips: string[];
}
export interface SetupType {
  unit: string;
  convert: string;
}
export interface FormulaType {
  top: string;
  bottom: string;
}
export interface RoundingType {
  exact: string;
  place: string;
  rounded: string;
}
export interface ScenarioType {
  id: number;
  mark?: "star" | "star2" | "skull";
  title: string;
  prompt: string;
  answer: number;
  unit: string;
  formula?: FormulaType;
  rounding?: RoundingType;
  tolerance: number;
  setup: SetupType;
  steps: StepType[];
  note?: string;
}
const v = (value: string): TermType => ({ value });
const f = (top: string, bottom: string): TermType => ({ top, bottom });
const sides = (supply: string) => {
  const split = supply.includes(" per ")
    ? " per "
    : supply.includes(" in ")
      ? " in "
      : "/";
  const [a, b] = supply.split(split);
  if (!b) return null;
  return [a.trim(), /\d/.test(b) ? b.trim() : `1 ${b.trim()}`];
};
const FLIP = (supply: string) => {
  const pair = sides(supply);
  if (!pair)
    return "A concentration is a ratio, so it is just as true either way up. Flip it when that's what cancels.";
  return `${pair[0]} per ${pair[1]} is the same as ${pair[1]} per ${pair[0]}. Switch them round whenever that's what cancels.`;
};
const whyWeight = (kg: string, order: string, out: string) => {
  const per = order.split("/").pop() ?? "day";
  return [
    `Start with the ${kg} body weight. That's a quantity, something true of this patient.`,
    `${order} is not a quantity, it's a relationship between two units. That makes it the factor.`,
    `Remember that ${order} means the amount is divided by kg and by ${per}, and those two can swap round:`,
    `So write it with kg on the bottom, where it sits under the kg you started with. They cancel, leaving ${out}.`,
  ];
};
const whyDivide = (doses: string) => [
  `You have a daily total but you're handing over one dose, so the "per day" has to go.`,
  `Multiply by 1 day over ${doses}. The days cancel and the doses land on the bottom.`,
];
const whyVolume = (supply: string, drug: string) => [
  `The supply (${supply}) is the relationship that trades ${drug} for volume.`,
  FLIP(supply),
  `The answer has to be in mL, so use the side with mL on top. The ${drug} cancels and mL is all that's left.`,
];
const whyDrip = (bag: string) => [
  `You're carrying mcg/min and the pump wants mL/hr. Build a chain where everything cancels except those two.`,
  `1 mg per 1,000 mcg moves you into mg, because that's how the bag is labelled.`,
  `${bag} then trades the drug for the volume holding it.`,
  `60 min per 1 hr flips a per-minute dose into a per-hour rate.`,
];
const whyFlatDrip = (dose: string, bag: string) => [
  `Start with what's ordered → ${dose}.`,
  `It's a rate and it still leads. What matters isn't rate-or-not, it's quantity-or-relationship, and this is the quantity.`,
  `${bag} is the relationship, then 60 min per 1 hr turns a per-minute dose into a pump rate.`,
];
const whyOrderVolume = (order: string, supply: string, drug: string) => [
  `Start with what's ordered → ${order}. That's your quantity.`,
  `${supply} is a relationship, so it's the factor.`,
  FLIP(supply),
  `You want mL, so use the side with mL on top. The ${drug} cancels and mL is your answer.`,
];
const whyTablets = (order: string, strength: string, drug = "mg") => [
  `Start with what's ordered → ${order}. That's your quantity.`,
  `The tablet strength (${strength}) is the relationship, so write it with tablets on top.`,
  `The ${drug} cancels and you're left counting tablets.`,
];
const whyOrderUnits = (order: string, supply: string) => [
  `Start with what's ordered → ${order}. That's your quantity.`,
  `${supply} is the relationship that trades units for volume.`,
  FLIP(supply),
  `You want mL, so use the side with mL on top. The units cancel and mL is what's left.`,
];
const whyUnitsBag = (bag: string) => [
  `You're carrying units per hour and the pump wants mL per hour.`,
  `The bag (${bag}) is the only thing that trades units for volume.`,
  FLIP(bag),
  `Use the side with mL on top. The units cancel and mL per hour is what's left.`,
];
const whyUnitDrip = (dose: string, bag: string) => [
  `Start with what's ordered → ${dose}. Another rate leading the chain, for the same reason: it's the quantity.`,
  `No weight step and no mcg-to-mg step here, because the order is already in the bag's own units.`,
  `${bag} trades units for volume, then 60 min per 1 hr makes it hourly.`,
];
const whyGramsToVolume = (order: string, supply: string) => [
  `Start with what's ordered → ${order}.`,
  `The vial is labelled ${supply}, and units have to match before they can cancel. Convert with 1,000 mg per 1 g first.`,
  FLIP(supply),
  `So put the concentration mL over mg. The mg cancels and mL is left.`,
];
const whyMcgToVolume = (supply: string) => [
  `You're carrying mcg but the vial is labelled ${supply}.`,
  `Convert with 1 mg per 1,000 mcg so the units match.`,
  FLIP(supply),
  `So write the concentration with mL on top. The mg cancels and leaves the volume.`,
];
const whyMgToGramVolume = (supply: string) => [
  `You're carrying mg but the supply is written per gram. Convert with 1 g per 1,000 mg first.`,
  FLIP(supply),
  `So ${supply} goes mL on top. The grams cancel and mL is what's left.`,
];
const whyGramRate = (order: string, bag: string) => [
  `Start with what's ordered → ${order}.`,
  `The bag (${bag}) turns grams into millilitres, so put mL on top and the grams cancel.`,
  `The "per hour" isn't touched by any of it and rides straight through to the answer.`,
];
const whyBagVolume = (dose: string, bag: string) => [
  `Start with the dose you have to deliver → ${dose}.`,
  `Before you can talk about a rate you need to know how much fluid holds it.`,
  `The bag is ${bag}, so write it with mL on top. The grams cancel and leave the volume.`,
];
const whyTimedRate = (volume: string, minutes: string) => [
  `Now it's volume over time: ${volume} in ${minutes}.`,
  `Multiply by 60 min per 1 hr so the minutes cancel and the rate comes out per hour.`,
];
const whyTitrate = (to: string, from: string, kg: string) => [
  `Start with the new order → ${to}. Ignore the ${from} you were running. Titration only cares where you're going.`,
  `From there it's the usual set-up: the ${kg} weight is the quantity, the dose is the relationship.`,
  `Write the dose with kg on the bottom so the kg cancels.`,
];
const whyWeightHourly = (kg: string, order: string) => {
  const per = order.split("/").pop() ?? "hr";
  return [
    `Start with the ${kg} body weight and hang ${order} off it so the kg cancels.`,
    `Remember that ${order} means the amount is divided by kg and by ${per}, and those two can swap round:`,
    per === "hr"
      ? `The order is already per hour, so there's no 60 min per 1 hr step. Adding one anyway is the easiest way to land 60× off.`
      : `The order is per ${per}, not per hour, so a time conversion is still coming before this reaches a pump rate.`,
  ];
};
const whyMcgBag = (bag: string) => [
  `The bag (${bag}) is labelled in mcg, the same unit you're already carrying.`,
  `It goes straight in with mL on top, no conversion needed. The mcg cancels and leaves mL/hr.`,
];
const whyBolus = (kg: string, perKg: string) => [
  `Start with the ${kg} body weight, since the bolus is ordered per kg.`,
  `Write ${perKg} with mL on top. The kg cancels and leaves the total bolus volume.`,
];
const why421First = [
  "Start with the first band. The 4-2-1 rule splits body weight into bands, so take them one at a time.",
  "The first 10 kg always earns 4 mL/hr per kg. Write it as a rate over 1 kg so the kg cancels.",
];
const why421Second = (band: string) => [
  `The second band is the next 10 kg at 2 mL/hr per kg.`,
  `Only ${band} falls in it, so only that much earns the 2 mL/hr rate.`,
];
const why421Third = (band: string) => [
  `Everything past 20 kg earns 1 mL/hr per kg. That's the last ${band} here.`,
];
const why421Sum = [
  "The bands are separate rates feeding one line, so they add.",
  "Nothing cancels here. It is plain addition.",
];
const whyDeficit = (volume: string, hours: string) => [
  `The deficit is a fixed volume with a deadline, so divide ${volume} by the ${hours} you've been given.`,
  `That turns a one-off volume into an hourly rate you can add to maintenance.`,
];
const whyTotalRate = [
  "Maintenance and deficit replacement run through the same line, so the pump rate is the two added together.",
];
const whyMaintWindow = (bolus: string, window: string) => [
  `Maintenance only starts once the bolus is done, so take the ${bolus} bolus off the ${window} window.`,
];
const whyMaintVolume = [
  "Hours times mL per hour: the hours cancel and leave the volume maintenance delivered on its own.",
];
const whyBolusTotal = [
  "The bolus and the maintenance both went through the line, so the total is the two added together.",
];
export const Scenarios: ScenarioType[] = [
  {
    id: 1,
    title: "Weight-Based Pediatric Dosage",
    prompt:
      "A 5-year-old child weighs 16 kg and has been prescribed amoxicillin 25 mg/kg/day divided into two doses. How many milligrams will the child receive per dose?",
    answer: 200,
    unit: "mg",
    tolerance: 0.01,
    setup: {
      unit: "mg",
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("16 kg"), f("25 mg/day", "1 kg")],
        result: "400 mg/day",
        tips: whyWeight("16 kg", "25 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("400 mg/day"), f("1 day", "2 doses")],
        result: "200 mg/dose",
        tips: whyDivide("two doses"),
      },
    ],
  },
  {
    id: 2,
    title: "IV Flow Rate (mL/hr)",
    prompt:
      "A patient is prescribed D5W 1,000 mL to be infused over 8 hours. What is the flow rate in mL/hr?",
    answer: 125,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "Flow rate",
        chain: [f("1,000 mL", "8 hr")],
        result: "125 mL/hr",
        tips: [
          "Start with the volume that has to go in → 1,000 mL, and put the time you've been given underneath.",
          "A flow rate is volume over time, so the fraction writes itself. Dividing leaves mL/hr, the unit the pump is asking for.",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "IV Drip Rate (gtt/min)",
    prompt:
      "A patient is receiving NS at 125 mL/hr via IV. The drop factor is 20 gtt/mL. Calculate the IV drip rate in gtt/min.",
    answer: 41.67,
    unit: "gtt/min",
    formula: {
      top: "volume (mL) × drop factor (gtt/mL)",
      bottom: "time (min)",
    },
    rounding: {
      exact: "41.67 gtt/min",
      place: "whole number",
      rounded: "42 gtt/min",
    },
    tolerance: 0.5,
    setup: {
      unit: "gtt/min",
      convert: "Yes → hr to min",
    },
    steps: [
      {
        label: "Drip rate",
        chain: [v("125 mL/hr"), f("20 gtt", "1 mL"), f("1 hr", "60 min")],
        result: "41.67 gtt/min",
        tips: [
          "Start with the rate that's already running → 125 mL/hr.",
          "It's a rate and it still leads, because it is the quantity being converted. The drop factor and the minute conversion are the relationships doing the converting.",
          "Write the drop factor with gtt on top so the mL cancels, then 1 hr over 60 min to turn hours into minutes. gtt/min is what's left.",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Reconstitution of Medication",
    prompt:
      "A vial of ceftriaxone contains 1 gram of powder. After reconstitution with 10 mL of sterile water, the concentration is 100 mg/mL. The order is for 750 mg IV. How many mL will you administer?",
    answer: 7.5,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("750 mg"), f("1 mL", "100 mg")],
        result: "7.5 mL",
        tips: whyOrderVolume("750 mg", "100 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 5,
    title: "Heparin Infusion",
    prompt:
      "A patient is on a heparin drip of 18 units/kg/hr. The patient weighs 75 kg, and the concentration of heparin is 25,000 units in 500 mL. Calculate the infusion rate in mL/hr.",
    answer: 27,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour",
        chain: [v("75 kg"), f("18 units/hr", "1 kg")],
        result: "1,350 units/hr",
        tips: whyWeight("75 kg", "18 units/kg/hr", "units per hour"),
      },
      {
        label: "Infusion rate",
        chain: [v("1,350 units/hr"), f("500 mL", "25,000 units")],
        result: "27 mL/hr",
        tips: whyUnitsBag("25,000 units in 500 mL"),
      },
    ],
  },
  {
    id: 6,
    title: "Pediatric Maintenance Fluids",
    prompt:
      "A child weighs 22 kg. Using the 4-2-1 method, calculate the hourly maintenance fluid rate.",
    answer: 62,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "First 10 kg",
        chain: [v("10 kg"), f("4 mL/hr", "1 kg")],
        result: "40 mL/hr",
        tips: why421First,
      },
      {
        label: "Next 10 kg",
        chain: [v("10 kg"), f("2 mL/hr", "1 kg")],
        result: "20 mL/hr",
        tips: why421Second("the whole second 10 kg"),
      },
      {
        label: "Remaining 2 kg",
        chain: [v("2 kg"), f("1 mL/hr", "1 kg")],
        result: "2 mL/hr",
        tips: why421Third("2 kg"),
      },
      {
        label: "Total",
        chain: [v("40 + 20 + 2 mL/hr")],
        result: "62 mL/hr",
        tips: why421Sum,
      },
    ],
  },
  {
    id: 7,
    title: "Insulin Calculation",
    prompt:
      "The order reads: Administer 0.5 units/kg/day of insulin glargine subcutaneously. The patient weighs 70 kg. How many units of insulin will you administer daily?",
    answer: 35,
    unit: "units",
    tolerance: 0.01,
    setup: {
      unit: "units",
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("70 kg"), f("0.5 units/day", "1 kg")],
        result: "35 units/day",
        tips: whyWeight("70 kg", "0.5 units/kg/day", "units per day"),
      },
    ],
  },
  {
    id: 8,
    title: "Oral Medication Administration",
    prompt:
      "A patient is prescribed furosemide 40 mg orally. The pharmacy supplies furosemide in 20 mg tablets. How many tablets will you administer?",
    answer: 2,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("40 mg"), f("1 tablet", "20 mg")],
        result: "2 tablets",
        tips: [
          "Start with what's ordered → 40 mg.",
          "That is the quantity. The tablet strength is the relationship, so write it with tablets on top.",
          "The mg cancels and you're left counting tablets.",
        ],
      },
    ],
  },
  {
    id: 9,
    title: "Titration of Dopamine Infusion",
    prompt:
      "A patient weighing 80 kg is ordered dopamine at 5 mcg/kg/min. The available concentration is 400 mg dopamine in 250 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 15,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("80 kg"), f("5 mcg/min", "1 kg")],
        result: "400 mcg/min",
        tips: whyWeight("80 kg", "5 mcg/kg/min", "mcg per minute"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("400 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("250 mL", "400 mg"),
          f("60 min", "1 hr"),
        ],
        result: "15 mL/hr",
        tips: whyDrip("250 mL per 400 mg"),
      },
    ],
  },
  {
    id: 10,
    title: "Safe Dose Range",
    prompt:
      "The prescribed dose of acetaminophen for a pediatric patient is 15 mg/kg. The child weighs 24 kg. The pharmacy supplies a liquid formulation of acetaminophen with a concentration of 160 mg/5 mL. How many mL will you administer per dose?",
    answer: 11.25,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("24 kg"), f("15 mg", "1 kg")],
        result: "360 mg",
        tips: whyWeight("24 kg", "15 mg/kg", "the mg in one dose"),
      },
      {
        label: "Volume",
        chain: [v("360 mg"), f("5 mL", "160 mg")],
        result: "11.25 mL",
        tips: whyVolume("160 mg per 5 mL", "mg"),
      },
    ],
    note: "Safe dose check: the order works out to 15 mg/kg per dose, or 360 mg. No frequency and no ceiling were given here, so verify both against your drug reference and institutional limits before administering.",
  },
  {
    id: 11,
    title: "IV Piggyback Antibiotics",
    prompt:
      "Vancomycin 1 gram in 250 mL NS is ordered to infuse over 90 minutes. What is the flow rate in mL/hr?",
    answer: 166.67,
    unit: "mL/hr",
    rounding: {
      exact: "166.67 mL/hr",
      place: "tenth",
      rounded: "166.7 mL/hr",
    },
    tolerance: 0.5,
    setup: {
      unit: "mL/hr",
      convert: "Yes → min to hr",
    },
    steps: [
      {
        label: "Flow rate",
        chain: [f("250 mL", "90 min"), f("60 min", "1 hr")],
        result: "166.67 mL/hr",
        tips: [
          "Start with the volume in the bag → 250 mL, over the 90 minutes you've been given.",
          "That's mL/min, but the answer has to be per hour, so multiply by 60 min per 1 hr. The minutes cancel and the rate lands in mL/hr.",
        ],
      },
    ],
  },
  {
    id: 12,
    title: "Medication Conversion",
    prompt:
      "An order is written for 10 mg of hydromorphone. The available concentration is 2 mg/mL. How many mL will you administer?",
    answer: 5,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("10 mg"), f("1 mL", "2 mg")],
        result: "5 mL",
        tips: whyOrderVolume("10 mg", "2 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 13,
    title: "Critical Care Titration",
    prompt:
      "A patient is prescribed norepinephrine at 12 mcg/min. The pharmacy supplies norepinephrine 4 mg in 250 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 45,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "Infusion rate",
        chain: [
          v("12 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("250 mL", "4 mg"),
          f("60 min", "1 hr"),
        ],
        result: "45 mL/hr",
        tips: whyFlatDrip("12 mcg/min", "250 mL per 4 mg"),
      },
    ],
  },
  {
    id: 14,
    title: "Oral Suspension for Pediatrics",
    prompt:
      "A 3-year-old child weighing 15 kg is prescribed azithromycin 10 mg/kg once daily for 3 days. The suspension is available as 200 mg/5 mL. How many mL will you administer per dose?",
    answer: 3.75,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("15 kg"), f("10 mg", "1 kg")],
        result: "150 mg",
        tips: whyWeight("15 kg", "10 mg/kg", "the mg in one dose"),
      },
      {
        label: "Volume",
        chain: [v("150 mg"), f("5 mL", "200 mg")],
        result: "3.75 mL",
        tips: whyVolume("200 mg per 5 mL", "mg"),
      },
    ],
  },
  {
    id: 15,
    title: "Loading Dose Calculation",
    prompt:
      "A patient is prescribed a loading dose of phenytoin 15 mg/kg IV. The patient weighs 60 kg, and the available concentration is 50 mg/mL. How many mL will you administer?",
    answer: 18,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("60 kg"), f("15 mg", "1 kg")],
        result: "900 mg",
        tips: whyWeight("60 kg", "15 mg/kg", "the mg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("900 mg"), f("1 mL", "50 mg")],
        result: "18 mL",
        tips: whyVolume("50 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 16,
    title: "Weight-Based Titration Calculation",
    prompt:
      "A patient weighing 72 kg is prescribed a dobutamine infusion at 7 mcg/kg/min. The available solution is 500 mg in 250 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 15.12,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("72 kg"), f("7 mcg/min", "1 kg")],
        result: "504 mcg/min",
        tips: whyWeight("72 kg", "7 mcg/kg/min", "mcg per minute"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("504 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("250 mL", "500 mg"),
          f("60 min", "1 hr"),
        ],
        result: "15.12 mL/hr",
        tips: whyDrip("250 mL per 500 mg"),
      },
    ],
  },
  {
    id: 17,
    title: "Pediatric Safe Dose Range",
    prompt:
      "A 6-year-old child weighing 22 kg is prescribed cefuroxime 150 mg/kg/day divided into three doses. The pharmacy supplies a concentration of 250 mg/5 mL. Calculate the volume per dose.",
    answer: 22,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("22 kg"), f("150 mg/day", "1 kg")],
        result: "3,300 mg/day",
        tips: whyWeight("22 kg", "150 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("3,300 mg/day"), f("1 day", "3 doses")],
        result: "1,100 mg/dose",
        tips: whyDivide("three doses"),
      },
      {
        label: "Volume",
        chain: [v("1,100 mg"), f("5 mL", "250 mg")],
        result: "22 mL",
        tips: whyVolume("250 mg per 5 mL", "mg"),
      },
    ],
    note: "Safe dose check: the order works out to 150 mg/kg/day, or 3,300 mg/day. No ceiling was given here, so verify it against your drug reference and institutional limits before administering.",
  },
  {
    id: 18,
    title: "Complex IV Flow Rate Adjustment",
    prompt:
      "A patient's initial IV order is D5NS at 75 mL/hr. The physician changes the order to infuse 900 mL over the next 6 hours. What is the new flow rate in mL/hr?",
    answer: 150,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "New rate",
        chain: [f("900 mL", "6 hr")],
        result: "150 mL/hr",
        tips: [
          "Start with the new order and set the old 75 mL/hr aside: it gets subtracted later, but it plays no part in this step. 900 mL over 6 hr is volume over time, which divides straight to mL/hr.",
        ],
      },
      {
        label: "Increase",
        chain: [v("150 mL/hr − 75 mL/hr")],
        result: "75 mL/hr",
        tips: [
          "'By how much' means subtract. Both rates are already in mL/hr, so nothing needs converting first.",
        ],
      },
    ],
    note: "The rate doubles → 75 mL/hr more than the original order.",
  },
  {
    id: 19,
    title: "Insulin Sliding Scale and Basal Rate",
    prompt:
      "A patient with type 1 diabetes is on an insulin pump delivering 1.2 units/hr as a basal rate. The sliding scale order is: blood glucose > 250 mg/dL gets a 2 unit bolus. The patient's blood glucose is 284 mg/dL. How many total units will the patient receive over 1 hour?",
    answer: 3.2,
    unit: "units",
    tolerance: 0.01,
    setup: {
      unit: "units",
      convert: "No",
    },
    steps: [
      {
        label: "Basal over 1 hour",
        chain: [v("1 hr"), f("1.2 units", "1 hr")],
        result: "1.2 units",
        tips: [
          "Start with the basal rate → 1.2 units/hr, and multiply by the 1 hr the question asks about. The hours cancel and leave plain units.",
        ],
      },
      {
        label: "Sliding scale (284 mg/dL > 250 mg/dL)",
        chain: [v("2 units")],
        result: "2 units",
        tips: [
          "This one is a lookup, not a calculation. 284 mg/dL clears the > 250 mg/dL threshold, so the 2 unit bolus applies exactly as written.",
        ],
      },
      {
        label: "Total",
        chain: [v("1.2 units + 2 units")],
        result: "3.2 units",
        tips: [
          "Basal and bolus are both insulin reaching the same patient in the same hour, so they add.",
        ],
      },
    ],
  },
  {
    id: 20,
    title: "Advanced Reconstitution and Administration",
    prompt:
      "A provider orders ertapenem 1 gram IV once daily. The vial contains 1 gram of powder and must be reconstituted with 10 mL sterile water to yield 100 mg/mL. You must dilute the dose further in 50 mL NS before administration. How many mL from the reconstituted solution will you use?",
    answer: 10,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "Yes → g to mg",
    },
    steps: [
      {
        label: "Volume to withdraw",
        chain: [v("1 g"), f("1,000 mg", "1 g"), f("1 mL", "100 mg")],
        result: "10 mL",
        tips: whyGramsToVolume("1 g", "100 mg/mL"),
      },
    ],
    note: "The whole reconstituted vial goes into the 50 mL NS. The dilution volume does not change how much you draw up.",
  },
  {
    id: 21,
    title: "Continuous Heparin Infusion",
    prompt:
      "A patient weighing 64 kg is receiving a heparin infusion at 14 units/kg/hr. The available solution is 25,000 units in 500 mL NS. Calculate the infusion rate in mL/hr.",
    answer: 17.92,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour",
        chain: [v("64 kg"), f("14 units/hr", "1 kg")],
        result: "896 units/hr",
        tips: whyWeight("64 kg", "14 units/kg/hr", "units per hour"),
      },
      {
        label: "Infusion rate",
        chain: [v("896 units/hr"), f("500 mL", "25,000 units")],
        result: "17.92 mL/hr",
        tips: whyUnitsBag("25,000 units in 500 mL"),
      },
    ],
  },
  {
    id: 22,
    title: "Pediatric Maintenance Fluids with Deficit Replacement",
    prompt:
      "A 4-year-old child weighing 18 kg is NPO and has a calculated fluid deficit of 150 mL. Using the 4-2-1 method, determine the total hourly infusion rate in mL/hr to replace the deficit over 6 hours while providing maintenance fluids.",
    answer: 81,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "First 10 kg",
        chain: [v("10 kg"), f("4 mL/hr", "1 kg")],
        result: "40 mL/hr",
        tips: why421First,
      },
      {
        label: "Next 8 kg",
        chain: [v("8 kg"), f("2 mL/hr", "1 kg")],
        result: "16 mL/hr",
        tips: why421Second("8 kg"),
      },
      {
        label: "Maintenance",
        chain: [v("40 + 16 mL/hr")],
        result: "56 mL/hr",
        tips: why421Sum,
      },
      {
        label: "Deficit replacement",
        chain: [f("150 mL", "6 hr")],
        result: "25 mL/hr",
        tips: whyDeficit("150 mL", "6 hours"),
      },
      {
        label: "Total",
        chain: [v("56 + 25 mL/hr")],
        result: "81 mL/hr",
        tips: whyTotalRate,
      },
    ],
  },
  {
    id: 23,
    title: "Vancomycin Trough Dose Adjustment",
    prompt:
      "A patient weighing 80 kg is prescribed vancomycin 1.25 grams every 8 hours. The pharmacy supplies vancomycin at a concentration of 1 g/200 mL. Calculate the volume in mL for one dose.",
    answer: 250,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume per dose",
        chain: [v("1.25 g"), f("200 mL", "1 g")],
        result: "250 mL",
        tips: [
          "Start with what's ordered → 1.25 g.",
          "The body weight is the trap here: the order is already in grams, so there's nothing for the weight to do.",
          "Write the supply with mL on top. The grams cancel and leave the volume for one dose.",
        ],
      },
      {
        label: "Doses per day (every 8 hours)",
        chain: [f("24 hr", "8 hr")],
        result: "3 doses",
        tips: [
          "Every 8 hours means the day divides into 8-hour slots. 24 hr over 8 hr cancels the hours and leaves a plain count of doses.",
        ],
      },
      {
        label: "24-hour volume",
        chain: [v("250 mL/dose"), v("3 doses")],
        result: "750 mL",
        tips: [
          "Volume per dose times the number of doses gives the whole day's volume.",
        ],
      },
    ],
    note: "24-hour total: 750 mL across three doses. The 80 kg weight isn't needed, because the order is already written in grams.",
  },
  {
    id: 24,
    title: "Magnesium Sulfate Infusion",
    prompt:
      "A patient in preeclampsia is prescribed magnesium sulfate at 2 grams/hr IV. The pharmacy provides magnesium sulfate 40 grams in 1,000 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 50,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "Infusion rate",
        chain: [v("2 g/hr"), f("1,000 mL", "40 g")],
        result: "50 mL/hr",
        tips: whyGramRate("2 g/hr", "40 g in 1,000 mL"),
      },
    ],
  },
  {
    id: 25,
    title: "Advanced Pediatric Antibiotic Dosing",
    prompt:
      "A pediatric patient weighing 12 kg is prescribed amoxicillin-clavulanate 30 mg/kg/day divided into two doses. The suspension concentration is 400 mg/5 mL. Calculate the volume per dose in mL.",
    answer: 2.25,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("12 kg"), f("30 mg/day", "1 kg")],
        result: "360 mg/day",
        tips: whyWeight("12 kg", "30 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("360 mg/day"), f("1 day", "2 doses")],
        result: "180 mg/dose",
        tips: whyDivide("two doses"),
      },
      {
        label: "Volume",
        chain: [v("180 mg"), f("5 mL", "400 mg")],
        result: "2.25 mL",
        tips: whyVolume("400 mg per 5 mL", "mg"),
      },
    ],
  },
  {
    id: 26,
    title: "Critical Care Medication Adjustment",
    prompt:
      "A provider orders norepinephrine to be titrated from 0.08 mcg/kg/min to 0.12 mcg/kg/min for a patient weighing 70 kg. The pharmacy provides norepinephrine 4 mg in 250 mL D5W. Calculate the new infusion rate in mL/hr.",
    answer: 31.5,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute at the new dose",
        chain: [v("70 kg"), f("0.12 mcg/min", "1 kg")],
        result: "8.4 mcg/min",
        tips: whyTitrate("0.12 mcg/kg/min", "0.08 mcg/kg/min", "70 kg"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("8.4 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("250 mL", "4 mg"),
          f("60 min", "1 hr"),
        ],
        result: "31.5 mL/hr",
        tips: whyDrip("250 mL per 4 mg"),
      },
    ],
  },
  {
    id: 27,
    title: "IV Bolus and Continuous Infusion",
    prompt:
      "A patient is prescribed an initial bolus of 1,000 mL of NS over 2 hours, followed by a continuous infusion of 125 mL/hr. Calculate the total volume infused after 8 hours.",
    answer: 1750,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Bolus",
        chain: [v("1,000 mL")],
        result: "1,000 mL",
        tips: [
          "Start with the bolus, which is handed to you outright → 1,000 mL, nothing to convert. Not every step needs a factor.",
        ],
      },
      {
        label: "Time left after the bolus",
        chain: [v("8 hr − 2 hr")],
        result: "6 hr",
        tips: [
          "The continuous infusion only starts once the bolus finishes, so take the 2 bolus hours off the 8-hour window.",
        ],
      },
      {
        label: "Continuous infusion",
        chain: [v("6 hr"), f("125 mL", "1 hr")],
        result: "750 mL",
        tips: [
          "Hours times mL per hour: the hours cancel and leave the volume the maintenance line delivered.",
        ],
      },
      {
        label: "Total",
        chain: [v("1,000 + 750 mL")],
        result: "1,750 mL",
        tips: ["Both volumes went into the same patient, so they add."],
      },
    ],
  },
  {
    id: 28,
    title: "Propofol Infusion in ICU",
    prompt:
      "A 78-kg patient is receiving propofol at 35 mcg/kg/min for sedation. The pharmacy provides propofol at a concentration of 1,000 mg in 100 mL. Calculate the infusion rate in mL/hr.",
    answer: 16.38,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("78 kg"), f("35 mcg/min", "1 kg")],
        result: "2,730 mcg/min",
        tips: whyWeight("78 kg", "35 mcg/kg/min", "mcg per minute"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("2,730 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("100 mL", "1,000 mg"),
          f("60 min", "1 hr"),
        ],
        result: "16.38 mL/hr",
        tips: whyDrip("100 mL per 1,000 mg"),
      },
    ],
  },
  {
    id: 29,
    title: "Digoxin Loading Dose",
    prompt:
      "A patient is prescribed a digoxin loading dose of 10 mcg/kg IV. The patient weighs 65 kg. The pharmacy provides a concentration of 0.25 mg/mL. Calculate the volume in mL for the loading dose.",
    answer: 2.6,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "Yes → mcg to mg",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("65 kg"), f("10 mcg", "1 kg")],
        result: "650 mcg",
        tips: whyWeight("65 kg", "10 mcg/kg", "the mcg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("650 mcg"), f("1 mg", "1,000 mcg"), f("1 mL", "0.25 mg")],
        result: "2.6 mL",
        tips: whyMcgToVolume("0.25 mg/mL"),
      },
    ],
  },
  {
    id: 30,
    title: "Advanced IV Drip Rate",
    prompt:
      "A patient is prescribed an infusion of epinephrine at 5 mcg/min. The pharmacy provides epinephrine at a concentration of 4 mg in 250 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 18.75,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "Infusion rate",
        chain: [
          v("5 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("250 mL", "4 mg"),
          f("60 min", "1 hr"),
        ],
        result: "18.75 mL/hr",
        tips: whyFlatDrip("5 mcg/min", "250 mL per 4 mg"),
      },
    ],
  },
  {
    id: 31,
    title: "Continuous IV Infusion Calculation",
    prompt:
      "A patient weighing 82 kg is prescribed a milrinone infusion at 0.5 mcg/kg/min. The pharmacy provides milrinone 20 mg in 100 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 12.3,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("82 kg"), f("0.5 mcg/min", "1 kg")],
        result: "41 mcg/min",
        tips: whyWeight("82 kg", "0.5 mcg/kg/min", "mcg per minute"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("41 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("100 mL", "20 mg"),
          f("60 min", "1 hr"),
        ],
        result: "12.3 mL/hr",
        tips: whyDrip("100 mL per 20 mg"),
      },
    ],
  },
  {
    id: 32,
    title: "Pediatric Safe Dose Calculation",
    prompt:
      "A 4-year-old child weighing 18 kg is prescribed acetaminophen 12 mg/kg/dose every 6 hours as needed. The pharmacy supplies acetaminophen liquid at a concentration of 160 mg/5 mL. How many mL per dose will you administer?",
    answer: 6.75,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("18 kg"), f("12 mg", "1 kg")],
        result: "216 mg",
        tips: whyWeight("18 kg", "12 mg/kg", "the mg in one dose"),
      },
      {
        label: "Volume",
        chain: [v("216 mg"), f("5 mL", "160 mg")],
        result: "6.75 mL",
        tips: whyVolume("160 mg per 5 mL", "mg"),
      },
    ],
    note: "Safe dose check: every 6 hours makes 4 doses, so the order works out to 48 mg/kg/day, or 864 mg/day. No ceiling was given here, so verify it against your drug reference and institutional limits before administering.",
  },
  {
    id: 33,
    title: "Critical Care Medication Titration",
    prompt:
      "A patient is receiving dopamine at 5 mcg/kg/min, and the physician increases the rate to 7 mcg/kg/min. The patient weighs 68 kg, and the pharmacy provides dopamine at a concentration of 400 mg in 250 mL D5W. Calculate the new infusion rate in mL/hr.",
    answer: 17.85,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute at the new dose",
        chain: [v("68 kg"), f("7 mcg/min", "1 kg")],
        result: "476 mcg/min",
        tips: whyTitrate("7 mcg/kg/min", "5 mcg/kg/min", "68 kg"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("476 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("250 mL", "400 mg"),
          f("60 min", "1 hr"),
        ],
        result: "17.85 mL/hr",
        tips: whyDrip("250 mL per 400 mg"),
      },
    ],
  },
  {
    id: 34,
    title: "Advanced Reconstitution and Dosage Calculation",
    prompt:
      "A provider orders ceftriaxone 1 gram IV twice daily. The vial contains 2 grams of powder and must be reconstituted with 10 mL sterile water to yield a concentration of 200 mg/mL. How many mL will you administer per dose?",
    answer: 5,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "Yes → g to mg",
    },
    steps: [
      {
        label: "Volume per dose",
        chain: [v("1 g"), f("1,000 mg", "1 g"), f("1 mL", "200 mg")],
        result: "5 mL",
        tips: [
          "Start with what's ordered → 1 g, not the 2 g in the vial.",
          "You always calculate from the dose, never from the vial size.",
          "Convert 1 g to 1,000 mg so it matches the mg/mL label, then put mL on top so the mg cancels.",
        ],
      },
    ],
    note: "The vial holds 2 g, so one dose is half of it: draw 5 mL of the 10 mL you reconstituted.",
  },
  {
    id: 35,
    title: "Insulin Titration",
    prompt:
      "A patient with DKA is receiving regular insulin at 0.08 units/kg/hr. The patient weighs 72 kg, and the solution contains 100 units of insulin in 250 mL NS. Calculate the infusion rate in mL/hr.",
    answer: 14.4,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour",
        chain: [v("72 kg"), f("0.08 units/hr", "1 kg")],
        result: "5.76 units/hr",
        tips: whyWeight("72 kg", "0.08 units/kg/hr", "units per hour"),
      },
      {
        label: "Infusion rate",
        chain: [v("5.76 units/hr"), f("250 mL", "100 units")],
        result: "14.4 mL/hr",
        tips: whyUnitsBag("100 units in 250 mL"),
      },
    ],
  },
  {
    id: 36,
    title: "Pediatric Fluid Maintenance with Deficit",
    prompt:
      "A pediatric patient weighing 24 kg has a fluid deficit of 200 mL and requires maintenance fluids using the 4-2-1 method. The deficit must be replaced over 8 hours. What is the total hourly infusion rate in mL/hr?",
    answer: 89,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "First 10 kg",
        chain: [v("10 kg"), f("4 mL/hr", "1 kg")],
        result: "40 mL/hr",
        tips: why421First,
      },
      {
        label: "Next 10 kg",
        chain: [v("10 kg"), f("2 mL/hr", "1 kg")],
        result: "20 mL/hr",
        tips: why421Second("the whole second 10 kg"),
      },
      {
        label: "Remaining 4 kg",
        chain: [v("4 kg"), f("1 mL/hr", "1 kg")],
        result: "4 mL/hr",
        tips: why421Third("4 kg"),
      },
      {
        label: "Maintenance",
        chain: [v("40 + 20 + 4 mL/hr")],
        result: "64 mL/hr",
        tips: why421Sum,
      },
      {
        label: "Deficit replacement",
        chain: [f("200 mL", "8 hr")],
        result: "25 mL/hr",
        tips: whyDeficit("200 mL", "8 hours"),
      },
      {
        label: "Total",
        chain: [v("64 + 25 mL/hr")],
        result: "89 mL/hr",
        tips: whyTotalRate,
      },
    ],
  },
  {
    id: 37,
    title: "Safe Vancomycin Dosage",
    prompt:
      "A patient weighing 88 kg is prescribed vancomycin 15 mg/kg every 12 hours. The pharmacy supplies vancomycin in a concentration of 1 g/250 mL. Calculate the volume in mL per dose.",
    answer: 330,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "Yes → mg to g",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("88 kg"), f("15 mg", "1 kg")],
        result: "1,320 mg",
        tips: whyWeight("88 kg", "15 mg/kg", "the mg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("1,320 mg"), f("1 g", "1,000 mg"), f("250 mL", "1 g")],
        result: "330 mL",
        tips: whyMgToGramVolume("250 mL per 1 g"),
      },
    ],
  },
  {
    id: 38,
    title: "Magnesium Sulfate Loading Dose",
    prompt:
      "A patient in labor with preeclampsia is prescribed a magnesium sulfate loading dose of 6 grams over 30 minutes. The pharmacy supplies magnesium sulfate 40 grams in 1,000 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 300,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "Yes → min to hr",
    },
    steps: [
      {
        label: "Volume of the dose",
        chain: [v("6 g"), f("1,000 mL", "40 g")],
        result: "150 mL",
        tips: whyBagVolume("6 g", "40 g in 1,000 mL"),
      },
      {
        label: "Infusion rate",
        chain: [f("150 mL", "30 min"), f("60 min", "1 hr")],
        result: "300 mL/hr",
        tips: whyTimedRate("150 mL", "30 min"),
      },
    ],
  },
  {
    id: 39,
    title: "Pediatric Antibiotic Dosage",
    prompt:
      "A 2-year-old child weighing 14 kg is prescribed amoxicillin 30 mg/kg/day divided into three doses. The suspension concentration is 250 mg/5 mL. Calculate the volume in mL per dose.",
    answer: 2.8,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("14 kg"), f("30 mg/day", "1 kg")],
        result: "420 mg/day",
        tips: whyWeight("14 kg", "30 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("420 mg/day"), f("1 day", "3 doses")],
        result: "140 mg/dose",
        tips: whyDivide("three doses"),
      },
      {
        label: "Volume",
        chain: [v("140 mg"), f("5 mL", "250 mg")],
        result: "2.8 mL",
        tips: whyVolume("250 mg per 5 mL", "mg"),
      },
    ],
  },
  {
    id: 40,
    title: "Advanced Medication Adjustment",
    prompt:
      "A patient weighing 75 kg is prescribed norepinephrine at 0.1 mcg/kg/min. The pharmacy provides norepinephrine 4 mg in 250 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 28.125,
    unit: "mL/hr",
    rounding: {
      exact: "28.125 mL/hr",
      place: "tenth",
      rounded: "28.1 mL/hr",
    },
    tolerance: 0.05,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("75 kg"), f("0.1 mcg/min", "1 kg")],
        result: "7.5 mcg/min",
        tips: whyWeight("75 kg", "0.1 mcg/kg/min", "mcg per minute"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("7.5 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("250 mL", "4 mg"),
          f("60 min", "1 hr"),
        ],
        result: "28.125 mL/hr",
        tips: whyDrip("250 mL per 4 mg"),
      },
    ],
  },
  {
    id: 41,
    title: "Heparin Infusion Dose Adjustment",
    prompt:
      "A patient on a heparin drip is ordered to receive 16 units/kg/hr. The patient weighs 60 kg, and the pharmacy provides a concentration of 25,000 units in 500 mL. Calculate the infusion rate in mL/hr.",
    answer: 19.2,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour",
        chain: [v("60 kg"), f("16 units/hr", "1 kg")],
        result: "960 units/hr",
        tips: whyWeight("60 kg", "16 units/kg/hr", "units per hour"),
      },
      {
        label: "Infusion rate",
        chain: [v("960 units/hr"), f("500 mL", "25,000 units")],
        result: "19.2 mL/hr",
        tips: whyUnitsBag("25,000 units in 500 mL"),
      },
    ],
  },
  {
    id: 42,
    title: "Advanced Propofol Infusion",
    prompt:
      "A 90-kg patient is receiving propofol at 50 mcg/kg/min for sedation. The pharmacy supplies propofol at a concentration of 1,000 mg in 100 mL. Calculate the infusion rate in mL/hr.",
    answer: 27,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("90 kg"), f("50 mcg/min", "1 kg")],
        result: "4,500 mcg/min",
        tips: whyWeight("90 kg", "50 mcg/kg/min", "mcg per minute"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("4,500 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("100 mL", "1,000 mg"),
          f("60 min", "1 hr"),
        ],
        result: "27 mL/hr",
        tips: whyDrip("100 mL per 1,000 mg"),
      },
    ],
  },
  {
    id: 43,
    title: "Loading Dose for Cardiovascular Medication",
    prompt:
      "A patient is prescribed a loading dose of diltiazem 0.25 mg/kg IV over 2 minutes. The patient weighs 85 kg, and the pharmacy provides diltiazem in a concentration of 5 mg/mL. Calculate the volume in mL to administer.",
    answer: 4.25,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("85 kg"), f("0.25 mg", "1 kg")],
        result: "21.25 mg",
        tips: whyWeight("85 kg", "0.25 mg/kg", "the mg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("21.25 mg"), f("1 mL", "5 mg")],
        result: "4.25 mL",
        tips: whyVolume("5 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 44,
    title: "Pediatric IV Bolus and Continuous Maintenance",
    prompt:
      "A pediatric patient weighing 12 kg is prescribed an IV bolus of 20 mL/kg over 30 minutes followed by maintenance fluids using the 4-2-1 rule. Calculate the total volume infused after 4 hours, including both bolus and maintenance.",
    answer: 394,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Bolus",
        chain: [v("12 kg"), f("20 mL", "1 kg")],
        result: "240 mL",
        tips: whyBolus("12 kg", "20 mL/kg"),
      },
      {
        label: "Maintenance rate (4-2-1)",
        chain: [v("4 mL/hr × 10 kg + 2 mL/hr × 2 kg")],
        result: "44 mL/hr",
        tips: [
          "12 kg splits across two bands: the first 10 kg at 4 mL/hr each, then the leftover 2 kg at 2 mL/hr each. Add the bands to get the hourly rate.",
        ],
      },
      {
        label: "Maintenance time",
        chain: [v("4 hr − 0.5 hr")],
        result: "3.5 hr",
        tips: whyMaintWindow("30-minute", "4-hour"),
      },
      {
        label: "Maintenance volume",
        chain: [v("3.5 hr"), f("44 mL", "1 hr")],
        result: "154 mL",
        tips: whyMaintVolume,
      },
      {
        label: "Total",
        chain: [v("240 + 154 mL")],
        result: "394 mL",
        tips: whyBolusTotal,
      },
    ],
    note: "This assumes maintenance starts when the 30-minute bolus finishes. If maintenance ran the full 4 hours alongside, the total would be 416 mL.",
  },
  {
    id: 45,
    title: "Advanced ICU Drip Rate",
    prompt:
      "A patient is prescribed an epinephrine infusion at 10 mcg/min. The pharmacy provides epinephrine at a concentration of 4 mg in 250 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 37.5,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "Infusion rate",
        chain: [
          v("10 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("250 mL", "4 mg"),
          f("60 min", "1 hr"),
        ],
        result: "37.5 mL/hr",
        tips: whyFlatDrip("10 mcg/min", "250 mL per 4 mg"),
      },
    ],
  },
  {
    id: 46,
    title: "Continuous Epinephrine Infusion",
    prompt:
      "A patient weighing 90 kg is prescribed an epinephrine infusion at 8 mcg/min. The pharmacy provides epinephrine 2 mg in 250 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 60,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "Infusion rate",
        chain: [
          v("8 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("250 mL", "2 mg"),
          f("60 min", "1 hr"),
        ],
        result: "60 mL/hr",
        tips: whyFlatDrip("8 mcg/min", "250 mL per 2 mg"),
      },
    ],
    note: "The 90 kg weight isn't needed, because this order is a flat mcg/min, not weight-based.",
  },
  {
    id: 47,
    title: "Pediatric Safe Dose Verification",
    prompt:
      "A 5-year-old child weighing 22 kg is prescribed ceftriaxone 80 mg/kg/day divided into two doses. The pharmacy provides a concentration of 100 mg/mL. Calculate the volume per dose in mL.",
    answer: 8.8,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("22 kg"), f("80 mg/day", "1 kg")],
        result: "1,760 mg/day",
        tips: whyWeight("22 kg", "80 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("1,760 mg/day"), f("1 day", "2 doses")],
        result: "880 mg/dose",
        tips: whyDivide("two doses"),
      },
      {
        label: "Volume",
        chain: [v("880 mg"), f("1 mL", "100 mg")],
        result: "8.8 mL",
        tips: whyVolume("100 mg/mL", "mg"),
      },
    ],
    note: "Safe dose check: the order works out to 80 mg/kg/day, or 1,760 mg/day. No ceiling was given here, so verify it against your drug reference and institutional limits before administering.",
  },
  {
    id: 48,
    title: "Heparin Titration",
    prompt:
      "A patient is on a heparin drip at 14 units/kg/hr. The patient weighs 75 kg, and the solution is 25,000 units in 500 mL. The provider increases the infusion to 16 units/kg/hr. Calculate the new infusion rate in mL/hr.",
    answer: 24,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour at the new dose",
        chain: [v("75 kg"), f("16 units/hr", "1 kg")],
        result: "1,200 units/hr",
        tips: whyTitrate("16 units/kg/hr", "14 units/kg/hr", "75 kg"),
      },
      {
        label: "Infusion rate",
        chain: [v("1,200 units/hr"), f("500 mL", "25,000 units")],
        result: "24 mL/hr",
        tips: whyUnitsBag("25,000 units in 500 mL"),
      },
    ],
  },
  {
    id: 49,
    title: "Advanced IV Antibiotics",
    prompt:
      "A patient is prescribed meropenem 1 g IV every 8 hours. The vial contains 1 g of powder and must be reconstituted with 20 mL sterile water to yield 50 mg/mL. The dose must be further diluted in 100 mL NS for infusion. How many mL of reconstituted solution will you use?",
    answer: 20,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "Yes → g to mg",
    },
    steps: [
      {
        label: "Volume to withdraw",
        chain: [v("1 g"), f("1,000 mg", "1 g"), f("1 mL", "50 mg")],
        result: "20 mL",
        tips: [
          "Start with what's ordered → 1 g.",
          "Convert it into mg so it matches the 50 mg/mL label, then put mL on top so the mg cancels.",
          "The 100 mL of NS is the diluent. It changes the bag you hang, not the dose you draw.",
        ],
      },
    ],
    note: "The full vial is the dose. The 100 mL NS is the diluent, not part of the calculation.",
  },
  {
    id: 50,
    title: "Insulin Continuous Infusion",
    prompt:
      "A patient weighing 85 kg is receiving a regular insulin infusion at 0.1 units/kg/hr. The pharmacy provides a concentration of 100 units in 250 mL NS. Calculate the infusion rate in mL/hr.",
    answer: 21.25,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour",
        chain: [v("85 kg"), f("0.1 units/hr", "1 kg")],
        result: "8.5 units/hr",
        tips: whyWeight("85 kg", "0.1 units/kg/hr", "units per hour"),
      },
      {
        label: "Infusion rate",
        chain: [v("8.5 units/hr"), f("250 mL", "100 units")],
        result: "21.25 mL/hr",
        tips: whyUnitsBag("100 units in 250 mL"),
      },
    ],
  },
  {
    id: 51,
    title: "Pediatric Fluid Management with Maintenance",
    prompt:
      "A pediatric patient weighing 16 kg has a fluid deficit of 100 mL and requires maintenance fluids using the 4-2-1 method. The deficit must be replaced over 4 hours. What is the total hourly infusion rate in mL/hr?",
    answer: 77,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "First 10 kg",
        chain: [v("10 kg"), f("4 mL/hr", "1 kg")],
        result: "40 mL/hr",
        tips: why421First,
      },
      {
        label: "Next 6 kg",
        chain: [v("6 kg"), f("2 mL/hr", "1 kg")],
        result: "12 mL/hr",
        tips: why421Second("6 kg"),
      },
      {
        label: "Maintenance",
        chain: [v("40 + 12 mL/hr")],
        result: "52 mL/hr",
        tips: why421Sum,
      },
      {
        label: "Deficit replacement",
        chain: [f("100 mL", "4 hr")],
        result: "25 mL/hr",
        tips: whyDeficit("100 mL", "4 hours"),
      },
      {
        label: "Total",
        chain: [v("52 + 25 mL/hr")],
        result: "77 mL/hr",
        tips: whyTotalRate,
      },
    ],
  },
  {
    id: 52,
    title: "Safe Vancomycin Dosage",
    prompt:
      "A patient weighing 65 kg is prescribed vancomycin 15 mg/kg every 12 hours. The pharmacy provides vancomycin in a concentration of 1 g/250 mL. Calculate the volume in mL per dose.",
    answer: 243.75,
    unit: "mL",
    tolerance: 0.05,
    setup: {
      unit: "mL",
      convert: "Yes → mg to g",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("65 kg"), f("15 mg", "1 kg")],
        result: "975 mg",
        tips: whyWeight("65 kg", "15 mg/kg", "the mg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("975 mg"), f("1 g", "1,000 mg"), f("250 mL", "1 g")],
        result: "243.75 mL",
        tips: whyMgToGramVolume("250 mL per 1 g"),
      },
    ],
  },
  {
    id: 53,
    title: "Magnesium Sulfate Maintenance Infusion",
    prompt:
      "A patient with preeclampsia is on a magnesium sulfate maintenance infusion of 2 g/hr. The pharmacy provides magnesium sulfate 40 g in 1,000 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 50,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "Infusion rate",
        chain: [v("2 g/hr"), f("1,000 mL", "40 g")],
        result: "50 mL/hr",
        tips: whyGramRate("2 g/hr", "40 g in 1,000 mL"),
      },
    ],
  },
  {
    id: 54,
    title: "Pediatric Amoxicillin Suspension",
    prompt:
      "A 3-year-old child weighing 14 kg is prescribed amoxicillin 50 mg/kg/day divided into three doses. The pharmacy supplies a suspension of 400 mg/5 mL. Calculate the volume per dose in mL.",
    answer: 2.92,
    unit: "mL",
    rounding: {
      exact: "2.92 mL",
      place: "tenth",
      rounded: "2.9 mL",
    },
    tolerance: 0.03,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("14 kg"), f("50 mg/day", "1 kg")],
        result: "700 mg/day",
        tips: whyWeight("14 kg", "50 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("700 mg/day"), f("1 day", "3 doses")],
        result: "233.3 mg/dose",
        tips: whyDivide("three doses"),
      },
      {
        label: "Volume",
        chain: [v("233.3 mg"), f("5 mL", "400 mg")],
        result: "2.92 mL",
        tips: whyVolume("400 mg per 5 mL", "mg"),
      },
    ],
    note: "That's about as fine as an oral syringe reads anyway.",
  },
  {
    id: 55,
    title: "Norepinephrine Dose Adjustment",
    prompt:
      "A patient weighing 80 kg is receiving norepinephrine at 0.1 mcg/kg/min. The provider orders an increase to 0.15 mcg/kg/min. The pharmacy provides norepinephrine 4 mg in 250 mL D5W. Calculate the new infusion rate in mL/hr.",
    answer: 45,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute at the new dose",
        chain: [v("80 kg"), f("0.15 mcg/min", "1 kg")],
        result: "12 mcg/min",
        tips: whyTitrate("0.15 mcg/kg/min", "0.1 mcg/kg/min", "80 kg"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("12 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("250 mL", "4 mg"),
          f("60 min", "1 hr"),
        ],
        result: "45 mL/hr",
        tips: whyDrip("250 mL per 4 mg"),
      },
    ],
  },
  {
    id: 56,
    title: "Propofol Sedation in ICU",
    prompt:
      "A 70-kg patient is sedated with propofol at 45 mcg/kg/min. The pharmacy provides propofol at a concentration of 1,000 mg in 100 mL. Calculate the infusion rate in mL/hr.",
    answer: 18.9,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("70 kg"), f("45 mcg/min", "1 kg")],
        result: "3,150 mcg/min",
        tips: whyWeight("70 kg", "45 mcg/kg/min", "mcg per minute"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("3,150 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("100 mL", "1,000 mg"),
          f("60 min", "1 hr"),
        ],
        result: "18.9 mL/hr",
        tips: whyDrip("100 mL per 1,000 mg"),
      },
    ],
  },
  {
    id: 57,
    title: "Advanced Loading Dose for Digoxin",
    prompt:
      "A patient is prescribed a digoxin loading dose of 12 mcg/kg. The patient weighs 68 kg, and the pharmacy provides digoxin at a concentration of 0.25 mg/mL. Calculate the volume in mL for the loading dose.",
    answer: 3.264,
    unit: "mL",
    rounding: {
      exact: "3.264 mL",
      place: "hundredth",
      rounded: "3.26 mL",
    },
    tolerance: 0.02,
    setup: {
      unit: "mL",
      convert: "Yes → mcg to mg",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("68 kg"), f("12 mcg", "1 kg")],
        result: "816 mcg",
        tips: whyWeight("68 kg", "12 mcg/kg", "the mcg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("816 mcg"), f("1 mg", "1,000 mcg"), f("1 mL", "0.25 mg")],
        result: "3.264 mL",
        tips: whyMcgToVolume("0.25 mg/mL"),
      },
    ],
  },
  {
    id: 58,
    title: "Pediatric IV Bolus and Maintenance",
    prompt:
      "A pediatric patient weighing 20 kg is prescribed an IV bolus of 15 mL/kg over 30 minutes followed by maintenance fluids using the 4-2-1 rule. Calculate the total volume infused after 3 hours, including both bolus and maintenance.",
    answer: 450,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Bolus",
        chain: [v("20 kg"), f("15 mL", "1 kg")],
        result: "300 mL",
        tips: whyBolus("20 kg", "15 mL/kg"),
      },
      {
        label: "Maintenance rate (4-2-1)",
        chain: [v("4 mL/hr × 10 kg + 2 mL/hr × 10 kg")],
        result: "60 mL/hr",
        tips: [
          "20 kg is exactly the first two bands (10 kg at 4 mL/hr and 10 kg at 2 mL/hr), with nothing left over for the 1 mL/hr tier.",
        ],
      },
      {
        label: "Maintenance time",
        chain: [v("3 hr − 0.5 hr")],
        result: "2.5 hr",
        tips: whyMaintWindow("30-minute", "3-hour"),
      },
      {
        label: "Maintenance volume",
        chain: [v("2.5 hr"), f("60 mL", "1 hr")],
        result: "150 mL",
        tips: whyMaintVolume,
      },
      {
        label: "Total",
        chain: [v("300 + 150 mL")],
        result: "450 mL",
        tips: whyBolusTotal,
      },
    ],
    note: "This assumes maintenance starts when the 30-minute bolus finishes.",
  },
  {
    id: 59,
    title: "Advanced ICU Drip Rate",
    prompt:
      "A patient is prescribed a vasopressin infusion at 0.04 units/min. The pharmacy provides vasopressin 20 units in 500 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 60,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "Yes → min to hr",
    },
    steps: [
      {
        label: "Infusion rate",
        chain: [
          v("0.04 units/min"),
          f("500 mL", "20 units"),
          f("60 min", "1 hr"),
        ],
        result: "60 mL/hr",
        tips: whyUnitDrip("0.04 units/min", "500 mL per 20 units"),
      },
    ],
  },
  {
    id: 60,
    title: "Complex Medication Calculation",
    prompt:
      "A patient is prescribed a fentanyl infusion at 3 mcg/kg/hr. The patient weighs 78 kg, and the pharmacy provides fentanyl 2,500 mcg in 250 mL NS. Calculate the infusion rate in mL/hr.",
    answer: 23.4,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "mcg per hour",
        chain: [v("78 kg"), f("3 mcg/hr", "1 kg")],
        result: "234 mcg/hr",
        tips: whyWeightHourly("78 kg", "3 mcg/kg/hr"),
      },
      {
        label: "Infusion rate",
        chain: [v("234 mcg/hr"), f("250 mL", "2,500 mcg")],
        result: "23.4 mL/hr",
        tips: whyMcgBag("250 mL per 2,500 mcg"),
      },
    ],
  },
  {
    id: 61,
    title: "Advanced Continuous Dopamine Infusion",
    prompt:
      "A patient weighing 70 kg is prescribed a dopamine infusion at 10 mcg/kg/min. The pharmacy provides dopamine 400 mg in 250 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 26.25,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("70 kg"), f("10 mcg/min", "1 kg")],
        result: "700 mcg/min",
        tips: whyWeight("70 kg", "10 mcg/kg/min", "mcg per minute"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("700 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("250 mL", "400 mg"),
          f("60 min", "1 hr"),
        ],
        result: "26.25 mL/hr",
        tips: whyDrip("250 mL per 400 mg"),
      },
    ],
  },
  {
    id: 62,
    title: "Pediatric Safe Dose of Antibiotics",
    prompt:
      "A 6-year-old child weighing 25 kg is prescribed cefuroxime 100 mg/kg/day divided into two doses. The pharmacy provides a concentration of 200 mg/5 mL. Calculate the volume per dose in mL.",
    answer: 31.25,
    unit: "mL",
    tolerance: 0.02,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("25 kg"), f("100 mg/day", "1 kg")],
        result: "2,500 mg/day",
        tips: whyWeight("25 kg", "100 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("2,500 mg/day"), f("1 day", "2 doses")],
        result: "1,250 mg/dose",
        tips: whyDivide("two doses"),
      },
      {
        label: "Volume",
        chain: [v("1,250 mg"), f("5 mL", "200 mg")],
        result: "31.25 mL",
        tips: whyVolume("200 mg per 5 mL", "mg"),
      },
    ],
    note: "Safe dose check: the order works out to 100 mg/kg/day, or 2,500 mg/day. No ceiling was given here, so verify it against your drug reference and institutional limits before administering.",
  },
  {
    id: 63,
    title: "Heparin Infusion Dose Adjustment",
    prompt:
      "A patient on a heparin drip is ordered to increase the dose from 15 units/kg/hr to 18 units/kg/hr. The patient weighs 68 kg, and the pharmacy provides a concentration of 25,000 units in 500 mL. Calculate the new infusion rate in mL/hr.",
    answer: 24.48,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour at the new dose",
        chain: [v("68 kg"), f("18 units/hr", "1 kg")],
        result: "1,224 units/hr",
        tips: whyTitrate("18 units/kg/hr", "15 units/kg/hr", "68 kg"),
      },
      {
        label: "Infusion rate",
        chain: [v("1,224 units/hr"), f("500 mL", "25,000 units")],
        result: "24.48 mL/hr",
        tips: whyUnitsBag("25,000 units in 500 mL"),
      },
    ],
  },
  {
    id: 64,
    title: "IV Vancomycin Dosage and Administration",
    prompt:
      "A patient weighing 85 kg is prescribed vancomycin 20 mg/kg IV every 8 hours. The pharmacy supplies vancomycin at a concentration of 1 g/200 mL. Calculate the volume in mL per dose.",
    answer: 340,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "Yes → mg to g",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("85 kg"), f("20 mg", "1 kg")],
        result: "1,700 mg",
        tips: whyWeight("85 kg", "20 mg/kg", "the mg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("1,700 mg"), f("1 g", "1,000 mg"), f("200 mL", "1 g")],
        result: "340 mL",
        tips: whyMgToGramVolume("200 mL per 1 g"),
      },
    ],
  },
  {
    id: 65,
    title: "Advanced Magnesium Sulfate Loading Dose",
    prompt:
      "A patient with preeclampsia is prescribed a magnesium sulfate loading dose of 5 g over 15 minutes. The pharmacy provides magnesium sulfate 40 g in 1,000 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 500,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "Yes → min to hr",
    },
    steps: [
      {
        label: "Volume of the dose",
        chain: [v("5 g"), f("1,000 mL", "40 g")],
        result: "125 mL",
        tips: whyBagVolume("5 g", "40 g in 1,000 mL"),
      },
      {
        label: "Infusion rate",
        chain: [f("125 mL", "15 min"), f("60 min", "1 hr")],
        result: "500 mL/hr",
        tips: whyTimedRate("125 mL", "15 min"),
      },
    ],
  },
  {
    id: 66,
    title: "Pediatric Fluid Replacement and Maintenance",
    prompt:
      "A pediatric patient weighing 18 kg has a fluid deficit of 120 mL. Maintenance fluids are required using the 4-2-1 method. The deficit is to be replaced over 6 hours. Calculate the total hourly infusion rate in mL/hr.",
    answer: 76,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "First 10 kg",
        chain: [v("10 kg"), f("4 mL/hr", "1 kg")],
        result: "40 mL/hr",
        tips: why421First,
      },
      {
        label: "Next 8 kg",
        chain: [v("8 kg"), f("2 mL/hr", "1 kg")],
        result: "16 mL/hr",
        tips: why421Second("8 kg"),
      },
      {
        label: "Maintenance",
        chain: [v("40 + 16 mL/hr")],
        result: "56 mL/hr",
        tips: why421Sum,
      },
      {
        label: "Deficit replacement",
        chain: [f("120 mL", "6 hr")],
        result: "20 mL/hr",
        tips: whyDeficit("120 mL", "6 hours"),
      },
      {
        label: "Total",
        chain: [v("56 + 20 mL/hr")],
        result: "76 mL/hr",
        tips: whyTotalRate,
      },
    ],
  },
  {
    id: 67,
    title: "Continuous Insulin Infusion",
    prompt:
      "A patient weighing 60 kg is prescribed a regular insulin infusion at 0.15 units/kg/hr. The pharmacy provides a concentration of 100 units in 100 mL NS. Calculate the infusion rate in mL/hr.",
    answer: 9,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour",
        chain: [v("60 kg"), f("0.15 units/hr", "1 kg")],
        result: "9 units/hr",
        tips: whyWeight("60 kg", "0.15 units/kg/hr", "units per hour"),
      },
      {
        label: "Infusion rate",
        chain: [v("9 units/hr"), f("100 mL", "100 units")],
        result: "9 mL/hr",
        tips: whyUnitsBag("100 units in 100 mL"),
      },
    ],
    note: "At 1 unit/mL the rate in mL/hr matches the units/hr exactly.",
  },
  {
    id: 68,
    title: "Norepinephrine Infusion for Septic Shock",
    prompt:
      "A patient weighing 90 kg is receiving norepinephrine at 0.08 mcg/kg/min. The pharmacy provides norepinephrine 4 mg in 250 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 27,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("90 kg"), f("0.08 mcg/min", "1 kg")],
        result: "7.2 mcg/min",
        tips: whyWeight("90 kg", "0.08 mcg/kg/min", "mcg per minute"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("7.2 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("250 mL", "4 mg"),
          f("60 min", "1 hr"),
        ],
        result: "27 mL/hr",
        tips: whyDrip("250 mL per 4 mg"),
      },
    ],
  },
  {
    id: 69,
    title: "Advanced Propofol Sedation",
    prompt:
      "A 75-kg patient is sedated with propofol at 65 mcg/kg/min. The pharmacy provides propofol at a concentration of 1,000 mg in 100 mL. Calculate the infusion rate in mL/hr.",
    answer: 29.25,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("75 kg"), f("65 mcg/min", "1 kg")],
        result: "4,875 mcg/min",
        tips: whyWeight("75 kg", "65 mcg/kg/min", "mcg per minute"),
      },
      {
        label: "Infusion rate",
        chain: [
          v("4,875 mcg/min"),
          f("1 mg", "1,000 mcg"),
          f("100 mL", "1,000 mg"),
          f("60 min", "1 hr"),
        ],
        result: "29.25 mL/hr",
        tips: whyDrip("100 mL per 1,000 mg"),
      },
    ],
  },
  {
    id: 70,
    title: "Pediatric Antibiotic Dosage Calculation",
    prompt:
      "A 4-year-old child weighing 16 kg is prescribed amoxicillin 90 mg/kg/day divided into three doses. The pharmacy provides a concentration of 400 mg/5 mL. Calculate the volume in mL per dose.",
    answer: 6,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("16 kg"), f("90 mg/day", "1 kg")],
        result: "1,440 mg/day",
        tips: whyWeight("16 kg", "90 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("1,440 mg/day"), f("1 day", "3 doses")],
        result: "480 mg/dose",
        tips: whyDivide("three doses"),
      },
      {
        label: "Volume",
        chain: [v("480 mg"), f("5 mL", "400 mg")],
        result: "6 mL",
        tips: whyVolume("400 mg per 5 mL", "mg"),
      },
    ],
  },
  {
    id: 71,
    title: "ICU Vasopressin Drip Rate",
    prompt:
      "A patient is prescribed vasopressin at 0.03 units/min. The pharmacy provides vasopressin 20 units in 500 mL D5W. Calculate the infusion rate in mL/hr.",
    answer: 45,
    unit: "mL/hr",
    tolerance: 0.01,
    setup: {
      unit: "mL/hr",
      convert: "Yes → min to hr",
    },
    steps: [
      {
        label: "Infusion rate",
        chain: [
          v("0.03 units/min"),
          f("500 mL", "20 units"),
          f("60 min", "1 hr"),
        ],
        result: "45 mL/hr",
        tips: whyUnitDrip("0.03 units/min", "500 mL per 20 units"),
      },
    ],
  },
  {
    id: 72,
    title: "Loading Dose of Digoxin for Atrial Fibrillation",
    prompt:
      "A patient is prescribed a digoxin loading dose of 10 mcg/kg IV. The patient weighs 75 kg, and the pharmacy provides digoxin at a concentration of 0.25 mg/mL. Calculate the volume in mL to administer.",
    answer: 3,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "Yes → mcg to mg",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("75 kg"), f("10 mcg", "1 kg")],
        result: "750 mcg",
        tips: whyWeight("75 kg", "10 mcg/kg", "the mcg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("750 mcg"), f("1 mg", "1,000 mcg"), f("1 mL", "0.25 mg")],
        result: "3 mL",
        tips: whyMcgToVolume("0.25 mg/mL"),
      },
    ],
  },
  {
    id: 73,
    title: "Pediatric IV Bolus and Maintenance Fluids",
    prompt:
      "A 10-kg pediatric patient is prescribed an IV bolus of 20 mL/kg over 1 hour followed by maintenance fluids using the 4-2-1 rule. Calculate the total volume infused after 4 hours.",
    answer: 320,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Bolus",
        chain: [v("10 kg"), f("20 mL", "1 kg")],
        result: "200 mL",
        tips: whyBolus("10 kg", "20 mL/kg"),
      },
      {
        label: "Maintenance rate (4-2-1)",
        chain: [v("10 kg"), f("4 mL/hr", "1 kg")],
        result: "40 mL/hr",
        tips: [
          "10 kg sits entirely inside the first band, so every kg earns 4 mL/hr. There is no second or third tier to add on.",
        ],
      },
      {
        label: "Maintenance time",
        chain: [v("4 hr − 1 hr")],
        result: "3 hr",
        tips: whyMaintWindow("1-hour", "4-hour"),
      },
      {
        label: "Maintenance volume",
        chain: [v("3 hr"), f("40 mL", "1 hr")],
        result: "120 mL",
        tips: whyMaintVolume,
      },
      {
        label: "Total",
        chain: [v("200 + 120 mL")],
        result: "320 mL",
        tips: whyBolusTotal,
      },
    ],
    note: "This assumes maintenance starts when the 1-hour bolus finishes.",
  },
  {
    id: 74,
    title: "Advanced Fentanyl Infusion",
    prompt:
      "A patient weighing 72 kg is receiving a fentanyl infusion at 4 mcg/kg/hr. The pharmacy provides fentanyl at a concentration of 2,500 mcg in 250 mL NS. Calculate the infusion rate in mL/hr.",
    answer: 28.8,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "mcg per hour",
        chain: [v("72 kg"), f("4 mcg/hr", "1 kg")],
        result: "288 mcg/hr",
        tips: whyWeightHourly("72 kg", "4 mcg/kg/hr"),
      },
      {
        label: "Infusion rate",
        chain: [v("288 mcg/hr"), f("250 mL", "2,500 mcg")],
        result: "28.8 mL/hr",
        tips: whyMcgBag("250 mL per 2,500 mcg"),
      },
    ],
  },
  {
    id: 75,
    title: "ICU Sedation with Dexmedetomidine",
    prompt:
      "A 68-kg patient is receiving dexmedetomidine at 0.7 mcg/kg/hr. The pharmacy provides dexmedetomidine 200 mcg in 50 mL. Calculate the infusion rate in mL/hr.",
    answer: 11.9,
    unit: "mL/hr",
    tolerance: 0.02,
    setup: {
      unit: "mL/hr",
      convert: "No",
    },
    steps: [
      {
        label: "mcg per hour",
        chain: [v("68 kg"), f("0.7 mcg/hr", "1 kg")],
        result: "47.6 mcg/hr",
        tips: whyWeightHourly("68 kg", "0.7 mcg/kg/hr"),
      },
      {
        label: "Infusion rate",
        chain: [v("47.6 mcg/hr"), f("50 mL", "200 mcg")],
        result: "11.9 mL/hr",
        tips: whyMcgBag("50 mL per 200 mcg"),
      },
    ],
  },
  {
    id: 76,
    title: "Prochlorperazine IM Dose",
    prompt:
      "You need to administer prochlorperazine (Compazine) 10 mg IM to a nauseated patient. You have on hand Compazine 5 mg/mL. How should you prepare the correct dose?",
    answer: 2,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("10 mg"), f("1 mL", "5 mg")],
        result: "2 mL",
        tips: whyOrderVolume("10 mg", "5 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 77,
    title: "Furosemide IV Push",
    prompt:
      "An order reads furosemide (Lasix) 40 mg IV push. You have on hand 20 mg/2 mL. How should you prepare the correct dose?",
    answer: 4,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("40 mg"), f("2 mL", "20 mg")],
        result: "4 mL",
        tips: whyOrderVolume("40 mg", "20 mg per 2 mL", "mg"),
      },
    ],
  },
  {
    id: 78,
    title: "Diazepam IV Push",
    prompt:
      "You have on hand diazepam (Valium) 5 mg/mL. You need to administer 8 mg IV push stat to a patient having a seizure. How much should you draw into the syringe?",
    answer: 1.6,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("8 mg"), f("1 mL", "5 mg")],
        result: "1.6 mL",
        tips: whyOrderVolume("8 mg", "5 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 79,
    title: "Metoprolol Scored Tablet",
    prompt:
      "Your patient is to receive metoprolol tartrate (Lopressor) 25 mg PO daily. The pharmacist dispenses 50 mg scored tablets. How many should your patient take each day?",
    answer: 0.5,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("25 mg"), f("1 tablet", "50 mg")],
        result: "0.5 tablets",
        tips: whyTablets("25 mg", "50 mg per tablet", "mg"),
      },
    ],
    note: "Scored means it breaks cleanly in half, so half a tablet is a real dose here.",
  },
  {
    id: 80,
    title: "Penicillin IM Dose",
    prompt:
      "Your order reads penicillin 1.2 million units IM daily. You have penicillin 500,000 units/mL. How should you prepare the correct dose?",
    answer: 2.4,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("1,200,000 units"), f("1 mL", "500,000 units")],
        result: "2.4 mL",
        tips: whyOrderUnits("1,200,000 units", "500,000 units/mL"),
      },
    ],
    note: "1.2 million written out is 1,200,000 units.",
  },
  {
    id: 81,
    title: "Labetalol IV Push",
    prompt:
      "Your order reads labetalol 40 mg IV push every 10 minutes until blood pressure is lower than 140/90 mm Hg. You have labetalol 5 mg/mL available. How should you prepare the correct dose?",
    answer: 8,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("40 mg"), f("1 mL", "5 mg")],
        result: "8 mL",
        tips: whyOrderVolume("40 mg", "5 mg/mL", "mg"),
      },
    ],
    note: "The every-10-minutes part sets the schedule, not the volume of one dose.",
  },
  {
    id: 82,
    title: "Ergocalciferol Liquid",
    prompt:
      "You have on hand ergocalciferol liquid 8,000 units/2 mL. Your order reads ergocalciferol 225,000 units PO daily. How should you prepare the correct dose? (Do not round.)",
    answer: 56.25,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("225,000 units"), f("2 mL", "8,000 units")],
        result: "56.25 mL",
        tips: whyOrderUnits("225,000 units", "8,000 units per 2 mL"),
      },
    ],
  },
  {
    id: 83,
    title: "Ergocalciferol Tablets",
    prompt:
      "Your order reads ergocalciferol 225,000 units PO daily. You have on hand ergocalciferol in 50,000 unit tablets. How many do you administer?",
    answer: 4.5,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("225,000 units"), f("1 tablet", "50,000 units")],
        result: "4.5 tablets",
        tips: whyTablets("225,000 units", "50,000 units per tablet", "units"),
      },
    ],
  },
  {
    id: 84,
    title: "Cortisone Tablets",
    prompt:
      "Your order reads cortisone 15 mg PO every morning. You have on hand cortisone 10 mg tablets. How should you prepare the correct dose?",
    answer: 1.5,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("15 mg"), f("1 tablet", "10 mg")],
        result: "1.5 tablets",
        tips: whyTablets("15 mg", "10 mg per tablet", "mg"),
      },
    ],
  },
  {
    id: 85,
    title: "Amoxicillin Suspension",
    prompt:
      "Amoxil (amoxicillin) suspension 180 mg PO bid is ordered for a patient who cannot swallow pills. It is supplied as 125 mg/5 mL. How many milliliters should you administer?",
    answer: 7.2,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("180 mg"), f("5 mL", "125 mg")],
        result: "7.2 mL",
        tips: whyOrderVolume("180 mg", "125 mg per 5 mL", "mg"),
      },
    ],
    note: "bid tells you how often, not how much. 180 mg is already the single dose.",
  },
  {
    id: 86,
    title: "Diltiazem Scored Tablets",
    prompt:
      "Diltiazem (Cardizem) 90 mg PO tid is ordered for a patient with hypertension. It is supplied in 60 mg scored tablets. How many tablets should you administer?",
    answer: 1.5,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("90 mg"), f("1 tablet", "60 mg")],
        result: "1.5 tablets",
        tips: whyTablets("90 mg", "60 mg per tablet", "mg"),
      },
    ],
  },
  {
    id: 87,
    title: "Atropine Preoperative Dose",
    prompt:
      "Atropine 0.6 mg IM is ordered preoperatively. It is supplied as 0.4 mg/mL. How many milliliters should you administer?",
    answer: 1.5,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("0.6 mg"), f("1 mL", "0.4 mg")],
        result: "1.5 mL",
        tips: whyOrderVolume("0.6 mg", "0.4 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 88,
    title: "Diphenhydramine IM",
    prompt:
      "You have an order for diphenhydramine hydrochloride (Benadryl) 40 mg IM ASAP. You have on hand Benadryl 25 mg/mL. How many milliliters do you prepare?",
    answer: 1.6,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("40 mg"), f("1 mL", "25 mg")],
        result: "1.6 mL",
        tips: whyOrderVolume("40 mg", "25 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 89,
    title: "Digoxin Tablets",
    prompt:
      "You have digoxin (Lanoxin) 0.25 mg tablets, and you need to administer 0.375 mg PO. How many tablets should you administer?",
    answer: 1.5,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("0.375 mg"), f("1 tablet", "0.25 mg")],
        result: "1.5 tablets",
        tips: whyTablets("0.375 mg", "0.25 mg per tablet", "mg"),
      },
    ],
  },
  {
    id: 90,
    title: "Phenobarbital IV",
    prompt:
      "Phenobarbital is supplied as 60 mg/mL. You need to administer 160 mg IV stat. How many milliliters should you administer? (Round to the nearest tenth.)",
    answer: 2.666667,
    unit: "mL",
    rounding: {
      exact: "2.67 mL",
      place: "tenth",
      rounded: "2.7 mL",
    },
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("160 mg"), f("1 mL", "60 mg")],
        result: "2.67 mL",
        tips: whyOrderVolume("160 mg", "60 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 91,
    title: "Furosemide IV Volume",
    prompt:
      "You have an order for furosemide (Lasix) 80 mg IV every morning. You have on hand Lasix 20 mg in 2 mL sterile water. How many milliliters should you prepare?",
    answer: 8,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("80 mg"), f("2 mL", "20 mg")],
        result: "8 mL",
        tips: whyOrderVolume("80 mg", "20 mg per 2 mL", "mg"),
      },
    ],
  },
  {
    id: 92,
    title: "Furosemide Tablets",
    prompt:
      "You need to administer 40 mg of furosemide (Lasix) PO. You have on hand Lasix 20 mg tablets. How many tablets should you give?",
    answer: 2,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("40 mg"), f("1 tablet", "20 mg")],
        result: "2 tablets",
        tips: whyTablets("40 mg", "20 mg per tablet", "mg"),
      },
    ],
  },
  {
    id: 93,
    title: "Heparin Subcutaneous",
    prompt:
      "You have an order for heparin 3,000 units SC every 12 hours. You have available 5,000 units/mL. How many milliliters will you give?",
    answer: 0.6,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("3,000 units"), f("1 mL", "5,000 units")],
        result: "0.6 mL",
        tips: whyOrderUnits("3,000 units", "5,000 units/mL"),
      },
    ],
  },
  {
    id: 94,
    title: "Captopril Scored Tablets",
    prompt:
      "A patient is sent home on captopril (Capoten) 6.25 mg PO bid. Her pharmacist dispenses 25 mg scored tablets. How many tablets should the patient take for each dose?",
    answer: 0.25,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("6.25 mg"), f("1 tablet", "25 mg")],
        result: "0.25 tablets",
        tips: whyTablets("6.25 mg", "25 mg per tablet", "mg"),
      },
    ],
    note: "A quarter of a scored tablet. Worth querying, since most scored tablets only break reliably in half.",
  },
  {
    id: 95,
    title: "Phenobarbital Elixir",
    prompt:
      "You have an order for phenobarbital 50 mg PO at bedtime. It is supplied as phenobarbital elixir 20 mg/5 mL. How much will you administer?",
    answer: 12.5,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("50 mg"), f("5 mL", "20 mg")],
        result: "12.5 mL",
        tips: whyOrderVolume("50 mg", "20 mg per 5 mL", "mg"),
      },
    ],
  },
  {
    id: 96,
    title: "Lorazepam IM",
    prompt:
      "You need to administer lorazepam (Ativan) 3 mg IM to an agitated patient. You have on hand 4 mg/mL. How much do you prepare? (Do not round.)",
    answer: 0.75,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("3 mg"), f("1 mL", "4 mg")],
        result: "0.75 mL",
        tips: whyOrderVolume("3 mg", "4 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 97,
    title: "Methylprednisolone IV Push",
    prompt:
      "You need to administer 125 mg of methylprednisolone sodium succinate (Solu-Medrol) IV push bid to a patient with an acute exacerbation of COPD. You have on hand 40 mg/mL. How much do you prepare? (Round to the nearest tenth.)",
    answer: 3.125,
    unit: "mL",
    rounding: {
      exact: "3.125 mL",
      place: "tenth",
      rounded: "3.1 mL",
    },
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("125 mg"), f("1 mL", "40 mg")],
        result: "3.125 mL",
        tips: whyOrderVolume("125 mg", "40 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 98,
    title: "Warfarin Dose Adjustment",
    prompt:
      "A patient has a bottle of warfarin (Coumadin) 5 mg tablets at home. After his most recent INR, the doctor calls and tells him to take 7.5 mg/day. How many tablets should the patient take?",
    answer: 1.5,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("7.5 mg"), f("1 tablet", "5 mg")],
        result: "1.5 tablets",
        tips: whyTablets("7.5 mg", "5 mg per tablet", "mg"),
      },
    ],
  },
  {
    id: 99,
    title: "Penicillin Syringe Volume",
    prompt:
      "You have on hand penicillin 300,000 units/mL. Your order reads penicillin 1,000,000 units IM. How will you fill the syringe? (Round to the nearest tenth.)",
    answer: 3.333333,
    unit: "mL",
    rounding: {
      exact: "3.33 mL",
      place: "tenth",
      rounded: "3.3 mL",
    },
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("1,000,000 units"), f("1 mL", "300,000 units")],
        result: "3.33 mL",
        tips: whyOrderUnits("1,000,000 units", "300,000 units/mL"),
      },
    ],
  },
  {
    id: 100,
    title: "Alprazolam Tablets",
    prompt:
      "The physician orders alprazolam (Xanax) 0.5 mg PO. You have on hand Xanax 0.25 mg tablets. How many will you give?",
    answer: 2,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("0.5 mg"), f("1 tablet", "0.25 mg")],
        result: "2 tablets",
        tips: whyTablets("0.5 mg", "0.25 mg per tablet", "mg"),
      },
    ],
  },
  {
    id: 101,
    title: "Erythromycin Suspension",
    prompt:
      "You need to administer 400 mg of erythromycin PO. You have on hand a suspension of 125 mg/5 mL. How much will you prepare?",
    answer: 16,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("400 mg"), f("5 mL", "125 mg")],
        result: "16 mL",
        tips: whyOrderVolume("400 mg", "125 mg per 5 mL", "mg"),
      },
    ],
  },
  {
    id: 102,
    title: "Meperidine IM",
    prompt:
      "The physician orders meperidine 75 mg IM every 4 to 6 hours prn for a patient admitted with acute cholecystitis. You have on hand meperidine 50 mg/mL. How much will you give?",
    answer: 1.5,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("75 mg"), f("1 mL", "50 mg")],
        result: "1.5 mL",
        tips: whyOrderVolume("75 mg", "50 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 103,
    title: "Methylprednisolone IM",
    prompt:
      "A patient is receiving 60 mg of methylprednisolone IM every 8 hours. You have on hand 75 mg/mL. How much will you draw up?",
    answer: 0.8,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("60 mg"), f("1 mL", "75 mg")],
        result: "0.8 mL",
        tips: whyOrderVolume("60 mg", "75 mg/mL", "mg"),
      },
    ],
    note: "The dose is smaller than what's in 1 mL, so the answer is under a millilitre. That's expected, not a mistake.",
  },
  {
    id: 104,
    title: "Acetaminophen Elixir",
    prompt:
      "Your patient has a headache but has difficulty swallowing pills. The physician orders acetaminophen 1,000 mg PO every 4 to 6 hours prn. You have acetaminophen elixir 160 mg in 5 mL. How much will you administer? (Do not round.)",
    answer: 31.25,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("1,000 mg"), f("5 mL", "160 mg")],
        result: "31.25 mL",
        tips: whyOrderVolume("1,000 mg", "160 mg per 5 mL", "mg"),
      },
    ],
  },
  {
    id: 105,
    title: "Morphine IM Stat",
    prompt:
      "A patient is admitted to the emergency room with a fractured leg. The physician orders morphine 15 mg IM stat. You have on hand morphine 10 mg/mL. How many milliliters will you administer?",
    answer: 1.5,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("15 mg"), f("1 mL", "10 mg")],
        result: "1.5 mL",
        tips: whyOrderVolume("15 mg", "10 mg/mL", "mg"),
      },
    ],
  },
  {
    id: 106,
    title: "Methylprednisolone From Two Vials",
    prompt:
      "A patient is receiving 160 mg of methylprednisolone IM every 12 hours. You have on hand two vials that each contain 125 mg/2 mL. How much will you draw into a syringe? (Round to the nearest tenth.)",
    answer: 2.56,
    unit: "mL",
    rounding: {
      exact: "2.56 mL",
      place: "tenth",
      rounded: "2.6 mL",
    },
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("160 mg"), f("2 mL", "125 mg")],
        result: "2.56 mL",
        tips: whyOrderVolume("160 mg", "125 mg per 2 mL", "mg"),
      },
    ],
    note: "One vial holds only 2 mL, so this dose spans both. That's why there are two vials, not because it's two doses.",
  },
  {
    id: 107,
    title: "Lorazepam Tablets",
    prompt:
      "You have available lorazepam (Ativan) 0.5 mg tablets, and you need to administer 1 mg PO. How many tablets will you administer?",
    answer: 2,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("1 mg"), f("1 tablet", "0.5 mg")],
        result: "2 tablets",
        tips: whyTablets("1 mg", "0.5 mg per tablet", "mg"),
      },
    ],
  },
  {
    id: 108,
    title: "Codeine IM",
    prompt:
      'The physician writes a "now" order for codeine 45 mg IM for a patient with a vertebral compression fracture. You have on hand codeine 60 mg/2 mL. How many milliliters should you give?',
    answer: 1.5,
    unit: "mL",
    tolerance: 0.01,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("45 mg"), f("2 mL", "60 mg")],
        result: "1.5 mL",
        tips: whyOrderVolume("45 mg", "60 mg per 2 mL", "mg"),
      },
    ],
  },
  {
    id: 109,
    title: "Digoxin Daily Tablets",
    prompt:
      "A patient with heart failure has a daily order for digoxin 0.25 mg PO. Digoxin 0.125 mg tablets are available. How many tablets should you give?",
    answer: 2,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("0.25 mg"), f("1 tablet", "0.125 mg")],
        result: "2 tablets",
        tips: whyTablets("0.25 mg", "0.125 mg per tablet", "mg"),
      },
    ],
  },
  {
    id: 110,
    title: "Fluid Restriction in Cups",
    prompt:
      "A home care patient must restrict fluid intake to 2 L every 24 hours. He has only household measuring cups. How many cups may he drink daily without exceeding the 2 L limit?",
    answer: 8,
    unit: "c",
    tolerance: 0.35,
    setup: {
      unit: "c",
      convert: "Yes → L to mL, mL to fl oz, fl oz to cups",
    },
    steps: [
      {
        label: "Litres into millilitres",
        chain: [v("2 L"), f("1,000 mL", "1 L")],
        result: "2,000 mL",
        tips: [
          "Start with the limit he's been given → 2 L.",
          "Nothing in the kitchen is marked in litres, so the first move is into a unit the household measures share. 1,000 mL per 1 L cancels the litres.",
        ],
      },
      {
        label: "Millilitres into fluid ounces",
        chain: [v("2,000 mL"), f("1 fl oz", "30 mL")],
        result: "66.67 fl oz",
        tips: [
          "30 mL per fluid ounce is the bridge between the metric and household systems. Write it with fl oz on top so the mL cancels.",
        ],
      },
      {
        label: "Fluid ounces into cups",
        chain: [v("66.67 fl oz"), f("1 c", "8 fl oz")],
        result: "8.33 c",
        tips: [
          "A cup is 8 fl oz, so put cups on top and the fluid ounces cancel.",
          "Three factors, each one swapping a single unit.",
          "The chain is long but no step is hard.",
        ],
      },
    ],
    note: "8.33 cups is the arithmetic, but the order is a ceiling, so round down: 8 full cups is the most he can drink without going over. A cup is 8 fl oz, roughly 240 mL.",
  },
  {
    id: 111,
    title: "Acetaminophen Safe Dose Check",
    prompt:
      "Each acetaminophen (Tylenol) #3 tablet has 325 mg of acetaminophen and 30 mg of codeine. A patient is told to take 2 tablets PO every 4 hours for pain. The maximum safe dose of acetaminophen is 4 g/day. How many grams of acetaminophen will the patient take in 24 hours?",
    answer: 3.9,
    unit: "g",
    tolerance: 0.01,
    setup: {
      unit: "g",
      convert: "Yes → mg to g",
    },
    steps: [
      {
        label: "Acetaminophen per dose",
        chain: [v("2 tablets"), f("325 mg", "1 tablet")],
        result: "650 mg",
        tips: [
          "Start with what the patient actually swallows → 2 tablets.",
          "The 325 mg per tablet is the relationship, so the tablets cancel and milligrams survive.",
          "Ignore the codeine. The ceiling in this question is on the acetaminophen.",
        ],
      },
      {
        label: "Doses per day",
        chain: [f("24 hr", "4 hr")],
        result: "6 doses",
        tips: [
          "Every 4 hours means the day divides into 4-hour slots. The hours cancel and leave a plain count.",
        ],
      },
      {
        label: "Daily total",
        chain: [v("650 mg/dose"), v("6 doses")],
        result: "3,900 mg",
        tips: [
          "Amount per dose times the number of doses. The doses cancel, leaving milligrams for the whole day.",
        ],
      },
      {
        label: "In grams",
        chain: [v("3,900 mg"), f("1 g", "1,000 mg")],
        result: "3.9 g",
        tips: [
          "The ceiling is written in grams, so convert before comparing. Units have to match before a comparison means anything.",
        ],
      },
    ],
    note: "3.9 g/day sits just under the 4 g/day maximum, so the acetaminophen is within range, but only barely. It leaves no room for any other paracetamol-containing product. The codeine has no fixed ceiling here. It varies with tolerance.",
  },
  {
    id: 112,
    title: "Acetaminophen Over 24 Hours",
    prompt:
      "A patient is taking acetaminophen (Tylenol) 325 mg, 2 tablets PO every 6 hours. How many grams is the patient receiving in 24 hours?",
    answer: 2.6,
    unit: "g",
    tolerance: 0.01,
    setup: {
      unit: "g",
      convert: "Yes → mg to g",
    },
    steps: [
      {
        label: "Acetaminophen per dose",
        chain: [v("2 tablets"), f("325 mg", "1 tablet")],
        result: "650 mg",
        tips: [
          "Start with the 2 tablets taken at once. The 325 mg per tablet cancels the tablets and leaves milligrams.",
        ],
      },
      {
        label: "Doses per day",
        chain: [f("24 hr", "6 hr")],
        result: "4 doses",
        tips: [
          "Every 6 hours divides the day into four slots. The hours cancel and leave a count.",
        ],
      },
      {
        label: "Daily total",
        chain: [v("650 mg/dose"), v("4 doses")],
        result: "2,600 mg",
        tips: [
          "Per dose times the number of doses, so the doses cancel and milligrams remain.",
        ],
      },
      {
        label: "In grams",
        chain: [v("2,600 mg"), f("1 g", "1,000 mg")],
        result: "2.6 g",
        tips: [
          "The question asks for grams, so finish with 1 g per 1,000 mg and let the milligrams cancel.",
        ],
      },
    ],
  },
  {
    id: 113,
    title: "Erythromycin Tablets",
    prompt:
      "You need to administer 250 mg of erythromycin PO. You have on hand 0.5 g tablets. How many tablets will you give?",
    answer: 0.5,
    unit: "tablets",
    tolerance: 0.01,
    setup: {
      unit: "tablets",
      convert: "Yes → g to mg",
    },
    steps: [
      {
        label: "Tablet strength in milligrams",
        chain: [v("0.5 g"), f("1,000 mg", "1 g")],
        result: "500 mg",
        tips: [
          "The order is in mg and the label is in g, and units have to match before anything can cancel. Convert the label first with 1,000 mg per 1 g.",
        ],
      },
      {
        label: "Tablets",
        chain: [v("250 mg"), f("1 tablet", "500 mg")],
        result: "0.5 tablets",
        tips: whyTablets("250 mg", "500 mg per tablet"),
      },
    ],
    note: "Half a tablet. Check that it's scored before breaking it.",
  },
  {
    id: 114,
    title: "Acetaminophen Elixir Per Dose",
    prompt:
      "A patient is instructed to take acetaminophen (Tylenol) liquid (elixir) 650 mg qid. The elixir is 160 mg/5 mL. How many milliliters per dose should the patient take? (Round to the nearest whole number.)",
    answer: 20.3125,
    unit: "mL",
    rounding: {
      exact: "20.3125 mL",
      place: "whole number",
      rounded: "20 mL",
    },
    tolerance: 0.35,
    setup: {
      unit: "mL",
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("650 mg"), f("5 mL", "160 mg")],
        result: "20.3125 mL",
        tips: whyOrderVolume("650 mg", "160 mg per 5 mL", "mg"),
      },
    ],
    note: "qid means four times a day, which sets the schedule, not this dose.",
  },
  {
    id: 115,
    mark: "star",
    title: "Lactulose Volume",
    prompt:
      "A nurse is preparing to administer Lactulose 30 g at 0900 and available Lactulose is 20 g/30 mL. How many mL should the nurse administer?",
    answer: 45,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "No" },
    steps: [
      {
        label: "Volume",
        chain: [v("30 g"), f("30 mL", "20 g")],
        result: "45 mL",
        tips: whyOrderVolume("30 g", "20 g per 30 mL", "g"),
      },
    ],
    note: "The 0900 is the schedule, not part of the arithmetic.",
  },
  {
    id: 116,
    mark: "star",
    title: "Teaspoons to Milliliters",
    prompt:
      "A patient is prescribed 2 teaspoons of Delsym. How many milliliters (mL) should the nurse administer?",
    answer: 10,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "Yes → tsp to mL" },
    steps: [
      {
        label: "Volume",
        chain: [v("2 tsp"), f("5 mL", "1 tsp")],
        result: "10 mL",
        tips: [
          "Start with what's ordered → 2 tsp. That's your quantity.",
          "1 tsp = 5 mL is the household to metric equality, so that's the factor.",
          FLIP("1 tsp per 5 mL"),
          "You want mL, so use the side with mL on top. The tsp cancels and mL is what's left.",
        ],
      },
    ],
    note: "Teaspoons at the bedside always become mL before you draw anything up.",
  },
  {
    id: 117,
    mark: "star",
    title: "Amoxicillin Tablets Per Day",
    prompt:
      "The provider orders 1 gram of amoxicillin BID (twice a day). The available tablets are 250 mg. How many tablets should the nurse administer for a day?",
    answer: 8,
    unit: "tablets",
    tolerance: 0.1,
    setup: { unit: "tablets", convert: "Yes → g to mg" },
    steps: [
      {
        label: "Convert",
        chain: [v("1 g"), f("1,000 mg", "1 g")],
        result: "1,000 mg",
        tips: [
          "The order is in grams and the tablets are labelled in mg, so the units have to match before anything can cancel.",
          "1 g = 1,000 mg, written with mg on top so the g cancels.",
        ],
      },
      {
        label: "Tablets per dose",
        chain: [v("1,000 mg"), f("1 tablet", "250 mg")],
        result: "4 tablets",
        tips: whyTablets("1,000 mg", "250 mg per tablet"),
      },
      {
        label: "Tablets for the day",
        chain: [v("2 doses"), f("4 tablets", "1 dose")],
        result: "8 tablets",
        tips: [
          "BID means twice a day, so the day holds 2 doses. That count is your quantity now.",
          "4 tablets per 1 dose is the relationship. The doses cancel and tablets are what is left.",
        ],
      },
    ],
    note: "Read the last line carefully. Per dose is 4, per day is 8.",
  },
  {
    id: 118,
    mark: "star",
    title: "Vancomycin Total Over A Course",
    prompt:
      "A nurse needs to administer PO vancomycin 125 mg capsule for C-diff TID (three times a day) for 7 days. How much mg of vancomycin does the patient take over 7 days?",
    answer: 2625,
    unit: "mg",
    tolerance: 1,
    setup: { unit: "mg", convert: "No" },
    steps: [
      {
        label: "Daily dose",
        chain: [v("125 mg/dose"), f("3 doses", "1 day")],
        result: "375 mg/day",
        tips: [
          "Start with what's in one capsule → 125 mg. That's your quantity.",
          "TID means three times a day, so 3 doses per 1 day is the relationship that turns a dose into a daily total.",
        ],
      },
      {
        label: "Whole course",
        chain: [v("375 mg/day"), f("7 days", "1 course")],
        result: "2,625 mg",
        tips: [
          "Now stretch the daily total across the days ordered.",
          "Multiply by 7 days and the per day cancels, leaving the milligrams for the full course.",
        ],
      },
    ],
    note: "Nothing needs converting here. Every number is already in mg.",
  },
  {
    id: 119,
    mark: "star",
    title: "Ciprofloxacin Tablets Per Dose",
    prompt:
      "A patient needs to take ciprofloxacin 500 mg in the morning and evening for 10 days. The available tablet is 200 mg. How many tablets should the nurse administer for this morning?",
    answer: 2.5,
    unit: "tablets",
    tolerance: 0.05,
    setup: { unit: "tablets", convert: "No" },
    steps: [
      {
        label: "Tablets",
        chain: [v("500 mg"), f("1 tablet", "200 mg")],
        result: "2.5 tablets",
        tips: whyTablets("500 mg", "200 mg per tablet"),
      },
    ],
    note: "The 10 days and the evening dose are there to distract you. This morning is one dose.",
  },
  {
    id: 120,
    mark: "star",
    title: "Lactated Ringer's Drip Rate",
    prompt:
      "You need to infuse 500 mL of Lactated Ringer's over 30 min. The drop factor of the tubing is 15 gtt/mL. Calculate the flow rate in gtt/min. (Round to the nearest whole number.)",
    answer: 250,
    unit: "gtt/min",
    formula: {
      top: "volume (mL) × drop factor (gtt/mL)",
      bottom: "time (min)",
    },
    tolerance: 0.5,
    setup: { unit: "gtt/min", convert: "No" },
    steps: [
      {
        label: "Drip rate",
        chain: [f("500 mL", "30 min"), f("15 gtt", "1 mL")],
        result: "250 gtt/min",
        tips: [
          "The volume and its time make a rate on their own → 500 mL over 30 min.",
          "The drop factor is the relationship, written with gtt on top so the mL cancels.",
          "The time is already in minutes, so there is no hour conversion to make here.",
        ],
      },
    ],
  },
  {
    id: 121,
    mark: "star",
    title: "Vancomycin Drip Rate",
    prompt:
      "You have an order for 1 g of vancomycin mixed with NS 250 mL infusing over 2 hours. The drop factor of the tubing is 10 gtt/mL. What is the drip rate for the vancomycin? (Round to the nearest whole number.)",
    answer: 20.83,
    unit: "gtt/min",
    formula: {
      top: "volume (mL) × drop factor (gtt/mL)",
      bottom: "time (min)",
    },
    rounding: {
      exact: "20.83 gtt/min",
      place: "whole number",
      rounded: "21 gtt/min",
    },
    tolerance: 0.5,
    setup: { unit: "gtt/min", convert: "Yes → hr to min" },
    steps: [
      {
        label: "Drip rate",
        chain: [f("250 mL", "2 hr"), f("10 gtt", "1 mL"), f("1 hr", "60 min")],
        result: "20.83 gtt/min",
        tips: [
          "The bag and its time make the rate → 250 mL over 2 hr.",
          "The drop factor goes in with gtt on top so the mL cancels.",
          "The answer has to be per minute, so 1 hr over 60 min turns the hours into minutes.",
        ],
      },
    ],
    note: "The 1 g of vancomycin never enters the arithmetic. You are timing the bag, not the drug.",
  },
  {
    id: 122,
    mark: "star",
    title: "IVIG Starting Rate",
    prompt:
      "A child weighs 60 lbs and a nurse needs to administer IVIG at 0900. The pharmacy recommended initiating the infusion at 0.5 mL/kg/hr for 30 minutes. What rate should the nurse start at? (Round to the nearest whole number.)",
    answer: 13.64,
    unit: "mL/hr",
    rounding: {
      exact: "13.64 mL/hr",
      place: "whole number",
      rounded: "14 mL/hr",
    },
    tolerance: 0.5,
    setup: { unit: "mL/hr", convert: "Yes → lbs to kg" },
    steps: [
      {
        label: "Weight",
        chain: [v("60 lbs"), f("1 kg", "2.2 lbs")],
        result: "27.27 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Rate",
        chain: [v("27.27 kg"), f("0.5 mL/hr", "1 kg")],
        result: "13.64 mL/hr",
        tips: whyWeightHourly("27.27 kg", "0.5 mL/kg/hr"),
      },
    ],
    note: "The 30 minutes tells you when to reassess, not what to set the pump to.",
  },
  {
    id: 123,
    mark: "star",
    title: "Ativan Prepared Volume",
    prompt:
      "A nurse needs to administer 4 mg of Ativan intravenously. Ativan is available in a 4 mg/2 mL vial and the medication requires 2 mL of Normal Saline to be diluted. How many mL should the nurse prepare?",
    answer: 4,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "No" },
    steps: [
      {
        label: "Drug volume",
        chain: [v("4 mg"), f("2 mL", "4 mg")],
        result: "2 mL",
        tips: whyOrderVolume("4 mg", "4 mg per 2 mL", "mg"),
      },
      {
        label: "Prepared volume",
        chain: [v("2 mL + 2 mL")],
        result: "4 mL",
        tips: [
          "The question asks what is in the syringe, not what the dose is.",
          "The 2 mL of drug and the 2 mL of Normal Saline both go in. Nothing cancels here. It is plain addition.",
        ],
      },
    ],
    note: "Diluent counts when the question says prepare. It would not count if the question asked for the dose.",
  },
  {
    id: 124,
    mark: "star",
    title: "Day Shift Fluid Intake",
    prompt:
      "A 2 days post-op patient consumed 3 cups of ice, 325 mL of Boost, 2 tablespoons of honey, 4 oz of jello, two chicken sandwiches, 1/2 cup of pudding and 4 oz of black tea during the day shift. What is the day shift fluid intake total in mL?",
    answer: 955,
    unit: "mL",
    tolerance: 1,
    setup: { unit: "mL", convert: "Yes → cups, tablespoons and oz to mL" },
    steps: [
      {
        label: "Ice",
        chain: [v("3 c"), f("120 mL", "1 c")],
        result: "360 mL",
        tips: [
          "Ice melts down to about half its volume, so a cup of ice counts as 120 mL and not 240 mL.",
          "Write it with mL on top so the cups cancel.",
        ],
      },
      {
        label: "Boost",
        chain: [v("325 mL")],
        result: "325 mL",
        tips: ["Already in mL, so it goes straight into the total."],
      },
      {
        label: "Honey",
        chain: [v("2 Tbsp"), f("15 mL", "1 Tbsp")],
        result: "30 mL",
        tips: [
          "Honey pours, so it counts as intake.",
          "1 Tbsp = 15 mL, written with mL on top so the Tbsp cancels.",
        ],
      },
      {
        label: "Jello",
        chain: [v("4 oz"), f("30 mL", "1 oz")],
        result: "120 mL",
        tips: [
          "Jello is liquid at room temperature, so it counts as intake.",
          "1 fl oz = 30 mL, written with mL on top so the oz cancels.",
        ],
      },
      {
        label: "Tea",
        chain: [v("4 oz"), f("30 mL", "1 oz")],
        result: "120 mL",
        tips: ["Same 30 mL per ounce that you used for the jello."],
      },
      {
        label: "Day shift total",
        chain: [v("360 mL + 325 mL + 30 mL + 120 mL + 120 mL")],
        result: "955 mL",
        tips: [
          "Nothing cancels here. It is plain addition.",
          "The pudding and the chicken sandwiches stay out. Everything else on the tray counts.",
        ],
      },
    ],
    note: "NOTE: we do not count pudding or solid food in fluid intake. Jello and honey do count, because they are liquid at room temperature.",
  },
  {
    id: 125,
    mark: "star",
    title: "Lactulose Volume II",
    prompt:
      "A nurse is preparing to administer Lactulose 20 g and the available Lactulose is 10 g/15 mL. How many mL should the nurse administer?",
    answer: 30,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "No" },
    steps: [
      {
        label: "Volume",
        chain: [v("20 g"), f("15 mL", "10 g")],
        result: "30 mL",
        tips: whyOrderVolume("20 g", "10 g per 15 mL", "g"),
      },
    ],
  },
  {
    id: 126,
    mark: "star",
    title: "Teaspoons to Milliliters II",
    prompt:
      "A child is prescribed 1.5 teaspoons of acetaminophen elixir. How many milliliters (mL) should the nurse administer?",
    answer: 7.5,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "Yes → tsp to mL" },
    steps: [
      {
        label: "Volume",
        chain: [v("1.5 tsp"), f("5 mL", "1 tsp")],
        result: "7.5 mL",
        tips: [
          "Start with what's ordered → 1.5 tsp. That's your quantity.",
          "1 tsp = 5 mL is the equality doing the converting.",
          FLIP("1 tsp per 5 mL"),
          "You want mL, so use the side with mL on top. The tsp cancels and mL is what's left.",
        ],
      },
    ],
  },
  {
    id: 127,
    mark: "star",
    title: "Cephalexin Capsules Per Day",
    prompt:
      "The provider orders 750 mg of cephalexin TID (three times a day). The available capsules are 250 mg. How many capsules should the nurse administer for a day?",
    answer: 9,
    unit: "capsules",
    tolerance: 0.1,
    setup: { unit: "capsules", convert: "No" },
    steps: [
      {
        label: "Capsules per dose",
        chain: [v("750 mg"), f("1 capsule", "250 mg")],
        result: "3 capsules",
        tips: whyTablets("750 mg", "250 mg per capsule"),
      },
      {
        label: "Capsules for the day",
        chain: [v("3 doses"), f("3 capsules", "1 dose")],
        result: "9 capsules",
        tips: [
          "TID means three times a day, so the day holds 3 doses. That count is your quantity now.",
          "3 capsules per 1 dose is the relationship. The doses cancel and capsules are what is left.",
        ],
      },
    ],
  },
  {
    id: 128,
    mark: "star",
    title: "Metronidazole Total Over A Course",
    prompt:
      "A patient takes metronidazole 500 mg PO TID (three times a day) for 10 days. How many mg of metronidazole does the patient take over the whole course?",
    answer: 15000,
    unit: "mg",
    tolerance: 1,
    setup: { unit: "mg", convert: "No" },
    steps: [
      {
        label: "Daily dose",
        chain: [v("500 mg/dose"), f("3 doses", "1 day")],
        result: "1,500 mg/day",
        tips: [
          "Start with one dose → 500 mg. That's your quantity.",
          "Three doses per day turns a single dose into a daily total.",
        ],
      },
      {
        label: "Whole course",
        chain: [v("1,500 mg/day"), f("10 days", "1 course")],
        result: "15,000 mg",
        tips: [
          "Stretch the daily total across the 10 days ordered.",
          "The per day cancels and the milligrams for the full course are left.",
        ],
      },
    ],
  },
  {
    id: 129,
    mark: "star",
    title: "Levofloxacin Tablets Per Dose",
    prompt:
      "A patient is prescribed levofloxacin 750 mg daily for 7 days. The available tablet is 250 mg. How many tablets should the nurse administer for this morning?",
    answer: 3,
    unit: "tablets",
    tolerance: 0.05,
    setup: { unit: "tablets", convert: "No" },
    steps: [
      {
        label: "Tablets",
        chain: [v("750 mg"), f("1 tablet", "250 mg")],
        result: "3 tablets",
        tips: whyTablets("750 mg", "250 mg per tablet"),
      },
    ],
    note: "The 7 days sets the course. This morning is still one dose.",
  },
  {
    id: 130,
    mark: "star",
    title: "Normal Saline Drip Rate",
    prompt:
      "You need to infuse 1,000 mL of NS over 8 hours. The drop factor of the tubing is 15 gtt/mL. Calculate the flow rate in gtt/min. (Round to the nearest whole number.)",
    answer: 31.25,
    unit: "gtt/min",
    formula: {
      top: "volume (mL) × drop factor (gtt/mL)",
      bottom: "time (min)",
    },
    rounding: {
      exact: "31.25 gtt/min",
      place: "whole number",
      rounded: "31 gtt/min",
    },
    tolerance: 0.5,
    setup: { unit: "gtt/min", convert: "Yes → hr to min" },
    steps: [
      {
        label: "Drip rate",
        chain: [
          f("1,000 mL", "8 hr"),
          f("15 gtt", "1 mL"),
          f("1 hr", "60 min"),
        ],
        result: "31.25 gtt/min",
        tips: [
          "The bag and its time make the rate → 1,000 mL over 8 hr.",
          "The drop factor goes in with gtt on top so the mL cancels.",
          "1 hr over 60 min turns the hours into minutes so the answer comes out per minute.",
        ],
      },
    ],
  },
  {
    id: 131,
    mark: "star",
    title: "Ceftriaxone Drip Rate",
    prompt:
      "An order reads ceftriaxone 2 g in 100 mL of NS to infuse over 30 minutes. The drop factor of the tubing is 20 gtt/mL. What is the drip rate? (Round to the nearest whole number.)",
    answer: 66.67,
    unit: "gtt/min",
    formula: {
      top: "volume (mL) × drop factor (gtt/mL)",
      bottom: "time (min)",
    },
    rounding: {
      exact: "66.67 gtt/min",
      place: "whole number",
      rounded: "67 gtt/min",
    },
    tolerance: 0.5,
    setup: { unit: "gtt/min", convert: "No" },
    steps: [
      {
        label: "Drip rate",
        chain: [f("100 mL", "30 min"), f("20 gtt", "1 mL")],
        result: "66.67 gtt/min",
        tips: [
          "The bag and its time make the rate → 100 mL over 30 min.",
          "The drop factor goes in with gtt on top so the mL cancels.",
          "The time is already in minutes, so there is no hour conversion here.",
        ],
      },
    ],
    note: "The 2 g of ceftriaxone never enters the arithmetic. You are timing the bag.",
  },
  {
    id: 132,
    mark: "star",
    title: "IVIG Starting Rate II",
    prompt:
      "A child weighs 44 lbs and the pharmacy recommends starting IVIG at 0.5 mL/kg/hr. What rate should the nurse start at?",
    answer: 10,
    unit: "mL/hr",
    tolerance: 0.2,
    setup: { unit: "mL/hr", convert: "Yes → lbs to kg" },
    steps: [
      {
        label: "Weight",
        chain: [v("44 lbs"), f("1 kg", "2.2 lbs")],
        result: "20 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Rate",
        chain: [v("20 kg"), f("0.5 mL/hr", "1 kg")],
        result: "10 mL/hr",
        tips: whyWeightHourly("20 kg", "0.5 mL/kg/hr"),
      },
    ],
  },
  {
    id: 133,
    mark: "star",
    title: "Hydromorphone Prepared Volume",
    prompt:
      "A nurse needs to administer 2 mg of hydromorphone intravenously. It is available in a 2 mg/1 mL vial and the dose is diluted with 9 mL of Normal Saline. How many mL should the nurse prepare?",
    answer: 10,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "No" },
    steps: [
      {
        label: "Drug volume",
        chain: [v("2 mg"), f("1 mL", "2 mg")],
        result: "1 mL",
        tips: whyOrderVolume("2 mg", "2 mg per 1 mL", "mg"),
      },
      {
        label: "Prepared volume",
        chain: [v("1 mL + 9 mL")],
        result: "10 mL",
        tips: [
          "The question asks what is in the syringe, so the diluent counts.",
          "Nothing cancels here. It is plain addition.",
        ],
      },
    ],
  },
  {
    id: 134,
    mark: "star",
    title: "Night Shift Fluid Intake",
    prompt:
      "During the night shift a patient consumed 2 cups of ice, 1 cup of apple juice, 6 oz of broth, 1/2 cup of gelatin, 8 oz of milk and two slices of toast. What is the night shift fluid intake total in mL?",
    answer: 1020,
    unit: "mL",
    tolerance: 1,
    setup: { unit: "mL", convert: "Yes → cups and oz to mL" },
    steps: [
      {
        label: "Ice",
        chain: [v("2 c"), f("120 mL", "1 c")],
        result: "240 mL",
        tips: [
          "Ice melts to about half its volume, so a cup of ice counts as 120 mL.",
        ],
      },
      {
        label: "Apple juice",
        chain: [v("1 c"), f("240 mL", "1 c")],
        result: "240 mL",
        tips: ["A cup of liquid is the full 240 mL."],
      },
      {
        label: "Broth",
        chain: [v("6 oz"), f("30 mL", "1 oz")],
        result: "180 mL",
        tips: ["1 fl oz = 30 mL, written with mL on top so the oz cancels."],
      },
      {
        label: "Gelatin",
        chain: [v("0.5 c"), f("240 mL", "1 c")],
        result: "120 mL",
        tips: ["Gelatin is liquid at room temperature, so it counts."],
      },
      {
        label: "Milk",
        chain: [v("8 oz"), f("30 mL", "1 oz")],
        result: "240 mL",
        tips: ["Same 30 mL per ounce again."],
      },
      {
        label: "Night shift total",
        chain: [v("240 mL + 240 mL + 180 mL + 120 mL + 240 mL")],
        result: "1,020 mL",
        tips: [
          "Nothing cancels here. It is plain addition.",
          "Only the toast stays out. Solid food is not counted as fluid intake.",
        ],
      },
    ],
    note: "NOTE: we do not count pudding or solid food in fluid intake. Jello and honey do count, because they are liquid at room temperature.",
  },
  {
    id: 135,
    mark: "star2",
    title: "Potassium Chloride Volume",
    prompt:
      "A nurse is preparing potassium chloride 20 mEq. The available vial is 40 mEq/20 mL. How many mL should the nurse draw up?",
    answer: 10,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "No" },
    steps: [
      {
        label: "Volume",
        chain: [v("20 mEq"), f("20 mL", "40 mEq")],
        result: "10 mL",
        tips: whyOrderVolume("20 mEq", "40 mEq per 20 mL", "mEq"),
      },
    ],
  },
  {
    id: 136,
    mark: "star2",
    title: "Tablespoons to Milliliters",
    prompt:
      "A patient is prescribed 3 tablespoons of magnesium hydroxide. How many milliliters (mL) should the nurse administer?",
    answer: 45,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "Yes → Tbsp to mL" },
    steps: [
      {
        label: "Volume",
        chain: [v("3 Tbsp"), f("15 mL", "1 Tbsp")],
        result: "45 mL",
        tips: [
          "Start with what's ordered → 3 Tbsp. That's your quantity.",
          "1 Tbsp = 15 mL is the household to metric equality, so that's the factor.",
          FLIP("1 Tbsp per 15 mL"),
          "You want mL, so use the side with mL on top. The Tbsp cancels and mL is what's left.",
        ],
      },
    ],
  },
  {
    id: 137,
    mark: "star2",
    title: "Furosemide Tablets",
    prompt:
      "The provider orders furosemide 80 mg PO. The available tablets are 40 mg. How many tablets should the nurse administer?",
    answer: 2,
    unit: "tablets",
    tolerance: 0.05,
    setup: { unit: "tablets", convert: "No" },
    steps: [
      {
        label: "Tablets",
        chain: [v("80 mg"), f("1 tablet", "40 mg")],
        result: "2 tablets",
        tips: whyTablets("80 mg", "40 mg per tablet"),
      },
    ],
  },
  {
    id: 138,
    mark: "star2",
    title: "Prednisone Total Over A Course",
    prompt:
      "A patient takes prednisone 10 mg PO once daily for 5 days. How many mg of prednisone does the patient take over the whole course?",
    answer: 50,
    unit: "mg",
    tolerance: 0.5,
    setup: { unit: "mg", convert: "No" },
    steps: [
      {
        label: "Whole course",
        chain: [v("10 mg/day"), f("5 days", "1 course")],
        result: "50 mg",
        tips: [
          "Start with the daily dose → 10 mg per day. That's your quantity.",
          "Once daily means one dose a day, so the days are the only thing multiplying it.",
          "The per day cancels and the milligrams for the course are left.",
        ],
      },
    ],
  },
  {
    id: 139,
    mark: "star2",
    title: "Digoxin Tablets",
    prompt:
      "The provider orders digoxin 0.25 mg PO daily. The available tablets are 0.125 mg. How many tablets should the nurse administer?",
    answer: 2,
    unit: "tablets",
    tolerance: 0.05,
    setup: { unit: "tablets", convert: "No" },
    steps: [
      {
        label: "Tablets",
        chain: [v("0.25 mg"), f("1 tablet", "0.125 mg")],
        result: "2 tablets",
        tips: whyTablets("0.25 mg", "0.125 mg per tablet"),
      },
    ],
    note: "Decimals do not change the method. 0.25 divided by 0.125 is still just a division.",
  },
  {
    id: 140,
    mark: "star2",
    title: "One Hour Drip Rate",
    prompt:
      "You need to infuse 250 mL of NS over 1 hour. The drop factor of the tubing is 20 gtt/mL. Calculate the flow rate in gtt/min. (Round to the nearest whole number.)",
    answer: 83.33,
    unit: "gtt/min",
    formula: {
      top: "volume (mL) × drop factor (gtt/mL)",
      bottom: "time (min)",
    },
    rounding: {
      exact: "83.33 gtt/min",
      place: "whole number",
      rounded: "83 gtt/min",
    },
    tolerance: 0.5,
    setup: { unit: "gtt/min", convert: "Yes → hr to min" },
    steps: [
      {
        label: "Drip rate",
        chain: [f("250 mL", "1 hr"), f("20 gtt", "1 mL"), f("1 hr", "60 min")],
        result: "83.33 gtt/min",
        tips: [
          "The bag and its time make the rate → 250 mL over 1 hr.",
          "The drop factor goes in with gtt on top so the mL cancels.",
          "1 hr over 60 min turns the hours into minutes.",
        ],
      },
    ],
  },
  {
    id: 141,
    mark: "star2",
    title: "Ten Hour Drip Rate",
    prompt:
      "You need to infuse 1,000 mL of NS over 10 hours. The drop factor of the tubing is 15 gtt/mL. Calculate the flow rate in gtt/min.",
    answer: 25,
    unit: "gtt/min",
    formula: {
      top: "volume (mL) × drop factor (gtt/mL)",
      bottom: "time (min)",
    },
    tolerance: 0.5,
    setup: { unit: "gtt/min", convert: "Yes → hr to min" },
    steps: [
      {
        label: "Drip rate",
        chain: [
          f("1,000 mL", "10 hr"),
          f("15 gtt", "1 mL"),
          f("1 hr", "60 min"),
        ],
        result: "25 gtt/min",
        tips: [
          "The bag and its time make the rate → 1,000 mL over 10 hr.",
          "The drop factor goes in with gtt on top so the mL cancels.",
          "1 hr over 60 min turns the hours into minutes.",
        ],
      },
    ],
  },
  {
    id: 142,
    mark: "star2",
    title: "Heparin Bolus By Weight",
    prompt:
      "A patient weighing 132 lbs is ordered a heparin bolus of 80 units/kg. How many units should the nurse administer?",
    answer: 4800,
    unit: "units",
    tolerance: 1,
    setup: { unit: "units", convert: "Yes → lbs to kg" },
    steps: [
      {
        label: "Weight",
        chain: [v("132 lbs"), f("1 kg", "2.2 lbs")],
        result: "60 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Bolus",
        chain: [v("60 kg"), f("80 units", "1 kg")],
        result: "4,800 units",
        tips: whyWeight("60 kg", "80 units/kg", "4,800 units"),
      },
    ],
  },
  {
    id: 143,
    mark: "star2",
    title: "Morphine Volume",
    prompt:
      "A nurse needs to administer morphine 6 mg intravenously. The vial is labelled 10 mg/mL. How many mL should the nurse draw up?",
    answer: 0.6,
    unit: "mL",
    tolerance: 0.02,
    setup: { unit: "mL", convert: "No" },
    steps: [
      {
        label: "Volume",
        chain: [v("6 mg"), f("1 mL", "10 mg")],
        result: "0.6 mL",
        tips: whyOrderVolume("6 mg", "10 mg per 1 mL", "mg"),
      },
    ],
    note: "An answer under 1 mL is normal for a concentrated vial. Always lead the decimal with a zero.",
  },
  {
    id: 144,
    mark: "star2",
    title: "Evening Fluid Intake",
    prompt:
      "During the evening a patient consumed 1 cup of ice, 180 mL of cranberry juice, 3 oz of jello and 1 cup of coffee. What is the evening fluid intake total in mL?",
    answer: 630,
    unit: "mL",
    tolerance: 1,
    setup: { unit: "mL", convert: "Yes → cups and oz to mL" },
    steps: [
      {
        label: "Ice",
        chain: [v("1 c"), f("120 mL", "1 c")],
        result: "120 mL",
        tips: [
          "Ice melts to about half its volume, so a cup of ice counts as 120 mL.",
        ],
      },
      {
        label: "Juice",
        chain: [v("180 mL")],
        result: "180 mL",
        tips: ["Already in mL, so it goes straight into the total."],
      },
      {
        label: "Jello",
        chain: [v("3 oz"), f("30 mL", "1 oz")],
        result: "90 mL",
        tips: [
          "Jello is liquid at room temperature, so it counts as intake.",
          "1 fl oz = 30 mL, written with mL on top so the oz cancels.",
        ],
      },
      {
        label: "Coffee",
        chain: [v("1 c"), f("240 mL", "1 c")],
        result: "240 mL",
        tips: ["A cup of liquid is the full 240 mL, unlike the cup of ice."],
      },
      {
        label: "Evening total",
        chain: [v("120 mL + 180 mL + 90 mL + 240 mL")],
        result: "630 mL",
        tips: [
          "Nothing cancels here. It is plain addition.",
          "Everything on this list counts. Two cups, worth two different amounts, is the only trap.",
        ],
      },
    ],
    note: "NOTE: we do not count pudding or solid food in fluid intake. Jello and honey do count, because they are liquid at room temperature.",
  },
  {
    id: 145,
    mark: "skull",
    title: "Weight-Based Lactulose",
    prompt:
      "A provider orders Lactulose 0.05 g/kg for a patient weighing 176 lbs. The available Lactulose is 20 g/30 mL. How many mL should the nurse administer?",
    answer: 6,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "Yes → lbs to kg" },
    steps: [
      {
        label: "Weight",
        chain: [v("176 lbs"), f("1 kg", "2.2 lbs")],
        result: "80 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Dose",
        chain: [v("80 kg"), f("0.05 g", "1 kg")],
        result: "4 g",
        tips: whyWeight("80 kg", "0.05 g/kg", "4 g"),
      },
      {
        label: "Volume",
        chain: [v("4 g"), f("30 mL", "20 g")],
        result: "6 mL",
        tips: whyOrderVolume("4 g", "20 g per 30 mL", "g"),
      },
    ],
    note: "Three steps stacked. Convert the weight, find the dose, then turn the dose into a volume.",
  },
  {
    id: 146,
    mark: "skull",
    title: "Delsym Total Course Volume",
    prompt:
      "A patient is prescribed 1.5 teaspoons of Delsym q12h for 5 days. How many total milliliters (mL) will the patient take over the whole course?",
    answer: 75,
    unit: "mL",
    tolerance: 0.5,
    setup: { unit: "mL", convert: "Yes → tsp to mL" },
    steps: [
      {
        label: "Volume per dose",
        chain: [v("1.5 tsp"), f("5 mL", "1 tsp")],
        result: "7.5 mL",
        tips: [
          "Start with what's ordered → 1.5 tsp. That's your quantity.",
          "1 tsp = 5 mL is the equality doing the converting.",
          FLIP("1 tsp per 5 mL"),
        ],
      },
      {
        label: "Doses",
        chain: [
          f("24 hr", "1 day"),
          f("1 dose", "12 hr"),
          f("5 days", "1 course"),
        ],
        result: "10 doses",
        tips: [
          "q12h means one dose every 12 hours, so build the number of doses from the clock.",
          "24 hr per day over 12 hr per dose gives 2 doses a day, and 5 days makes 10 doses.",
        ],
      },
      {
        label: "Course volume",
        chain: [v("7.5 mL/dose"), f("10 doses", "1 course")],
        result: "75 mL",
        tips: [
          "Now multiply the volume of one dose by the number of doses.",
          "The doses cancel and mL for the whole course is what's left.",
        ],
      },
    ],
    note: "q12h is where this one catches people. It is 2 doses a day, not 12.",
  },
  {
    id: 147,
    mark: "skull",
    title: "Pediatric Amoxicillin Volume",
    prompt:
      "A child weighing 33 lbs is prescribed amoxicillin 45 mg/kg/day divided BID. The available suspension is 250 mg/5 mL. How many mL should the nurse administer per dose?",
    answer: 6.75,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "Yes → lbs to kg" },
    steps: [
      {
        label: "Weight",
        chain: [v("33 lbs"), f("1 kg", "2.2 lbs")],
        result: "15 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Daily dose",
        chain: [v("15 kg"), f("45 mg/day", "1 kg")],
        result: "675 mg/day",
        tips: whyWeight("15 kg", "45 mg/kg/day", "675 mg/day"),
      },
      {
        label: "Per dose",
        chain: [v("675 mg/day"), f("1 day", "2 doses")],
        result: "337.5 mg",
        tips: whyDivide("2 doses"),
      },
      {
        label: "Volume",
        chain: [v("337.5 mg"), f("5 mL", "250 mg")],
        result: "6.75 mL",
        tips: whyOrderVolume("337.5 mg", "250 mg per 5 mL", "mg"),
      },
    ],
    note: "Divided BID means the 45 mg/kg is the daily total, not the dose.",
  },
  {
    id: 148,
    mark: "skull",
    title: "Vancomycin Grams Over Three Days",
    prompt:
      "A patient weighing 198 lbs is prescribed vancomycin 15 mg/kg IV q12h. How many grams of vancomycin will the patient receive over 3 days?",
    answer: 8.1,
    unit: "g",
    tolerance: 0.05,
    setup: { unit: "g", convert: "Yes → lbs to kg and mg to g" },
    steps: [
      {
        label: "Weight",
        chain: [v("198 lbs"), f("1 kg", "2.2 lbs")],
        result: "90 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Dose",
        chain: [v("90 kg"), f("15 mg", "1 kg")],
        result: "1,350 mg",
        tips: whyWeight("90 kg", "15 mg/kg", "1,350 mg"),
      },
      {
        label: "Three days",
        chain: [
          v("1,350 mg/dose"),
          f("2 doses", "1 day"),
          f("3 days", "1 course"),
        ],
        result: "8,100 mg",
        tips: [
          "q12h is 2 doses a day, so the clock gives you the doses.",
          "Two doses a day across 3 days is 6 doses in total.",
        ],
      },
      {
        label: "Convert",
        chain: [v("8,100 mg"), f("1 g", "1,000 mg")],
        result: "8.1 g",
        tips: [
          "The question asks for grams but everything so far has been in mg.",
          "1 g = 1,000 mg, written with g on top so the mg cancels.",
        ],
      },
    ],
    note: "Four steps and the answer unit is not the unit you were working in. Check the last line.",
  },
  {
    id: 149,
    mark: "skull",
    title: "Ciprofloxacin Premix Drip Rate",
    prompt:
      "An order reads ciprofloxacin 400 mg IV q8h. It arrives as 400 mg in a 200 mL premix bag to infuse over 60 minutes. The drop factor is 15 gtt/mL. What is the drip rate? (Round to the nearest whole number.)",
    answer: 50,
    unit: "gtt/min",
    formula: {
      top: "volume (mL) × drop factor (gtt/mL)",
      bottom: "time (min)",
    },
    tolerance: 0.5,
    setup: { unit: "gtt/min", convert: "No" },
    steps: [
      {
        label: "Drip rate",
        chain: [f("200 mL", "60 min"), f("15 gtt", "1 mL")],
        result: "50 gtt/min",
        tips: [
          "The bag and its time make the rate → 200 mL over 60 min.",
          "The drop factor goes in with gtt on top so the mL cancels.",
          "The 400 mg and the q8h are there to distract you. Neither one changes the drip rate.",
        ],
      },
    ],
  },
  {
    id: 150,
    mark: "skull",
    title: "Split Infusion Drip Rate",
    prompt:
      "An order reads 1,500 mL of Lactated Ringer's. The first 500 mL runs over 30 minutes and the remainder runs over 4 hours. The drop factor is 10 gtt/mL. What is the drip rate for the remainder? (Round to the nearest whole number.)",
    answer: 41.67,
    unit: "gtt/min",
    formula: {
      top: "volume (mL) × drop factor (gtt/mL)",
      bottom: "time (min)",
    },
    rounding: {
      exact: "41.67 gtt/min",
      place: "whole number",
      rounded: "42 gtt/min",
    },
    tolerance: 0.5,
    setup: { unit: "gtt/min", convert: "Yes → hr to min" },
    steps: [
      {
        label: "Remainder",
        chain: [v("1,500 mL - 500 mL")],
        result: "1,000 mL",
        tips: [
          "The question asks about the remainder, so take the bolus off the total first.",
          "Nothing cancels here. It is plain subtraction.",
        ],
      },
      {
        label: "Drip rate",
        chain: [
          f("1,000 mL", "4 hr"),
          f("10 gtt", "1 mL"),
          f("1 hr", "60 min"),
        ],
        result: "41.67 gtt/min",
        tips: [
          "Now the remainder and its own time make the rate → 1,000 mL over 4 hr.",
          "The drop factor goes in with gtt on top so the mL cancels.",
          "1 hr over 60 min turns the hours into minutes.",
        ],
      },
    ],
    note: "The 30 minute bolus has its own rate. It is not part of this calculation.",
  },
  {
    id: 151,
    mark: "skull",
    title: "Weight-Based Heparin Rate",
    prompt:
      "A patient weighing 165 lbs is on a heparin drip at 12 units/kg/hr. The bag is 25,000 units in 250 mL of D5W. What rate should the pump be set to in mL/hr?",
    answer: 9,
    unit: "mL/hr",
    tolerance: 0.1,
    setup: { unit: "mL/hr", convert: "Yes → lbs to kg" },
    steps: [
      {
        label: "Weight",
        chain: [v("165 lbs"), f("1 kg", "2.2 lbs")],
        result: "75 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Units per hour",
        chain: [v("75 kg"), f("12 units/hr", "1 kg")],
        result: "900 units/hr",
        tips: whyWeightHourly("75 kg", "12 units/kg/hr"),
      },
      {
        label: "Pump rate",
        chain: [v("900 units/hr"), f("250 mL", "25,000 units")],
        result: "9 mL/hr",
        tips: whyUnitsBag("25,000 units per 250 mL"),
      },
    ],
    note: "Three units in play at once. Pounds become kilograms, kilograms become units, units become millilitres.",
  },
  {
    id: 152,
    mark: "skull",
    title: "IVIG Titration Rate",
    prompt:
      "A child weighing 66 lbs starts IVIG at 0.5 mL/kg/hr. The rate increases by 0.5 mL/kg/hr every 30 minutes as tolerated. What rate in mL/hr should the pump be set to during the fourth 30 minute interval?",
    answer: 60,
    unit: "mL/hr",
    tolerance: 0.5,
    setup: { unit: "mL/hr", convert: "Yes → lbs to kg" },
    steps: [
      {
        label: "Weight",
        chain: [v("66 lbs"), f("1 kg", "2.2 lbs")],
        result: "30 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Fourth interval",
        chain: [v("0.5 mL/kg/hr + 0.5 mL/kg/hr + 0.5 mL/kg/hr + 0.5 mL/kg/hr")],
        result: "2 mL/kg/hr",
        tips: [
          "The first interval runs at 0.5, and each later interval adds another 0.5.",
          "The fourth interval is the third increase, so it runs at 2 mL/kg/hr.",
        ],
      },
      {
        label: "Pump rate",
        chain: [v("30 kg"), f("2 mL/hr", "1 kg")],
        result: "60 mL/hr",
        tips: whyWeightHourly("30 kg", "2 mL/kg/hr"),
      },
    ],
    note: "Count the intervals carefully. The first one is the starting rate, not the first increase.",
  },
  {
    id: 153,
    mark: "skull",
    title: "Weight-Based Ativan Prepared Volume",
    prompt:
      "A provider orders Ativan 0.05 mg/kg IV for a patient weighing 154 lbs. The vial is 2 mg/mL and the dose is diluted with an equal volume of Normal Saline. How many mL should the nurse prepare?",
    answer: 3.5,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "Yes → lbs to kg" },
    steps: [
      {
        label: "Weight",
        chain: [v("154 lbs"), f("1 kg", "2.2 lbs")],
        result: "70 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Dose",
        chain: [v("70 kg"), f("0.05 mg", "1 kg")],
        result: "3.5 mg",
        tips: whyWeight("70 kg", "0.05 mg/kg", "3.5 mg"),
      },
      {
        label: "Drug volume",
        chain: [v("3.5 mg"), f("1 mL", "2 mg")],
        result: "1.75 mL",
        tips: whyOrderVolume("3.5 mg", "2 mg per 1 mL", "mg"),
      },
      {
        label: "Prepared volume",
        chain: [v("1.75 mL + 1.75 mL")],
        result: "3.5 mL",
        tips: [
          "An equal volume of Normal Saline means the diluent matches the drug volume.",
          "Nothing cancels here. It is plain addition.",
        ],
      },
    ],
    note: "The dose in mg and the prepared volume in mL happen to be the same number here. That is a coincidence, not a rule.",
  },
  {
    id: 154,
    mark: "skull",
    title: "Twenty Four Hour Fluid Intake",
    prompt:
      "Over 24 hours a patient consumed 4 cups of ice, two 240 mL cartons of Ensure, 8 oz of jello, 1 1/2 cups of broth, 6 oz of tea, 3 tablespoons of honey, two slices of toast and a chicken breast. What is the 24 hour fluid intake total in mL?",
    answer: 1785,
    unit: "mL",
    tolerance: 1,
    setup: { unit: "mL", convert: "Yes → cups, tablespoons and oz to mL" },
    steps: [
      {
        label: "Ice",
        chain: [v("4 c"), f("120 mL", "1 c")],
        result: "480 mL",
        tips: [
          "Ice melts to about half its volume, so a cup of ice counts as 120 mL.",
        ],
      },
      {
        label: "Ensure",
        chain: [v("2 cartons"), f("240 mL", "1 carton")],
        result: "480 mL",
        tips: ["Already in mL, so the only work is doubling it."],
      },
      {
        label: "Jello",
        chain: [v("8 oz"), f("30 mL", "1 oz")],
        result: "240 mL",
        tips: [
          "Jello is liquid at room temperature, so it counts as intake.",
          "1 fl oz = 30 mL, written with mL on top so the oz cancels.",
        ],
      },
      {
        label: "Broth",
        chain: [v("1.5 c"), f("240 mL", "1 c")],
        result: "360 mL",
        tips: ["Broth is a liquid, so a cup counts as the full 240 mL."],
      },
      {
        label: "Tea",
        chain: [v("6 oz"), f("30 mL", "1 oz")],
        result: "180 mL",
        tips: ["Same 30 mL per ounce again."],
      },
      {
        label: "Honey",
        chain: [v("3 Tbsp"), f("15 mL", "1 Tbsp")],
        result: "45 mL",
        tips: [
          "Honey pours, so it counts as intake.",
          "1 Tbsp = 15 mL, written with mL on top so the Tbsp cancels.",
        ],
      },
      {
        label: "Total intake",
        chain: [v("480 mL + 480 mL + 240 mL + 360 mL + 180 mL + 45 mL")],
        result: "1,785 mL",
        tips: [
          "Nothing cancels here. It is plain addition.",
          "Only the toast and the chicken breast stay out. Solid food is not counted as fluid intake.",
        ],
      },
    ],
    note: "NOTE: we do not count pudding or solid food in fluid intake. Jello and honey do count, because they are liquid at room temperature.",
  },
  {
    id: 155,
    mark: "skull",
    title: "Dopamine Drip By Weight",
    prompt:
      "A patient weighing 176 lbs is on dopamine 400 mg in 250 mL of D5W ordered at 5 mcg/kg/min. What rate in mL/hr should the pump be set to?",
    answer: 15,
    unit: "mL/hr",
    tolerance: 0.2,
    setup: { unit: "mL/hr", convert: "Yes → lbs to kg, mcg to mg, min to hr" },
    steps: [
      {
        label: "Weight",
        chain: [v("176 lbs"), f("1 kg", "2.2 lbs")],
        result: "80 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Dose per minute",
        chain: [v("80 kg"), f("5 mcg/min", "1 kg")],
        result: "400 mcg/min",
        tips: whyWeightHourly("80 kg", "5 mcg/kg/min"),
      },
      {
        label: "Dose per hour",
        chain: [v("400 mcg/min"), f("60 min", "1 hr"), f("1 mg", "1,000 mcg")],
        result: "24 mg/hr",
        tips: [
          "The pump runs per hour, so 60 min per 1 hr turns the minutes into hours.",
          "The bag is labelled in mg, so 1 mg per 1,000 mcg gets you into the bag's own unit.",
        ],
      },
      {
        label: "Pump rate",
        chain: [v("24 mg/hr"), f("250 mL", "400 mg")],
        result: "15 mL/hr",
        tips: whyUnitsBag("400 mg per 250 mL"),
      },
    ],
    note: "Four conversions stacked in one problem. Pounds, micrograms, minutes, then the bag.",
  },
  {
    id: 156,
    mark: "skull",
    title: "Pediatric Ampicillin Volume",
    prompt:
      "A child weighing 27.5 lbs is prescribed ampicillin 200 mg/kg/day divided q6h. The vial is reconstituted to 250 mg/mL. How many mL should the nurse administer per dose?",
    answer: 2.5,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "Yes → lbs to kg" },
    steps: [
      {
        label: "Weight",
        chain: [v("27.5 lbs"), f("1 kg", "2.2 lbs")],
        result: "12.5 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Daily dose",
        chain: [v("12.5 kg"), f("200 mg/day", "1 kg")],
        result: "2,500 mg/day",
        tips: whyWeight("12.5 kg", "200 mg/kg/day", "2,500 mg/day"),
      },
      {
        label: "Doses per day",
        chain: [f("24 hr", "1 day"), f("1 dose", "6 hr")],
        result: "4 doses/day",
        tips: [
          "q6h means one dose every 6 hours, so let the clock give you the count.",
          "24 hr in a day over 6 hr per dose leaves 4 doses a day.",
        ],
      },
      {
        label: "Per dose",
        chain: [v("2,500 mg/day"), f("1 day", "4 doses")],
        result: "625 mg",
        tips: whyDivide("4 doses"),
      },
      {
        label: "Volume",
        chain: [v("625 mg"), f("1 mL", "250 mg")],
        result: "2.5 mL",
        tips: whyOrderVolume("625 mg", "250 mg per 1 mL", "mg"),
      },
    ],
    note: "Five steps. The q6h has to become a number of doses before the daily total can be split.",
  },
  {
    id: 157,
    mark: "skull",
    title: "Heparin Rate By Weight",
    prompt:
      "A patient weighing 209 lbs is on a heparin drip at 18 units/kg/hr. The bag is 25,000 units in 500 mL of D5W. What rate in mL/hr should the pump be set to? (Round to the nearest tenth.)",
    answer: 34.2,
    unit: "mL/hr",
    rounding: {
      exact: "34.2 mL/hr",
      place: "tenth",
      rounded: "34.2 mL/hr",
    },
    tolerance: 0.1,
    setup: { unit: "mL/hr", convert: "Yes → lbs to kg" },
    steps: [
      {
        label: "Weight",
        chain: [v("209 lbs"), f("1 kg", "2.2 lbs")],
        result: "95 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Units per hour",
        chain: [v("95 kg"), f("18 units/hr", "1 kg")],
        result: "1,710 units/hr",
        tips: whyWeightHourly("95 kg", "18 units/kg/hr"),
      },
      {
        label: "Pump rate",
        chain: [v("1,710 units/hr"), f("500 mL", "25,000 units")],
        result: "34.2 mL/hr",
        tips: whyUnitsBag("25,000 units per 500 mL"),
      },
    ],
    note: "The 209 lbs is deliberately awkward. It still divides cleanly by 2.2.",
  },
  {
    id: 158,
    mark: "skull",
    title: "Nitroglycerin Drip Rate",
    prompt:
      "Nitroglycerin 50 mg is mixed in 250 mL of D5W and ordered at 20 mcg/min. What rate in mL/hr should the pump be set to?",
    answer: 6,
    unit: "mL/hr",
    tolerance: 0.1,
    setup: { unit: "mL/hr", convert: "Yes → mcg to mg and min to hr" },
    steps: [
      {
        label: "Dose per hour",
        chain: [v("20 mcg/min"), f("60 min", "1 hr"), f("1 mg", "1,000 mcg")],
        result: "1.2 mg/hr",
        tips: [
          "Start with what's ordered → 20 mcg/min. It's a rate and it still leads, because it is the quantity being converted.",
          "60 min per 1 hr turns the minutes into hours, because the pump runs per hour.",
          "The bag is labelled in mg, so 1 mg per 1,000 mcg gets you into the bag's own unit.",
        ],
      },
      {
        label: "Pump rate",
        chain: [v("1.2 mg/hr"), f("250 mL", "50 mg")],
        result: "6 mL/hr",
        tips: whyUnitsBag("50 mg per 250 mL"),
      },
    ],
    note: "No weight in this one. The trap is converting mcg to mg and minutes to hours in the same breath.",
  },
  {
    id: 159,
    mark: "skull",
    title: "Reconstituted Vial Withdrawal",
    prompt:
      "A vial contains 2 g of powder. The nurse reconstitutes it with 6.6 mL of sterile water, which yields a concentration of 250 mg/mL. The order is for 1.25 g IV, to be further diluted in 100 mL of NS. How many mL should the nurse withdraw from the vial?",
    answer: 5,
    unit: "mL",
    tolerance: 0.1,
    setup: { unit: "mL", convert: "Yes → g to mg" },
    steps: [
      {
        label: "Convert",
        chain: [v("1.25 g"), f("1,000 mg", "1 g")],
        result: "1,250 mg",
        tips: [
          "The order is in grams and the vial is labelled in mg, so the units have to match before anything can cancel.",
          "1 g = 1,000 mg, written with mg on top so the g cancels.",
        ],
      },
      {
        label: "Withdraw",
        chain: [v("1,250 mg"), f("1 mL", "250 mg")],
        result: "5 mL",
        tips: whyOrderVolume("1,250 mg", "250 mg per 1 mL", "mg"),
      },
    ],
    note: "Three numbers in this question do nothing. The 2 g on the label, the 6.6 mL of sterile water and the 100 mL of NS are all distractors. Only the concentration and the order matter.",
  },
  {
    id: 160,
    mark: "skull",
    title: "Vancomycin Pump Rate",
    prompt:
      "An order reads vancomycin 1.5 g in 250 mL of NS to infuse over 90 minutes on a pump. What rate in mL/hr should the pump be set to? (Round to the nearest whole number.)",
    answer: 166.67,
    unit: "mL/hr",
    rounding: {
      exact: "166.67 mL/hr",
      place: "whole number",
      rounded: "167 mL/hr",
    },
    tolerance: 0.5,
    setup: { unit: "mL/hr", convert: "Yes → min to hr" },
    steps: [
      {
        label: "Pump rate",
        chain: [f("250 mL", "90 min"), f("60 min", "1 hr")],
        result: "166.67 mL/hr",
        tips: [
          "The bag and its time make the rate → 250 mL over 90 min.",
          "A pump is set in mL/hr, so 60 min per 1 hr turns the minutes into hours.",
          "There is no drop factor here. A pump does not count drops.",
        ],
      },
    ],
    note: "The 1.5 g never enters the arithmetic, and neither does a drop factor. Read what the device needs.",
  },
  {
    id: 161,
    mark: "skull",
    title: "Twenty Four Hour IV Intake",
    prompt:
      "Over 24 hours a patient received 2 L of NS, TPN running at 100 mL/hr for 12 hours and three IV push medications of 10 mL each. What is the total intake in mL?",
    answer: 3230,
    unit: "mL",
    tolerance: 2,
    setup: { unit: "mL", convert: "Yes → L to mL" },
    steps: [
      {
        label: "Normal saline",
        chain: [v("2 L"), f("1,000 mL", "1 L")],
        result: "2,000 mL",
        tips: [
          "The answer has to be in mL but the bag is written in litres, so convert first.",
          "1 L = 1,000 mL, written with mL on top so the L cancels.",
        ],
      },
      {
        label: "TPN",
        chain: [v("100 mL/hr"), f("12 hr", "1 shift")],
        result: "1,200 mL",
        tips: [
          "A rate becomes a volume once you multiply it by how long it ran.",
          "The hours cancel and the millilitres are left.",
        ],
      },
      {
        label: "IV pushes",
        chain: [v("3 pushes"), f("10 mL", "1 push")],
        result: "30 mL",
        tips: [
          "Small volumes still count. Three pushes at 10 mL each is 30 mL.",
        ],
      },
      {
        label: "Total intake",
        chain: [v("2,000 mL + 1,200 mL + 30 mL")],
        result: "3,230 mL",
        tips: ["Nothing cancels here. It is plain addition."],
      },
    ],
    note: "The IV pushes are easy to forget, and they are exactly what this question is checking.",
  },
  {
    id: 162,
    mark: "skull",
    title: "Tablets Over A Whole Course",
    prompt:
      "The provider orders 1.5 g of an antibiotic PO q12h for 5 days. The available tablets are 750 mg. How many tablets will the patient take over the whole course?",
    answer: 20,
    unit: "tablets",
    tolerance: 0.1,
    setup: { unit: "tablets", convert: "Yes → g to mg" },
    steps: [
      {
        label: "Convert",
        chain: [v("1.5 g"), f("1,000 mg", "1 g")],
        result: "1,500 mg",
        tips: [
          "The order is in grams and the tablets are labelled in mg, so the units have to match before anything can cancel.",
          "1 g = 1,000 mg, written with mg on top so the g cancels.",
        ],
      },
      {
        label: "Tablets per dose",
        chain: [v("1,500 mg"), f("1 tablet", "750 mg")],
        result: "2 tablets",
        tips: whyTablets("1,500 mg", "750 mg per tablet"),
      },
      {
        label: "Doses in the course",
        chain: [
          f("24 hr", "1 day"),
          f("1 dose", "12 hr"),
          f("5 days", "1 course"),
        ],
        result: "10 doses",
        tips: [
          "q12h means one dose every 12 hours, so let the clock give you the count.",
          "24 hr in a day over 12 hr per dose is 2 doses a day, and 5 days makes 10 doses.",
        ],
      },
      {
        label: "Tablets for the course",
        chain: [v("10 doses"), f("2 tablets", "1 dose")],
        result: "20 tablets",
        tips: [
          "The course holds 10 doses, so that count is your quantity now.",
          "2 tablets per 1 dose is the relationship. The doses cancel and tablets are what is left.",
        ],
      },
    ],
    note: "Per dose is 2, per day is 4, for the course is 20. Read which one the question wants.",
  },
  {
    id: 163,
    mark: "skull",
    title: "Gentamicin Volume By Weight",
    prompt:
      "A patient weighing 143 lbs is ordered gentamicin 2.5 mg/kg IV q8h. The vial is labelled 40 mg/mL. How many mL should the nurse draw up per dose? (Round to the nearest tenth.)",
    answer: 4.0625,
    unit: "mL",
    rounding: {
      exact: "4.0625 mL",
      place: "tenth",
      rounded: "4.1 mL",
    },
    tolerance: 0.06,
    setup: { unit: "mL", convert: "Yes → lbs to kg" },
    steps: [
      {
        label: "Weight",
        chain: [v("143 lbs"), f("1 kg", "2.2 lbs")],
        result: "65 kg",
        tips: [
          "The order is per kilogram but the weight is in pounds, so convert first.",
          "1 kg = 2.2 lbs, written with kg on top so the lbs cancel.",
        ],
      },
      {
        label: "Dose",
        chain: [v("65 kg"), f("2.5 mg", "1 kg")],
        result: "162.5 mg",
        tips: whyWeight("65 kg", "2.5 mg/kg", "162.5 mg"),
      },
      {
        label: "Volume",
        chain: [v("162.5 mg"), f("1 mL", "40 mg")],
        result: "4.0625 mL",
        tips: whyOrderVolume("162.5 mg", "40 mg per 1 mL", "mg"),
      },
    ],
    note: "The q8h sets the schedule. This is one dose, not a daily total.",
  },
  {
    id: 164,
    mark: "skull",
    title: "IVIG Volume Over Two Hours",
    prompt:
      "A 30 kg child receives IVIG at 0.5 mL/kg/hr for the first 30 minutes, then 1 mL/kg/hr for the next 30 minutes, then 2 mL/kg/hr for the rest. How many mL will the child receive in the first 2 hours?",
    answer: 82.5,
    unit: "mL",
    tolerance: 0.5,
    setup: { unit: "mL", convert: "Yes → min to hr" },
    steps: [
      {
        label: "First half hour",
        chain: [v("30 kg"), f("0.5 mL/hr", "1 kg"), f("0.5 hr", "1 step")],
        result: "7.5 mL",
        tips: [
          "The rate is per kilogram per hour, so the weight turns it into a plain mL/hr first.",
          "30 kg at 0.5 mL/kg/hr is 15 mL/hr, and it only runs for half an hour.",
        ],
      },
      {
        label: "Second half hour",
        chain: [v("30 kg"), f("1 mL/hr", "1 kg"), f("0.5 hr", "1 step")],
        result: "15 mL",
        tips: [
          "The rate doubles to 1 mL/kg/hr, which is 30 mL/hr for this child.",
          "It also runs for only half an hour, so half of 30 mL is what goes in.",
        ],
      },
      {
        label: "Final hour",
        chain: [v("30 kg"), f("2 mL/hr", "1 kg"), f("1 hr", "1 step")],
        result: "60 mL",
        tips: [
          "The third rate is 2 mL/kg/hr, which is 60 mL/hr for this child.",
          "The first two steps used up one hour, so this rate covers the remaining full hour.",
        ],
      },
      {
        label: "Two hour total",
        chain: [v("7.5 mL + 15 mL + 60 mL")],
        result: "82.5 mL",
        tips: [
          "Nothing cancels here. It is plain addition.",
          "Each rate has to be multiplied by its own stretch of time before anything can be added.",
        ],
      },
    ],
    note: "Three different rates over three different lengths of time. Volume is rate multiplied by time, every single time.",
  },
];
