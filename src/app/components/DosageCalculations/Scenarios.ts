export interface TermType {
  /** a plain quantity, e.g. "16 kg" */
  value?: string;
  /** a conversion factor, rendered as a stacked fraction */
  top?: string;
  bottom?: string;
}

export interface StepType {
  label: string;
  chain: TermType[];
  result: string;
  /** why this step is set up the way it is — which value leads, and what cancels */
  why: string;
}

/**
 * The six-question set-up, run on every scenario before the maths starts.
 * Step 1 is always the target unit and the last two are always "do you need to
 * convert" and "set up and solve", so only the lookups in between vary — a
 * tablet problem has a quantity and dose available, a fluid one has a weight
 * and a rule. Same shape either way.
 */
export interface SetupType {
  /** what you're solving for, in the unit the answer has to be in */
  unit: string;
  /** the values you go hunting for, in the order you'd read them off */
  lookups: { label: string; value: string }[];
  /** step 5 — "No", or "Yes → mcg to mg, and min to hr" */
  convert: string;
}

export interface ScenarioType {
  id: number;
  title: string;
  prompt: string;
  answer: number;
  unit: string;
  /** how far off still counts, for answers that get rounded at the bedside */
  tolerance: number;
  setup: SetupType;
  steps: StepType[];
  note?: string;
}

/** a plain quantity in the chain */
const v = (value: string): TermType => ({ value });

/** a conversion factor in the chain */
const f = (top: string, bottom: string): TermType => ({ top, bottom });

// ======== shared reasoning ========
// The same handful of set-ups come up over and over. Spelling each one out the
// same way is the point — the pattern is what you're meant to recognise.
//
// Every scenario's first tip opens with "Start with", because picking the
// starting value is the step people get wrong. The test isn't "is it a rate?" —
// plenty of these start with a rate. The test is whether the value is a
// QUANTITY (something true of this patient or this order) or a RELATIONSHIP
// between two units (true regardless of the patient). Quantities lead;
// relationships become the factors that cancel.

/** leading with body weight against a per-kg order */
const whyWeight = (kg: string, order: string, out: string) =>
  `Start with what the question tells you about this patient → the ${kg} body weight. That's a quantity. ${order} isn't a quantity, it's a relationship between two units, which is exactly what a conversion factor is. Write it with kg on the bottom so it sits under the kg you started with. Those cancel, and ${out} is what survives.`;

/** splitting a daily total across scheduled doses */
const whyDivide = (doses: string) =>
  `You have a daily total but you're handing over one dose, so the "per day" has to go. Multiply by 1 day over ${doses}: day on top cancels the day underneath, and the doses land on the bottom, giving you the amount in a single dose.`;

/** trading a drug amount for a volume using the supplied concentration */
const whyVolume = (supply: string, drug: string) =>
  `The question asks for a volume, so the answer's unit is mL, and that tells you mL belongs on top. Take the supply (${supply}) and write it that way up. The ${drug} you're carrying cancels against the ${drug} underneath, and mL is all that's left. ${FLIP(supply)}`;

/**
 * The reciprocal point, in the same words wherever a concentration gets
 * inverted. It looks like cheating the first few times and it isn't.
 */
const FLIP = (supply: string) =>
  `Writing the label upside down isn't cheating. A concentration is a ratio: ${supply} says the drug and the volume sit in fixed proportion, and stating that ratio the other way up is exactly the same fact about exactly the same vial. Both orientations are true; only one of them cancels the unit you're holding, so that's the one you write.`;

/** the mcg/min -> mL/hr chain every weight-based drip shares */
const whyDrip = (bag: string) =>
  `You're carrying mcg/min and the pump wants mL/hr, so build a chain where every unit cancels except those two. 1 mg per 1,000 mcg moves you into mg, because that's how the bag is labelled. ${bag} then trades the drug for the volume holding it. Finally 60 min per 1 hr flips a per-minute dose into a per-hour rate.`;

/** a flat (non weight-based) drip, already in amount per minute */
const whyFlatDrip = (dose: string, bag: string) =>
  `Start with what's ordered → ${dose}. It's a rate, and it still leads: what makes a value the starting point isn't whether it's a rate, it's whether it's the quantity you're converting rather than the relationship you're converting with. ${bag} is the relationship here. Then 60 min per 1 hr turns the per-minute dose into the per-hour rate the pump takes.`;

/** the ordered amount leads straight into a concentration */
const whyOrderVolume = (order: string, supply: string, drug: string) =>
  `Start with what's ordered → ${order}. That's the quantity you're converting; ${supply} describes a relationship, so it's the factor. You want mL, so write it with mL on top. The ${drug} cancels and mL is your answer. ${FLIP(supply)}`;

/** units/hr against a bag labelled in units */
const whyUnitsBag = (bag: string) =>
  `You're carrying units per hour and the pump wants mL per hour. The bag (${bag}) is the only thing that trades units for volume, so write it with mL on top; the units cancel and mL/hr drops out.`;

/** a drip ordered in units per minute */
const whyUnitDrip = (dose: string, bag: string) =>
  `Start with what's ordered → ${dose}. Another rate leading the chain, and for the same reason: it's the quantity, ${bag} is the relationship. No weight step and no mcg-to-mg step here, since the order is already in the bag's own units. Then 60 min per 1 hr makes it hourly.`;

/** grams ordered, milligrams on the label */
const whyGramsToVolume = (order: string, supply: string) =>
  `Start with what's ordered → ${order}. The vial is labelled ${supply}, and units have to match before they can cancel, so convert with 1,000 mg per 1 g first. Then the concentration goes mL over mg, the mg cancels, and mL is left. ${FLIP(supply)}`;

/** carrying mcg into a label written in mg */
const whyMcgToVolume = (supply: string) =>
  `You're carrying mcg but the vial is labelled ${supply}. Convert with 1 mg per 1,000 mcg so the units match, then write the concentration with mL on top; the mg cancels and leaves the volume. ${FLIP(supply)}`;

/** carrying mg into a supply written per gram */
const whyMgToGramVolume = (supply: string) =>
  `You're carrying mg but the supply is written per gram, so convert with 1 g per 1,000 mg first. Then ${supply} puts mL on top, the grams cancel, and mL is what's left. ${FLIP(supply)}`;

/** an order in grams per hour against a bag in grams */
const whyGramRate = (order: string, bag: string) =>
  `Start with what's ordered → ${order}. The bag (${bag}) is the relationship that turns grams into millilitres, so put mL on top and the grams cancel. The "per hour" isn't touched by any of it and rides straight through to the answer.`;

/** how much fluid holds a given dose */
const whyBagVolume = (dose: string, bag: string) =>
  `Start with the dose you have to deliver → ${dose}. Before you can talk about a rate you need to know how much fluid holds it. The bag is ${bag}, so write it with mL on top; the grams cancel and leave the volume.`;

/** that volume, over the ordered time */
const whyTimedRate = (volume: string, minutes: string) =>
  `Now it's volume over time: ${volume} in ${minutes}. Multiply by 60 min per 1 hr so the minutes cancel and the rate comes out per hour, the way the pump is programmed.`;

/** titration questions: only the new order matters */
const whyTitrate = (to: string, from: string, kg: string) =>
  `Start with the new order, not the old one: titration questions only care about where you're going, so use ${to} and ignore the ${from} you were running. From there it's the usual set-up: the ${kg} weight is the quantity, the dose is the relationship, and the kg cancels.`;

/** weight-based but already per hour */
const whyWeightHourly = (kg: string, order: string) =>
  `Start with the ${kg} body weight and hang ${order} off it so the kg cancels. Note the order is already per hour, so there's no 60 min per 1 hr step here. Adding one anyway is the easiest way to end up 60× off.`;

/** a bag labelled in the same mcg you're carrying */
const whyMcgBag = (bag: string) =>
  `The bag (${bag}) is labelled in mcg, the same unit you're already carrying, so it goes straight in with mL on top. No conversion needed; the mcg cancels and leaves mL/hr.`;

/** weight-based bolus */
const whyBolus = (kg: string, perKg: string) =>
  `Start with the ${kg} body weight, since the bolus is ordered per kg. Write ${perKg} with mL on top; the kg cancels and leaves the total bolus volume.`;

// ---- the 4-2-1 bands ----
const why421First =
  "Start with the first band. The 4-2-1 rule splits body weight into bands, so take them one at a time. The first 10 kg always earns 4 mL/hr per kg. Write it as a rate over 1 kg so the kg cancels and mL/hr is left.";

const why421Second = (band: string) =>
  `The second band is the next 10 kg at 2 mL/hr per kg. Only ${band} falls in it, so only that much earns the 2 mL/hr rate.`;

const why421Third = (band: string) =>
  `Everything past 20 kg earns 1 mL/hr per kg. That's the last ${band} here.`;

const why421Sum =
  "The bands are separate rates feeding one line, so they add. Nothing cancels here; it's plain addition.";

const whyDeficit = (volume: string, hours: string) =>
  `The deficit is a fixed volume with a deadline, so divide ${volume} by the ${hours} you've been given. That turns a one-off volume into an hourly rate you can add to maintenance.`;

const whyTotalRate =
  "Maintenance and deficit replacement run through the same line, so the pump rate is simply the two added together.";

const whyMaintWindow = (bolus: string, window: string) =>
  `Maintenance only starts once the bolus is done, so take the ${bolus} bolus off the ${window} window.`;

const whyMaintVolume =
  "Hours times mL per hour: the hours cancel and leave the volume maintenance delivered on its own.";

const whyBolusTotal =
  "The bolus and the maintenance both went through the line, so the total is the two added together.";

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
      lookups: [
        { label: "Weight", value: "16 kg" },
        { label: "Ordered dose", value: "25 mg/kg/day" },
        { label: "Doses per day", value: "2" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("16 kg"), f("25 mg/day", "1 kg")],
        result: "400 mg/day",
        why: whyWeight("16 kg", "25 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("400 mg/day"), f("1 day", "2 doses")],
        result: "200 mg/dose",
        why: whyDivide("two doses"),
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
      lookups: [
        { label: "Volume ordered", value: "1,000 mL" },
        { label: "Time ordered", value: "8 hr" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Flow rate",
        chain: [f("1,000 mL", "8 hr")],
        result: "125 mL/hr",
        why: "Start with the volume that has to go in → 1,000 mL, and put the time you've been given underneath. A flow rate is volume over time, so the fraction writes itself; dividing leaves mL/hr, the unit the pump is asking for.",
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
    tolerance: 0.5,
    setup: {
      unit: "gtt/min",
      lookups: [
        { label: "Rate running", value: "125 mL/hr" },
        { label: "Drop factor", value: "20 gtt/mL" },
      ],
      convert: "Yes → hr to min",
    },
    steps: [
      {
        label: "Drip rate",
        chain: [v("125 mL/hr"), f("20 gtt", "1 mL"), f("1 hr", "60 min")],
        result: "41.67 gtt/min",
        why: "Start with the rate that's already running → 125 mL/hr. It's a rate and it still leads, because it's the quantity being converted; the drop factor and the minute conversion are the relationships doing the converting. Write the drop factor with gtt on top so the mL cancels, then 1 hr over 60 min to turn hours into minutes. gtt/min is what's left.",
      },
    ],
    note: "Round to 42 gtt/min; you can't count a fraction of a drop.",
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
      lookups: [
        { label: "Quantity available", value: "1 mL" },
        { label: "Dose available", value: "100 mg" },
        { label: "Desired dose", value: "750 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("750 mg"), f("1 mL", "100 mg")],
        result: "7.5 mL",
        why: whyOrderVolume("750 mg", "100 mg/mL", "mg"),
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
      lookups: [
        { label: "Weight", value: "75 kg" },
        { label: "Ordered dose", value: "18 units/kg/hr" },
        { label: "Quantity available", value: "500 mL" },
        { label: "Dose available", value: "25,000 units" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour",
        chain: [v("75 kg"), f("18 units/hr", "1 kg")],
        result: "1,350 units/hr",
        why: whyWeight("75 kg", "18 units/kg/hr", "units per hour"),
      },
      {
        label: "Infusion rate",
        chain: [v("1,350 units/hr"), f("500 mL", "25,000 units")],
        result: "27 mL/hr",
        why: whyUnitsBag("25,000 units in 500 mL"),
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
      lookups: [
        { label: "Weight", value: "22 kg" },
        { label: "Rule", value: "4-2-1" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "First 10 kg",
        chain: [v("10 kg"), f("4 mL/hr", "1 kg")],
        result: "40 mL/hr",
        why: why421First,
      },
      {
        label: "Next 10 kg",
        chain: [v("10 kg"), f("2 mL/hr", "1 kg")],
        result: "20 mL/hr",
        why: why421Second("the whole second 10 kg"),
      },
      {
        label: "Remaining 2 kg",
        chain: [v("2 kg"), f("1 mL/hr", "1 kg")],
        result: "2 mL/hr",
        why: why421Third("2 kg"),
      },
      {
        label: "Total",
        chain: [v("40 + 20 + 2 mL/hr")],
        result: "62 mL/hr",
        why: why421Sum,
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
      lookups: [
        { label: "Weight", value: "70 kg" },
        { label: "Ordered dose", value: "0.5 units/kg/day" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("70 kg"), f("0.5 units/day", "1 kg")],
        result: "35 units/day",
        why: whyWeight("70 kg", "0.5 units/kg/day", "units per day"),
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
      lookups: [
        { label: "Quantity available", value: "1 tablet" },
        { label: "Dose available", value: "20 mg" },
        { label: "Desired dose", value: "40 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Tablets",
        chain: [v("40 mg"), f("1 tablet", "20 mg")],
        result: "2 tablets",
        why: "Start with what's ordered → 40 mg. That's the quantity; the tablet strength is the relationship, so write it with tablets on top. The mg cancels and you're left counting tablets.",
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
      lookups: [
        { label: "Weight", value: "80 kg" },
        { label: "Ordered dose", value: "5 mcg/kg/min" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "400 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("80 kg"), f("5 mcg/min", "1 kg")],
        result: "400 mcg/min",
        why: whyWeight("80 kg", "5 mcg/kg/min", "mcg per minute"),
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
        why: whyDrip("250 mL per 400 mg"),
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
      lookups: [
        { label: "Weight", value: "24 kg" },
        { label: "Ordered dose", value: "15 mg/kg" },
        { label: "Quantity available", value: "5 mL" },
        { label: "Dose available", value: "160 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("24 kg"), f("15 mg", "1 kg")],
        result: "360 mg",
        why: whyWeight("24 kg", "15 mg/kg", "the mg in one dose"),
      },
      {
        label: "Volume",
        chain: [v("360 mg"), f("5 mL", "160 mg")],
        result: "11.25 mL",
        why: whyVolume("160 mg per 5 mL", "mg"),
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
    tolerance: 0.5,
    setup: {
      unit: "mL/hr",
      lookups: [
        { label: "Volume ordered", value: "250 mL" },
        { label: "Time ordered", value: "90 min" },
      ],
      convert: "Yes → min to hr",
    },
    steps: [
      {
        label: "Flow rate",
        chain: [f("250 mL", "90 min"), f("60 min", "1 hr")],
        result: "166.67 mL/hr",
        why: "Start with the volume in the bag → 250 mL, over the 90 minutes you've been given. That's mL/min, but the answer has to be per hour, so multiply by 60 min per 1 hr; the minutes cancel and the rate lands in mL/hr.",
      },
    ],
    note: "Most pumps take one decimal, so set it at 166.7 mL/hr.",
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
      lookups: [
        { label: "Quantity available", value: "1 mL" },
        { label: "Dose available", value: "2 mg" },
        { label: "Desired dose", value: "10 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Volume",
        chain: [v("10 mg"), f("1 mL", "2 mg")],
        result: "5 mL",
        why: whyOrderVolume("10 mg", "2 mg/mL", "mg"),
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
      lookups: [
        { label: "Desired dose", value: "12 mcg/min" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "4 mg" },
      ],
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
        why: whyFlatDrip("12 mcg/min", "250 mL per 4 mg"),
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
      lookups: [
        { label: "Weight", value: "15 kg" },
        { label: "Ordered dose", value: "10 mg/kg" },
        { label: "Quantity available", value: "5 mL" },
        { label: "Dose available", value: "200 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("15 kg"), f("10 mg", "1 kg")],
        result: "150 mg",
        why: whyWeight("15 kg", "10 mg/kg", "the mg in one dose"),
      },
      {
        label: "Volume",
        chain: [v("150 mg"), f("5 mL", "200 mg")],
        result: "3.75 mL",
        why: whyVolume("200 mg per 5 mL", "mg"),
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
      lookups: [
        { label: "Weight", value: "60 kg" },
        { label: "Ordered dose", value: "15 mg/kg" },
        { label: "Quantity available", value: "1 mL" },
        { label: "Dose available", value: "50 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("60 kg"), f("15 mg", "1 kg")],
        result: "900 mg",
        why: whyWeight("60 kg", "15 mg/kg", "the mg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("900 mg"), f("1 mL", "50 mg")],
        result: "18 mL",
        why: whyVolume("50 mg/mL", "mg"),
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
      lookups: [
        { label: "Weight", value: "72 kg" },
        { label: "Ordered dose", value: "7 mcg/kg/min" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "500 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("72 kg"), f("7 mcg/min", "1 kg")],
        result: "504 mcg/min",
        why: whyWeight("72 kg", "7 mcg/kg/min", "mcg per minute"),
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
        why: whyDrip("250 mL per 500 mg"),
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
      lookups: [
        { label: "Weight", value: "22 kg" },
        { label: "Ordered dose", value: "150 mg/kg/day" },
        { label: "Doses per day", value: "3" },
        { label: "Quantity available", value: "5 mL" },
        { label: "Dose available", value: "250 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("22 kg"), f("150 mg/day", "1 kg")],
        result: "3,300 mg/day",
        why: whyWeight("22 kg", "150 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("3,300 mg/day"), f("1 day", "3 doses")],
        result: "1,100 mg/dose",
        why: whyDivide("three doses"),
      },
      {
        label: "Volume",
        chain: [v("1,100 mg"), f("5 mL", "250 mg")],
        result: "22 mL",
        why: whyVolume("250 mg per 5 mL", "mg"),
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
      lookups: [
        { label: "Volume ordered", value: "900 mL" },
        { label: "Time ordered", value: "6 hr" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "New rate",
        chain: [f("900 mL", "6 hr")],
        result: "150 mL/hr",
        why: "Start with the new order and set the old 75 mL/hr aside: it gets subtracted later, but it plays no part in this step. 900 mL over 6 hr is volume over time, which divides straight to mL/hr.",
      },
      {
        label: "Increase",
        chain: [v("150 mL/hr − 75 mL/hr")],
        result: "75 mL/hr",
        why: "'By how much' means subtract. Both rates are already in mL/hr, so nothing needs converting first.",
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
      lookups: [
        { label: "Basal rate", value: "1.2 units/hr" },
        { label: "Time asked about", value: "1 hr" },
        { label: "Sliding scale bolus", value: "2 units" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Basal over 1 hour",
        chain: [v("1 hr"), f("1.2 units", "1 hr")],
        result: "1.2 units",
        why: "Start with the basal rate → 1.2 units/hr, and multiply by the 1 hr the question asks about. The hours cancel and leave plain units.",
      },
      {
        label: "Sliding scale (284 mg/dL > 250 mg/dL)",
        chain: [v("2 units")],
        result: "2 units",
        why: "This one is a lookup, not a calculation. 284 mg/dL clears the > 250 mg/dL threshold, so the 2 unit bolus applies exactly as written.",
      },
      {
        label: "Total",
        chain: [v("1.2 units + 2 units")],
        result: "3.2 units",
        why: "Basal and bolus are both insulin reaching the same patient in the same hour, so they add.",
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
      lookups: [
        { label: "Quantity available", value: "1 mL" },
        { label: "Dose available", value: "100 mg" },
        { label: "Desired dose", value: "1 g" },
      ],
      convert: "Yes → g to mg",
    },
    steps: [
      {
        label: "Volume to withdraw",
        chain: [v("1 g"), f("1,000 mg", "1 g"), f("1 mL", "100 mg")],
        result: "10 mL",
        why: whyGramsToVolume("1 g", "100 mg/mL"),
      },
    ],
    note: "The whole reconstituted vial goes into the 50 mL NS; the dilution volume doesn't change how much you draw up.",
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
      lookups: [
        { label: "Weight", value: "64 kg" },
        { label: "Ordered dose", value: "14 units/kg/hr" },
        { label: "Quantity available", value: "500 mL" },
        { label: "Dose available", value: "25,000 units" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour",
        chain: [v("64 kg"), f("14 units/hr", "1 kg")],
        result: "896 units/hr",
        why: whyWeight("64 kg", "14 units/kg/hr", "units per hour"),
      },
      {
        label: "Infusion rate",
        chain: [v("896 units/hr"), f("500 mL", "25,000 units")],
        result: "17.92 mL/hr",
        why: whyUnitsBag("25,000 units in 500 mL"),
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
      lookups: [
        { label: "Weight", value: "18 kg" },
        { label: "Rule", value: "4-2-1" },
        { label: "Deficit", value: "150 mL over 6 hr" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "First 10 kg",
        chain: [v("10 kg"), f("4 mL/hr", "1 kg")],
        result: "40 mL/hr",
        why: why421First,
      },
      {
        label: "Next 8 kg",
        chain: [v("8 kg"), f("2 mL/hr", "1 kg")],
        result: "16 mL/hr",
        why: why421Second("8 kg"),
      },
      {
        label: "Maintenance",
        chain: [v("40 + 16 mL/hr")],
        result: "56 mL/hr",
        why: why421Sum,
      },
      {
        label: "Deficit replacement",
        chain: [f("150 mL", "6 hr")],
        result: "25 mL/hr",
        why: whyDeficit("150 mL", "6 hours"),
      },
      {
        label: "Total",
        chain: [v("56 + 25 mL/hr")],
        result: "81 mL/hr",
        why: whyTotalRate,
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
      lookups: [
        { label: "Quantity available", value: "200 mL" },
        { label: "Dose available", value: "1 g" },
        { label: "Desired dose", value: "1.25 g" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Volume per dose",
        chain: [v("1.25 g"), f("200 mL", "1 g")],
        result: "250 mL",
        why: "Start with what's ordered → 1.25 g. The body weight is the trap here: the order is already in grams, so there's nothing for the weight to do. Write the supply with mL on top; the grams cancel and leave the volume for one dose.",
      },
      {
        label: "Doses per day (every 8 hours)",
        chain: [f("24 hr", "8 hr")],
        result: "3 doses",
        why: "Every 8 hours means the day divides into 8-hour slots. 24 hr over 8 hr cancels the hours and leaves a plain count of doses.",
      },
      {
        label: "24-hour volume",
        chain: [v("250 mL/dose"), v("3 doses")],
        result: "750 mL",
        why: "Volume per dose times the number of doses gives the whole day's volume.",
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
      lookups: [
        { label: "Desired dose", value: "2 g/hr" },
        { label: "Quantity available", value: "1,000 mL" },
        { label: "Dose available", value: "40 g" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Infusion rate",
        chain: [v("2 g/hr"), f("1,000 mL", "40 g")],
        result: "50 mL/hr",
        why: whyGramRate("2 g/hr", "40 g in 1,000 mL"),
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
      lookups: [
        { label: "Weight", value: "12 kg" },
        { label: "Ordered dose", value: "30 mg/kg/day" },
        { label: "Doses per day", value: "2" },
        { label: "Quantity available", value: "5 mL" },
        { label: "Dose available", value: "400 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("12 kg"), f("30 mg/day", "1 kg")],
        result: "360 mg/day",
        why: whyWeight("12 kg", "30 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("360 mg/day"), f("1 day", "2 doses")],
        result: "180 mg/dose",
        why: whyDivide("two doses"),
      },
      {
        label: "Volume",
        chain: [v("180 mg"), f("5 mL", "400 mg")],
        result: "2.25 mL",
        why: whyVolume("400 mg per 5 mL", "mg"),
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
      lookups: [
        { label: "Weight", value: "70 kg" },
        { label: "Ordered dose", value: "0.12 mcg/kg/min" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "4 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute at the new dose",
        chain: [v("70 kg"), f("0.12 mcg/min", "1 kg")],
        result: "8.4 mcg/min",
        why: whyTitrate("0.12 mcg/kg/min", "0.08 mcg/kg/min", "70 kg"),
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
        why: whyDrip("250 mL per 4 mg"),
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
      lookups: [
        { label: "Bolus", value: "1,000 mL over 2 hr" },
        { label: "Maintenance rate", value: "125 mL/hr" },
        { label: "Window asked about", value: "8 hr" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Bolus",
        chain: [v("1,000 mL")],
        result: "1,000 mL",
        why: "Start with the bolus, which is handed to you outright → 1,000 mL, nothing to convert. Not every step needs a factor.",
      },
      {
        label: "Time left after the bolus",
        chain: [v("8 hr − 2 hr")],
        result: "6 hr",
        why: "The continuous infusion only starts once the bolus finishes, so take the 2 bolus hours off the 8-hour window.",
      },
      {
        label: "Continuous infusion",
        chain: [v("6 hr"), f("125 mL", "1 hr")],
        result: "750 mL",
        why: "Hours times mL per hour: the hours cancel and leave the volume the maintenance line delivered.",
      },
      {
        label: "Total",
        chain: [v("1,000 + 750 mL")],
        result: "1,750 mL",
        why: "Both volumes went into the same patient, so they add.",
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
      lookups: [
        { label: "Weight", value: "78 kg" },
        { label: "Ordered dose", value: "35 mcg/kg/min" },
        { label: "Quantity available", value: "100 mL" },
        { label: "Dose available", value: "1,000 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("78 kg"), f("35 mcg/min", "1 kg")],
        result: "2,730 mcg/min",
        why: whyWeight("78 kg", "35 mcg/kg/min", "mcg per minute"),
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
        why: whyDrip("100 mL per 1,000 mg"),
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
      lookups: [
        { label: "Weight", value: "65 kg" },
        { label: "Ordered dose", value: "10 mcg/kg" },
        { label: "Quantity available", value: "1 mL" },
        { label: "Dose available", value: "0.25 mg" },
      ],
      convert: "Yes → mcg to mg",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("65 kg"), f("10 mcg", "1 kg")],
        result: "650 mcg",
        why: whyWeight("65 kg", "10 mcg/kg", "the mcg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("650 mcg"), f("1 mg", "1,000 mcg"), f("1 mL", "0.25 mg")],
        result: "2.6 mL",
        why: whyMcgToVolume("0.25 mg/mL"),
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
      lookups: [
        { label: "Desired dose", value: "5 mcg/min" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "4 mg" },
      ],
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
        why: whyFlatDrip("5 mcg/min", "250 mL per 4 mg"),
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
      lookups: [
        { label: "Weight", value: "82 kg" },
        { label: "Ordered dose", value: "0.5 mcg/kg/min" },
        { label: "Quantity available", value: "100 mL" },
        { label: "Dose available", value: "20 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("82 kg"), f("0.5 mcg/min", "1 kg")],
        result: "41 mcg/min",
        why: whyWeight("82 kg", "0.5 mcg/kg/min", "mcg per minute"),
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
        why: whyDrip("100 mL per 20 mg"),
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
      lookups: [
        { label: "Weight", value: "18 kg" },
        { label: "Ordered dose", value: "12 mg/kg" },
        { label: "Quantity available", value: "5 mL" },
        { label: "Dose available", value: "160 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("18 kg"), f("12 mg", "1 kg")],
        result: "216 mg",
        why: whyWeight("18 kg", "12 mg/kg", "the mg in one dose"),
      },
      {
        label: "Volume",
        chain: [v("216 mg"), f("5 mL", "160 mg")],
        result: "6.75 mL",
        why: whyVolume("160 mg per 5 mL", "mg"),
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
      lookups: [
        { label: "Weight", value: "68 kg" },
        { label: "Ordered dose", value: "7 mcg/kg/min" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "400 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute at the new dose",
        chain: [v("68 kg"), f("7 mcg/min", "1 kg")],
        result: "476 mcg/min",
        why: whyTitrate("7 mcg/kg/min", "5 mcg/kg/min", "68 kg"),
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
        why: whyDrip("250 mL per 400 mg"),
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
      lookups: [
        { label: "Quantity available", value: "1 mL" },
        { label: "Dose available", value: "200 mg" },
        { label: "Desired dose", value: "1 g" },
      ],
      convert: "Yes → g to mg",
    },
    steps: [
      {
        label: "Volume per dose",
        chain: [v("1 g"), f("1,000 mg", "1 g"), f("1 mL", "200 mg")],
        result: "5 mL",
        why: "Start with what's ordered → 1 g, not the 2 g in the vial. You always calculate from the dose, never from the vial size. Convert 1 g to 1,000 mg so it matches the mg/mL label, then put mL on top so the mg cancels.",
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
      lookups: [
        { label: "Weight", value: "72 kg" },
        { label: "Ordered dose", value: "0.08 units/kg/hr" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "100 units" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour",
        chain: [v("72 kg"), f("0.08 units/hr", "1 kg")],
        result: "5.76 units/hr",
        why: whyWeight("72 kg", "0.08 units/kg/hr", "units per hour"),
      },
      {
        label: "Infusion rate",
        chain: [v("5.76 units/hr"), f("250 mL", "100 units")],
        result: "14.4 mL/hr",
        why: whyUnitsBag("100 units in 250 mL"),
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
      lookups: [
        { label: "Weight", value: "24 kg" },
        { label: "Rule", value: "4-2-1" },
        { label: "Deficit", value: "200 mL over 8 hr" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "First 10 kg",
        chain: [v("10 kg"), f("4 mL/hr", "1 kg")],
        result: "40 mL/hr",
        why: why421First,
      },
      {
        label: "Next 10 kg",
        chain: [v("10 kg"), f("2 mL/hr", "1 kg")],
        result: "20 mL/hr",
        why: why421Second("the whole second 10 kg"),
      },
      {
        label: "Remaining 4 kg",
        chain: [v("4 kg"), f("1 mL/hr", "1 kg")],
        result: "4 mL/hr",
        why: why421Third("4 kg"),
      },
      {
        label: "Maintenance",
        chain: [v("40 + 20 + 4 mL/hr")],
        result: "64 mL/hr",
        why: why421Sum,
      },
      {
        label: "Deficit replacement",
        chain: [f("200 mL", "8 hr")],
        result: "25 mL/hr",
        why: whyDeficit("200 mL", "8 hours"),
      },
      {
        label: "Total",
        chain: [v("64 + 25 mL/hr")],
        result: "89 mL/hr",
        why: whyTotalRate,
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
      lookups: [
        { label: "Weight", value: "88 kg" },
        { label: "Ordered dose", value: "15 mg/kg" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "1 g" },
      ],
      convert: "Yes → mg to g",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("88 kg"), f("15 mg", "1 kg")],
        result: "1,320 mg",
        why: whyWeight("88 kg", "15 mg/kg", "the mg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("1,320 mg"), f("1 g", "1,000 mg"), f("250 mL", "1 g")],
        result: "330 mL",
        why: whyMgToGramVolume("250 mL per 1 g"),
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
      lookups: [
        { label: "Desired dose", value: "6 g" },
        { label: "Quantity available", value: "1,000 mL" },
        { label: "Dose available", value: "40 g" },
        { label: "Time ordered", value: "30 min" },
      ],
      convert: "Yes → min to hr",
    },
    steps: [
      {
        label: "Volume of the dose",
        chain: [v("6 g"), f("1,000 mL", "40 g")],
        result: "150 mL",
        why: whyBagVolume("6 g", "40 g in 1,000 mL"),
      },
      {
        label: "Infusion rate",
        chain: [f("150 mL", "30 min"), f("60 min", "1 hr")],
        result: "300 mL/hr",
        why: whyTimedRate("150 mL", "30 min"),
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
      lookups: [
        { label: "Weight", value: "14 kg" },
        { label: "Ordered dose", value: "30 mg/kg/day" },
        { label: "Doses per day", value: "3" },
        { label: "Quantity available", value: "5 mL" },
        { label: "Dose available", value: "250 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("14 kg"), f("30 mg/day", "1 kg")],
        result: "420 mg/day",
        why: whyWeight("14 kg", "30 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("420 mg/day"), f("1 day", "3 doses")],
        result: "140 mg/dose",
        why: whyDivide("three doses"),
      },
      {
        label: "Volume",
        chain: [v("140 mg"), f("5 mL", "250 mg")],
        result: "2.8 mL",
        why: whyVolume("250 mg per 5 mL", "mg"),
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
    tolerance: 0.05,
    setup: {
      unit: "mL/hr",
      lookups: [
        { label: "Weight", value: "75 kg" },
        { label: "Ordered dose", value: "0.1 mcg/kg/min" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "4 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("75 kg"), f("0.1 mcg/min", "1 kg")],
        result: "7.5 mcg/min",
        why: whyWeight("75 kg", "0.1 mcg/kg/min", "mcg per minute"),
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
        why: whyDrip("250 mL per 4 mg"),
      },
    ],
    note: "Set the pump at 28.1 mL/hr.",
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
      lookups: [
        { label: "Weight", value: "60 kg" },
        { label: "Ordered dose", value: "16 units/kg/hr" },
        { label: "Quantity available", value: "500 mL" },
        { label: "Dose available", value: "25,000 units" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour",
        chain: [v("60 kg"), f("16 units/hr", "1 kg")],
        result: "960 units/hr",
        why: whyWeight("60 kg", "16 units/kg/hr", "units per hour"),
      },
      {
        label: "Infusion rate",
        chain: [v("960 units/hr"), f("500 mL", "25,000 units")],
        result: "19.2 mL/hr",
        why: whyUnitsBag("25,000 units in 500 mL"),
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
      lookups: [
        { label: "Weight", value: "90 kg" },
        { label: "Ordered dose", value: "50 mcg/kg/min" },
        { label: "Quantity available", value: "100 mL" },
        { label: "Dose available", value: "1,000 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("90 kg"), f("50 mcg/min", "1 kg")],
        result: "4,500 mcg/min",
        why: whyWeight("90 kg", "50 mcg/kg/min", "mcg per minute"),
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
        why: whyDrip("100 mL per 1,000 mg"),
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
      lookups: [
        { label: "Weight", value: "85 kg" },
        { label: "Ordered dose", value: "0.25 mg/kg" },
        { label: "Quantity available", value: "1 mL" },
        { label: "Dose available", value: "5 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("85 kg"), f("0.25 mg", "1 kg")],
        result: "21.25 mg",
        why: whyWeight("85 kg", "0.25 mg/kg", "the mg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("21.25 mg"), f("1 mL", "5 mg")],
        result: "4.25 mL",
        why: whyVolume("5 mg/mL", "mg"),
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
      lookups: [
        { label: "Weight", value: "12 kg" },
        { label: "Bolus ordered", value: "20 mL/kg over 30 min" },
        { label: "Maintenance rule", value: "4-2-1" },
        { label: "Window asked about", value: "4 hr" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Bolus",
        chain: [v("12 kg"), f("20 mL", "1 kg")],
        result: "240 mL",
        why: whyBolus("12 kg", "20 mL/kg"),
      },
      {
        label: "Maintenance rate (4-2-1)",
        chain: [v("4 mL/hr × 10 kg + 2 mL/hr × 2 kg")],
        result: "44 mL/hr",
        why: "12 kg splits across two bands: the first 10 kg at 4 mL/hr each, then the leftover 2 kg at 2 mL/hr each. Add the bands to get the hourly rate.",
      },
      {
        label: "Maintenance time",
        chain: [v("4 hr − 0.5 hr")],
        result: "3.5 hr",
        why: whyMaintWindow("30-minute", "4-hour"),
      },
      {
        label: "Maintenance volume",
        chain: [v("3.5 hr"), f("44 mL", "1 hr")],
        result: "154 mL",
        why: whyMaintVolume,
      },
      {
        label: "Total",
        chain: [v("240 + 154 mL")],
        result: "394 mL",
        why: whyBolusTotal,
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
      lookups: [
        { label: "Desired dose", value: "10 mcg/min" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "4 mg" },
      ],
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
        why: whyFlatDrip("10 mcg/min", "250 mL per 4 mg"),
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
      lookups: [
        { label: "Desired dose", value: "8 mcg/min" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "2 mg" },
      ],
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
        why: whyFlatDrip("8 mcg/min", "250 mL per 2 mg"),
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
      lookups: [
        { label: "Weight", value: "22 kg" },
        { label: "Ordered dose", value: "80 mg/kg/day" },
        { label: "Doses per day", value: "2" },
        { label: "Quantity available", value: "1 mL" },
        { label: "Dose available", value: "100 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("22 kg"), f("80 mg/day", "1 kg")],
        result: "1,760 mg/day",
        why: whyWeight("22 kg", "80 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("1,760 mg/day"), f("1 day", "2 doses")],
        result: "880 mg/dose",
        why: whyDivide("two doses"),
      },
      {
        label: "Volume",
        chain: [v("880 mg"), f("1 mL", "100 mg")],
        result: "8.8 mL",
        why: whyVolume("100 mg/mL", "mg"),
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
      lookups: [
        { label: "Weight", value: "75 kg" },
        { label: "Ordered dose", value: "16 units/kg/hr" },
        { label: "Quantity available", value: "500 mL" },
        { label: "Dose available", value: "25,000 units" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour at the new dose",
        chain: [v("75 kg"), f("16 units/hr", "1 kg")],
        result: "1,200 units/hr",
        why: whyTitrate("16 units/kg/hr", "14 units/kg/hr", "75 kg"),
      },
      {
        label: "Infusion rate",
        chain: [v("1,200 units/hr"), f("500 mL", "25,000 units")],
        result: "24 mL/hr",
        why: whyUnitsBag("25,000 units in 500 mL"),
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
      lookups: [
        { label: "Quantity available", value: "1 mL" },
        { label: "Dose available", value: "50 mg" },
        { label: "Desired dose", value: "1 g" },
      ],
      convert: "Yes → g to mg",
    },
    steps: [
      {
        label: "Volume to withdraw",
        chain: [v("1 g"), f("1,000 mg", "1 g"), f("1 mL", "50 mg")],
        result: "20 mL",
        why: "Start with what's ordered → 1 g. Convert it into mg so it matches the 50 mg/mL label, then put mL on top so the mg cancels. The 100 mL of NS is the diluent; it changes the bag you hang, not the dose you draw.",
      },
    ],
    note: "The full vial is the dose; the 100 mL NS is the diluent, not part of the calculation.",
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
      lookups: [
        { label: "Weight", value: "85 kg" },
        { label: "Ordered dose", value: "0.1 units/kg/hr" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "100 units" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour",
        chain: [v("85 kg"), f("0.1 units/hr", "1 kg")],
        result: "8.5 units/hr",
        why: whyWeight("85 kg", "0.1 units/kg/hr", "units per hour"),
      },
      {
        label: "Infusion rate",
        chain: [v("8.5 units/hr"), f("250 mL", "100 units")],
        result: "21.25 mL/hr",
        why: whyUnitsBag("100 units in 250 mL"),
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
      lookups: [
        { label: "Weight", value: "16 kg" },
        { label: "Rule", value: "4-2-1" },
        { label: "Deficit", value: "100 mL over 4 hr" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "First 10 kg",
        chain: [v("10 kg"), f("4 mL/hr", "1 kg")],
        result: "40 mL/hr",
        why: why421First,
      },
      {
        label: "Next 6 kg",
        chain: [v("6 kg"), f("2 mL/hr", "1 kg")],
        result: "12 mL/hr",
        why: why421Second("6 kg"),
      },
      {
        label: "Maintenance",
        chain: [v("40 + 12 mL/hr")],
        result: "52 mL/hr",
        why: why421Sum,
      },
      {
        label: "Deficit replacement",
        chain: [f("100 mL", "4 hr")],
        result: "25 mL/hr",
        why: whyDeficit("100 mL", "4 hours"),
      },
      {
        label: "Total",
        chain: [v("52 + 25 mL/hr")],
        result: "77 mL/hr",
        why: whyTotalRate,
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
      lookups: [
        { label: "Weight", value: "65 kg" },
        { label: "Ordered dose", value: "15 mg/kg" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "1 g" },
      ],
      convert: "Yes → mg to g",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("65 kg"), f("15 mg", "1 kg")],
        result: "975 mg",
        why: whyWeight("65 kg", "15 mg/kg", "the mg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("975 mg"), f("1 g", "1,000 mg"), f("250 mL", "1 g")],
        result: "243.75 mL",
        why: whyMgToGramVolume("250 mL per 1 g"),
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
      lookups: [
        { label: "Desired dose", value: "2 g/hr" },
        { label: "Quantity available", value: "1,000 mL" },
        { label: "Dose available", value: "40 g" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Infusion rate",
        chain: [v("2 g/hr"), f("1,000 mL", "40 g")],
        result: "50 mL/hr",
        why: whyGramRate("2 g/hr", "40 g in 1,000 mL"),
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
    tolerance: 0.03,
    setup: {
      unit: "mL",
      lookups: [
        { label: "Weight", value: "14 kg" },
        { label: "Ordered dose", value: "50 mg/kg/day" },
        { label: "Doses per day", value: "3" },
        { label: "Quantity available", value: "5 mL" },
        { label: "Dose available", value: "400 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("14 kg"), f("50 mg/day", "1 kg")],
        result: "700 mg/day",
        why: whyWeight("14 kg", "50 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("700 mg/day"), f("1 day", "3 doses")],
        result: "233.3 mg/dose",
        why: whyDivide("three doses"),
      },
      {
        label: "Volume",
        chain: [v("233.3 mg"), f("5 mL", "400 mg")],
        result: "2.92 mL",
        why: whyVolume("400 mg per 5 mL", "mg"),
      },
    ],
    note: "Round to 2.9 mL, which is as fine as an oral syringe reads.",
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
      lookups: [
        { label: "Weight", value: "80 kg" },
        { label: "Ordered dose", value: "0.15 mcg/kg/min" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "4 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute at the new dose",
        chain: [v("80 kg"), f("0.15 mcg/min", "1 kg")],
        result: "12 mcg/min",
        why: whyTitrate("0.15 mcg/kg/min", "0.1 mcg/kg/min", "80 kg"),
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
        why: whyDrip("250 mL per 4 mg"),
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
      lookups: [
        { label: "Weight", value: "70 kg" },
        { label: "Ordered dose", value: "45 mcg/kg/min" },
        { label: "Quantity available", value: "100 mL" },
        { label: "Dose available", value: "1,000 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("70 kg"), f("45 mcg/min", "1 kg")],
        result: "3,150 mcg/min",
        why: whyWeight("70 kg", "45 mcg/kg/min", "mcg per minute"),
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
        why: whyDrip("100 mL per 1,000 mg"),
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
    tolerance: 0.02,
    setup: {
      unit: "mL",
      lookups: [
        { label: "Weight", value: "68 kg" },
        { label: "Ordered dose", value: "12 mcg/kg" },
        { label: "Quantity available", value: "1 mL" },
        { label: "Dose available", value: "0.25 mg" },
      ],
      convert: "Yes → mcg to mg",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("68 kg"), f("12 mcg", "1 kg")],
        result: "816 mcg",
        why: whyWeight("68 kg", "12 mcg/kg", "the mcg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("816 mcg"), f("1 mg", "1,000 mcg"), f("1 mL", "0.25 mg")],
        result: "3.264 mL",
        why: whyMcgToVolume("0.25 mg/mL"),
      },
    ],
    note: "Round to 3.26 mL.",
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
      lookups: [
        { label: "Weight", value: "20 kg" },
        { label: "Bolus ordered", value: "15 mL/kg over 30 min" },
        { label: "Maintenance rule", value: "4-2-1" },
        { label: "Window asked about", value: "3 hr" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Bolus",
        chain: [v("20 kg"), f("15 mL", "1 kg")],
        result: "300 mL",
        why: whyBolus("20 kg", "15 mL/kg"),
      },
      {
        label: "Maintenance rate (4-2-1)",
        chain: [v("4 mL/hr × 10 kg + 2 mL/hr × 10 kg")],
        result: "60 mL/hr",
        why: "20 kg is exactly the first two bands (10 kg at 4 mL/hr and 10 kg at 2 mL/hr), with nothing left over for the 1 mL/hr tier.",
      },
      {
        label: "Maintenance time",
        chain: [v("3 hr − 0.5 hr")],
        result: "2.5 hr",
        why: whyMaintWindow("30-minute", "3-hour"),
      },
      {
        label: "Maintenance volume",
        chain: [v("2.5 hr"), f("60 mL", "1 hr")],
        result: "150 mL",
        why: whyMaintVolume,
      },
      {
        label: "Total",
        chain: [v("300 + 150 mL")],
        result: "450 mL",
        why: whyBolusTotal,
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
      lookups: [
        { label: "Desired dose", value: "0.04 units/min" },
        { label: "Quantity available", value: "500 mL" },
        { label: "Dose available", value: "20 units" },
      ],
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
        why: whyUnitDrip("0.04 units/min", "500 mL per 20 units"),
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
      lookups: [
        { label: "Weight", value: "78 kg" },
        { label: "Ordered dose", value: "3 mcg/kg/hr" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "2,500 mcg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "mcg per hour",
        chain: [v("78 kg"), f("3 mcg/hr", "1 kg")],
        result: "234 mcg/hr",
        why: whyWeightHourly("78 kg", "3 mcg/kg/hr"),
      },
      {
        label: "Infusion rate",
        chain: [v("234 mcg/hr"), f("250 mL", "2,500 mcg")],
        result: "23.4 mL/hr",
        why: whyMcgBag("250 mL per 2,500 mcg"),
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
      lookups: [
        { label: "Weight", value: "70 kg" },
        { label: "Ordered dose", value: "10 mcg/kg/min" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "400 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("70 kg"), f("10 mcg/min", "1 kg")],
        result: "700 mcg/min",
        why: whyWeight("70 kg", "10 mcg/kg/min", "mcg per minute"),
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
        why: whyDrip("250 mL per 400 mg"),
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
      lookups: [
        { label: "Weight", value: "25 kg" },
        { label: "Ordered dose", value: "100 mg/kg/day" },
        { label: "Doses per day", value: "2" },
        { label: "Quantity available", value: "5 mL" },
        { label: "Dose available", value: "200 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("25 kg"), f("100 mg/day", "1 kg")],
        result: "2,500 mg/day",
        why: whyWeight("25 kg", "100 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("2,500 mg/day"), f("1 day", "2 doses")],
        result: "1,250 mg/dose",
        why: whyDivide("two doses"),
      },
      {
        label: "Volume",
        chain: [v("1,250 mg"), f("5 mL", "200 mg")],
        result: "31.25 mL",
        why: whyVolume("200 mg per 5 mL", "mg"),
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
      lookups: [
        { label: "Weight", value: "68 kg" },
        { label: "Ordered dose", value: "18 units/kg/hr" },
        { label: "Quantity available", value: "500 mL" },
        { label: "Dose available", value: "25,000 units" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour at the new dose",
        chain: [v("68 kg"), f("18 units/hr", "1 kg")],
        result: "1,224 units/hr",
        why: whyTitrate("18 units/kg/hr", "15 units/kg/hr", "68 kg"),
      },
      {
        label: "Infusion rate",
        chain: [v("1,224 units/hr"), f("500 mL", "25,000 units")],
        result: "24.48 mL/hr",
        why: whyUnitsBag("25,000 units in 500 mL"),
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
      lookups: [
        { label: "Weight", value: "85 kg" },
        { label: "Ordered dose", value: "20 mg/kg" },
        { label: "Quantity available", value: "200 mL" },
        { label: "Dose available", value: "1 g" },
      ],
      convert: "Yes → mg to g",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("85 kg"), f("20 mg", "1 kg")],
        result: "1,700 mg",
        why: whyWeight("85 kg", "20 mg/kg", "the mg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("1,700 mg"), f("1 g", "1,000 mg"), f("200 mL", "1 g")],
        result: "340 mL",
        why: whyMgToGramVolume("200 mL per 1 g"),
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
      lookups: [
        { label: "Desired dose", value: "5 g" },
        { label: "Quantity available", value: "1,000 mL" },
        { label: "Dose available", value: "40 g" },
        { label: "Time ordered", value: "15 min" },
      ],
      convert: "Yes → min to hr",
    },
    steps: [
      {
        label: "Volume of the dose",
        chain: [v("5 g"), f("1,000 mL", "40 g")],
        result: "125 mL",
        why: whyBagVolume("5 g", "40 g in 1,000 mL"),
      },
      {
        label: "Infusion rate",
        chain: [f("125 mL", "15 min"), f("60 min", "1 hr")],
        result: "500 mL/hr",
        why: whyTimedRate("125 mL", "15 min"),
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
      lookups: [
        { label: "Weight", value: "18 kg" },
        { label: "Rule", value: "4-2-1" },
        { label: "Deficit", value: "120 mL over 6 hr" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "First 10 kg",
        chain: [v("10 kg"), f("4 mL/hr", "1 kg")],
        result: "40 mL/hr",
        why: why421First,
      },
      {
        label: "Next 8 kg",
        chain: [v("8 kg"), f("2 mL/hr", "1 kg")],
        result: "16 mL/hr",
        why: why421Second("8 kg"),
      },
      {
        label: "Maintenance",
        chain: [v("40 + 16 mL/hr")],
        result: "56 mL/hr",
        why: why421Sum,
      },
      {
        label: "Deficit replacement",
        chain: [f("120 mL", "6 hr")],
        result: "20 mL/hr",
        why: whyDeficit("120 mL", "6 hours"),
      },
      {
        label: "Total",
        chain: [v("56 + 20 mL/hr")],
        result: "76 mL/hr",
        why: whyTotalRate,
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
      lookups: [
        { label: "Weight", value: "60 kg" },
        { label: "Ordered dose", value: "0.15 units/kg/hr" },
        { label: "Quantity available", value: "100 mL" },
        { label: "Dose available", value: "100 units" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Units per hour",
        chain: [v("60 kg"), f("0.15 units/hr", "1 kg")],
        result: "9 units/hr",
        why: whyWeight("60 kg", "0.15 units/kg/hr", "units per hour"),
      },
      {
        label: "Infusion rate",
        chain: [v("9 units/hr"), f("100 mL", "100 units")],
        result: "9 mL/hr",
        why: whyUnitsBag("100 units in 100 mL"),
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
      lookups: [
        { label: "Weight", value: "90 kg" },
        { label: "Ordered dose", value: "0.08 mcg/kg/min" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "4 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("90 kg"), f("0.08 mcg/min", "1 kg")],
        result: "7.2 mcg/min",
        why: whyWeight("90 kg", "0.08 mcg/kg/min", "mcg per minute"),
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
        why: whyDrip("250 mL per 4 mg"),
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
      lookups: [
        { label: "Weight", value: "75 kg" },
        { label: "Ordered dose", value: "65 mcg/kg/min" },
        { label: "Quantity available", value: "100 mL" },
        { label: "Dose available", value: "1,000 mg" },
      ],
      convert: "Yes → mcg to mg, and min to hr",
    },
    steps: [
      {
        label: "mcg per minute",
        chain: [v("75 kg"), f("65 mcg/min", "1 kg")],
        result: "4,875 mcg/min",
        why: whyWeight("75 kg", "65 mcg/kg/min", "mcg per minute"),
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
        why: whyDrip("100 mL per 1,000 mg"),
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
      lookups: [
        { label: "Weight", value: "16 kg" },
        { label: "Ordered dose", value: "90 mg/kg/day" },
        { label: "Doses per day", value: "3" },
        { label: "Quantity available", value: "5 mL" },
        { label: "Dose available", value: "400 mg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Daily dose",
        chain: [v("16 kg"), f("90 mg/day", "1 kg")],
        result: "1,440 mg/day",
        why: whyWeight("16 kg", "90 mg/kg/day", "mg per day"),
      },
      {
        label: "Per dose",
        chain: [v("1,440 mg/day"), f("1 day", "3 doses")],
        result: "480 mg/dose",
        why: whyDivide("three doses"),
      },
      {
        label: "Volume",
        chain: [v("480 mg"), f("5 mL", "400 mg")],
        result: "6 mL",
        why: whyVolume("400 mg per 5 mL", "mg"),
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
      lookups: [
        { label: "Desired dose", value: "0.03 units/min" },
        { label: "Quantity available", value: "500 mL" },
        { label: "Dose available", value: "20 units" },
      ],
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
        why: whyUnitDrip("0.03 units/min", "500 mL per 20 units"),
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
      lookups: [
        { label: "Weight", value: "75 kg" },
        { label: "Ordered dose", value: "10 mcg/kg" },
        { label: "Quantity available", value: "1 mL" },
        { label: "Dose available", value: "0.25 mg" },
      ],
      convert: "Yes → mcg to mg",
    },
    steps: [
      {
        label: "Dose",
        chain: [v("75 kg"), f("10 mcg", "1 kg")],
        result: "750 mcg",
        why: whyWeight("75 kg", "10 mcg/kg", "the mcg in this dose"),
      },
      {
        label: "Volume",
        chain: [v("750 mcg"), f("1 mg", "1,000 mcg"), f("1 mL", "0.25 mg")],
        result: "3 mL",
        why: whyMcgToVolume("0.25 mg/mL"),
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
      lookups: [
        { label: "Weight", value: "10 kg" },
        { label: "Bolus ordered", value: "20 mL/kg over 1 hr" },
        { label: "Maintenance rule", value: "4-2-1" },
        { label: "Window asked about", value: "4 hr" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "Bolus",
        chain: [v("10 kg"), f("20 mL", "1 kg")],
        result: "200 mL",
        why: whyBolus("10 kg", "20 mL/kg"),
      },
      {
        label: "Maintenance rate (4-2-1)",
        chain: [v("10 kg"), f("4 mL/hr", "1 kg")],
        result: "40 mL/hr",
        why: "10 kg sits entirely inside the first band, so every kg earns 4 mL/hr; there's no second or third tier to add on.",
      },
      {
        label: "Maintenance time",
        chain: [v("4 hr − 1 hr")],
        result: "3 hr",
        why: whyMaintWindow("1-hour", "4-hour"),
      },
      {
        label: "Maintenance volume",
        chain: [v("3 hr"), f("40 mL", "1 hr")],
        result: "120 mL",
        why: whyMaintVolume,
      },
      {
        label: "Total",
        chain: [v("200 + 120 mL")],
        result: "320 mL",
        why: whyBolusTotal,
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
      lookups: [
        { label: "Weight", value: "72 kg" },
        { label: "Ordered dose", value: "4 mcg/kg/hr" },
        { label: "Quantity available", value: "250 mL" },
        { label: "Dose available", value: "2,500 mcg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "mcg per hour",
        chain: [v("72 kg"), f("4 mcg/hr", "1 kg")],
        result: "288 mcg/hr",
        why: whyWeightHourly("72 kg", "4 mcg/kg/hr"),
      },
      {
        label: "Infusion rate",
        chain: [v("288 mcg/hr"), f("250 mL", "2,500 mcg")],
        result: "28.8 mL/hr",
        why: whyMcgBag("250 mL per 2,500 mcg"),
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
      lookups: [
        { label: "Weight", value: "68 kg" },
        { label: "Ordered dose", value: "0.7 mcg/kg/hr" },
        { label: "Quantity available", value: "50 mL" },
        { label: "Dose available", value: "200 mcg" },
      ],
      convert: "No",
    },
    steps: [
      {
        label: "mcg per hour",
        chain: [v("68 kg"), f("0.7 mcg/hr", "1 kg")],
        result: "47.6 mcg/hr",
        why: whyWeightHourly("68 kg", "0.7 mcg/kg/hr"),
      },
      {
        label: "Infusion rate",
        chain: [v("47.6 mcg/hr"), f("50 mL", "200 mcg")],
        result: "11.9 mL/hr",
        why: whyMcgBag("50 mL per 200 mcg"),
      },
    ],
  },
];
