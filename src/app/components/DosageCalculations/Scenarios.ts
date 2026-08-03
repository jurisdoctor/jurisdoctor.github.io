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
const whyWeightHourly = (kg: string, order: string) => [
  `Start with the ${kg} body weight and hang ${order} off it so the kg cancels.`,
  `Remember that ${order} means the amount is divided by kg and by hr, and those two can swap round:`,
  `The order is already per hour, so there's no 60 min per 1 hr step. Adding one anyway is the easiest way to land 60× off.`,
];
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
    note: "Safe dose check: at 15 mg/kg every 6 hours the child gets 60 mg/kg/day, under the 75 mg/kg/day ceiling in the order, so it's within range.",
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
    note: "Safe dose check: the order works out to 150 mg/kg/day, or 3,300 mg/day. No ceiling was given here, so verify the mg/kg/day against your drug reference and institutional limits before administering.",
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
    note: "Safe dose check: 1,760 mg/day is 1.76 g, under the 4 g/day maximum in the order, so it's within range.",
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
    note: "Safe dose check: 2,500 mg/day is 2.5 g, under the 3 g/day maximum in the order, so it's within range.",
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
    id: 81,
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
    id: 82,
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
    id: 83,
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
    id: 84,
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
    id: 85,
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
    id: 86,
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
    id: 87,
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
    id: 88,
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
    id: 91,
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
    id: 92,
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
    id: 93,
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
    id: 94,
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
    id: 95,
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
    id: 96,
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
    id: 97,
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
    id: 98,
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
    id: 99,
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
    id: 100,
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
    id: 101,
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
    id: 102,
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
    id: 103,
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
    id: 105,
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
    id: 106,
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
    id: 107,
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
    id: 108,
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
    id: 109,
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
    id: 110,
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
    id: 111,
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
    id: 113,
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
    id: 114,
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
    id: 80,
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
    id: 89,
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
    id: 90,
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
    id: 104,
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
    id: 112,
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
];
