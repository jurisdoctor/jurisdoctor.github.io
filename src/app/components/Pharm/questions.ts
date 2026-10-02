import { QuestionType } from "../Nclex/Questions";

export const MODULE1_QUESTIONS: QuestionType[] = [
  {
    id: "pharm1-cj1",
    ordinal: 1,
    stem:
      "A client with chronic kidney disease (creatinine 2.8 mg/dL, baseline 0.9) has a new order for a medication that is cleared primarily by the kidneys. What should the nurse do first?",
    options: [
      {
        id: "a",
        text: "Give the medication as ordered; the dose was already calculated by the provider.",
        correct: false,
        rationale: "The provider may not have the most recent renal labs — the nurse is the last safety check before the drug reaches the client.",
      },
      {
        id: "b",
        text: "Hold the dose and notify the provider that the creatinine is elevated before giving the medication.",
        correct: true,
        rationale: "A high creatinine means the kidneys are struggling to clear the drug, so it can build up to toxic levels. Recognize the cue, analyze it against excretion, and clarify before giving.",
      },
      {
        id: "c",
        text: "Give half the ordered dose without contacting the provider.",
        correct: false,
        rationale: "Adjusting a dose independently is outside the nurse's scope — the provider must reassess and reorder.",
      },
      {
        id: "d",
        text: "Document the creatinine level and give the medication at the next scheduled time.",
        correct: false,
        rationale: "Documenting without acting on an abnormal, drug-relevant lab misses the chance to prevent toxicity.",
      },
    ],
    answer: "b",
    takeaway:
      "Weak kidneys mean a renally-cleared drug stays longer and can become toxic — check creatinine before giving, and hold and notify if it's elevated.",
  },
  {
    id: "pharm1-cj2",
    ordinal: 2,
    stem:
      "A client with liver disease and a low albumin level (2.1 g/dL) is prescribed a highly protein-bound medication. The nurse understands this client is at increased risk for which outcome?",
    options: [
      {
        id: "a",
        text: "Faster absorption of the drug from the GI tract.",
        correct: false,
        rationale: "Albumin affects distribution, not absorption.",
      },
      {
        id: "b",
        text: "No change in drug effect, since protein binding only matters for IV drugs.",
        correct: false,
        rationale: "Protein binding affects any route once the drug reaches the bloodstream.",
      },
      {
        id: "c",
        text: "Decreased drug effect because less drug reaches the bloodstream.",
        correct: false,
        rationale: "Low albumin increases, not decreases, the amount of active drug in circulation.",
      },
      {
        id: "d",
        text: "Increased free drug in the blood, raising the risk of an exaggerated or toxic effect.",
        correct: true,
        rationale: "Only unbound (free) drug is active. With less albumin to bind it, more drug circulates free and active, raising toxicity risk even at a normal dose.",
      },
    ],
    answer: "d",
    takeaway:
      "Low albumin means less protein to bind the drug, so more free, active drug circulates — watch closely for exaggerated effects in clients with liver disease or malnutrition.",
  },
  {
    id: "pharm1-cj3",
    ordinal: 3,
    stem:
      "A client is due for a scheduled dose of IV vancomycin, and a trough level was ordered. What is the nurse's priority action?",
    options: [
      {
        id: "a",
        text: "Make sure the trough level is drawn right before the dose, then give the medication.",
        correct: true,
        rationale: "A trough is drawn immediately before the next dose to show whether the drug is clearing adequately. Timing it correctly lets the provider catch toxicity risk before it happens.",
      },
      {
        id: "b",
        text: "Skip the dose entirely since a level was ordered.",
        correct: false,
        rationale: "A trough order doesn't mean hold the dose — it means time the lab draw around the dose.",
      },
      {
        id: "c",
        text: "Draw the trough level at any convenient time during the shift.",
        correct: false,
        rationale: "Timing matters — a trough drawn at the wrong time gives a misleading result and can mask toxicity.",
      },
      {
        id: "d",
        text: "Give the vancomycin dose first, then draw the trough level immediately after.",
        correct: false,
        rationale: "A trough drawn after the dose no longer reflects the lowest point before the next dose — it will be falsely elevated.",
      },
    ],
    answer: "a",
    takeaway:
      "For narrow-therapeutic-range drugs like vancomycin, draw the trough right before the next dose — correct timing is what makes the level meaningful.",
  },
];

export const MODULE2_QUESTIONS: QuestionType[] = [
  {
    id: "pharm2-cj1",
    ordinal: 1,
    stem:
      "Minutes after an IV antibiotic is started, a client reports a feeling of impending doom and develops hives, lip swelling, and wheezing. What should the nurse do first?",
    options: [
      {
        id: "a",
        text: "Stop the infusion immediately and call for help while keeping the IV line open.",
        correct: true,
        rationale: "These are signs of anaphylaxis. The first actions are to stop the causative drug and get help on the way — keeping the line open preserves access for emergency treatment.",
      },
      {
        id: "b",
        text: "Slow the infusion rate and reassess in 15 minutes.",
        correct: false,
        rationale: "Anaphylaxis can progress to airway closure within minutes — slowing the drug still delivers more allergen and wastes critical time.",
      },
      {
        id: "c",
        text: "Administer an oral antihistamine and continue the infusion.",
        correct: false,
        rationale: "Antihistamines alone do not treat anaphylaxis, and continuing the drug worsens the reaction. Epinephrine is first-line.",
      },
      {
        id: "d",
        text: "Discontinue the IV line completely before doing anything else.",
        correct: false,
        rationale: "Removing all access delays emergency treatment — stop the drug but preserve the line for epinephrine or fluids.",
      },
    ],
    answer: "a",
    takeaway:
      "Anaphylaxis response: stop the drug, call for help, keep the IV open, support the airway, and give epinephrine per protocol — don't wait and see.",
  },
  {
    id: "pharm2-cj2",
    ordinal: 2,
    stem:
      "A nurse is preparing an IV insulin infusion for a client in diabetic ketoacidosis. What is the priority safety action before starting the infusion?",
    options: [
      {
        id: "a",
        text: "Ask a colleague to glance at the bag label from across the room.",
        correct: false,
        rationale: "An independent double check requires the second nurse to verify independently against the order, not a quick visual confirmation.",
      },
      {
        id: "b",
        text: "Proceed once the barcode scanner accepts the medication.",
        correct: false,
        rationale: "The scanner is a tool, not a replacement for the required independent double check on a high-alert drug.",
      },
      {
        id: "c",
        text: "Have a second nurse independently verify the drug, concentration, dose, and pump settings.",
        correct: true,
        rationale: "Insulin is a high-alert medication (part of 'I Hate Other Pain'). An independent double check by a second nurse, done without prompting from the first, catches errors before they reach the client.",
      },
      {
        id: "d",
        text: "Document the glucose level and start the infusion without further verification.",
        correct: false,
        rationale: "Skipping the independent double check on a high-alert medication like insulin removes a critical safety layer.",
      },
    ],
    answer: "c",
    takeaway:
      "High-alert medications like insulin require an independent double check by a second nurse — a glance or a scanner pass isn't a substitute.",
  },
  {
    id: "pharm2-cj3",
    ordinal: 3,
    stem:
      "While scanning a medication at the bedside, the barcode scanner alerts that the medication does not match the order. What should the nurse do?",
    options: [
      {
        id: "a",
        text: "Override the alert since the medication looks correct and the client is waiting.",
        correct: false,
        rationale: "Overriding a mismatch alert without investigating defeats the purpose of the safeguard and risks giving the wrong drug.",
      },
      {
        id: "b",
        text: "Stop, do not give the medication, and investigate the source of the mismatch before proceeding.",
        correct: true,
        rationale: "A scanner alert means stop and find out why — it may reveal a wrong drug, wrong dose, or wrong patient before an error reaches the client.",
      },
      {
        id: "c",
        text: "Give the medication now and report the scanner malfunction afterward.",
        correct: false,
        rationale: "Giving the medication before resolving a mismatch risks a preventable error; investigate first.",
      },
      {
        id: "d",
        text: "Switch to manual charting and skip scanning for the rest of the shift.",
        correct: false,
        rationale: "Abandoning the safeguard doesn't resolve the specific mismatch and removes protection for every other medication that shift.",
      },
    ],
    answer: "b",
    takeaway:
      "A barcode scanner mismatch is a stop sign, not a suggestion — investigate before giving, every time.",
  },
];

export const MODULE3_QUESTIONS: QuestionType[] = [
  {
    id: "pharm3-cj1",
    ordinal: 1,
    stem:
      "Before administering digoxin, the nurse assesses an apical pulse of 52 beats/min for a full minute. What should the nurse do?",
    options: [
      {
        id: "a",
        text: "Give the digoxin as scheduled since the client has no symptoms.",
        correct: false,
        rationale: "A heart rate under 60 in an adult is a hold parameter for digoxin regardless of symptoms — giving it could worsen bradycardia or cause toxicity.",
      },
      {
        id: "b",
        text: "Give the digoxin and recheck the heart rate in four hours.",
        correct: false,
        rationale: "Giving a drug that slows the heart further when the rate is already below the safe threshold risks dangerous bradycardia.",
      },
      {
        id: "c",
        text: "Give half the ordered dose to reduce the risk.",
        correct: false,
        rationale: "Adjusting the dose independently is outside the nurse's scope — hold and contact the provider instead.",
      },
      {
        id: "d",
        text: "Hold the dose, notify the provider, and document the apical pulse and the action taken.",
        correct: true,
        rationale: "An apical pulse under 60 is a hold parameter for digoxin. Recognize the cue, analyze against the parameter, hold, and notify — this is the safe clinical judgment path.",
      },
    ],
    answer: "d",
    takeaway:
      "Always check the apical pulse for a full minute before giving digoxin — hold and notify if it's under 60 in an adult.",
  },
  {
    id: "pharm3-cj2",
    ordinal: 2,
    stem:
      "A client is due for a scheduled dose of furosemide. The morning labs show a potassium level of 3.1 mEq/L. What is the nurse's best action?",
    options: [
      {
        id: "a",
        text: "Hold the furosemide, notify the provider of the low potassium, and document.",
        correct: true,
        rationale: "A potassium under 3.5 is a hold parameter for loop diuretics. The nurse recognizes the cue, analyzes the risk of worsening hypokalemia, and holds while notifying the provider.",
      },
      {
        id: "b",
        text: "Give the furosemide and encourage the client to eat a banana afterward.",
        correct: false,
        rationale: "Dietary potassium does not substitute for addressing a lab value that already signals it's unsafe to give the drug now.",
      },
      {
        id: "c",
        text: "Double the next dose of furosemide to compensate.",
        correct: false,
        rationale: "Adjusting the dose independently is outside the nurse's scope and would worsen the potassium loss.",
      },
      {
        id: "d",
        text: "Give the furosemide as scheduled; potassium is unrelated to this medication.",
        correct: false,
        rationale: "Loop diuretics like furosemide cause potassium loss — giving it with a potassium of 3.1 (below normal) risks worsening hypokalemia.",
      },
    ],
    answer: "a",
    takeaway:
      "Loop diuretics lower potassium — check the level before giving, and hold and notify if it's under 3.5 mEq/L.",
  },
  {
    id: "pharm3-cj3",
    ordinal: 3,
    stem:
      "Thirty minutes after receiving IV morphine, a client has a respiratory rate of 10/min and is difficult to arouse. What should the nurse do first?",
    options: [
      {
        id: "a",
        text: "Document the findings and recheck in one hour.",
        correct: false,
        rationale: "A respiratory rate of 10 with reduced arousal after an opioid is a sign of respiratory depression that needs immediate action, not delayed rechecking.",
      },
      {
        id: "b",
        text: "Give the next scheduled dose of morphine since the client is still in pain.",
        correct: false,
        rationale: "Giving more opioid to a client with respiratory depression and sedation would worsen a dangerous adverse effect.",
      },
      {
        id: "c",
        text: "Stimulate the client, support the airway, apply oxygen, and have naloxone ready per protocol.",
        correct: true,
        rationale: "Opioid-induced respiratory depression is an adverse effect requiring immediate action: stimulate and assess airway and oxygenation, and prepare naloxone, the reversal agent, in case it's needed.",
      },
      {
        id: "d",
        text: "Lower the head of the bed and let the client sleep off the sedation.",
        correct: false,
        rationale: "Lying flat can worsen airway compromise in a sedated, hypoventilating client — the priority is stimulation, airway support, and oxygen.",
      },
    ],
    answer: "c",
    takeaway:
      "After opioids, a low respiratory rate with heavy sedation is an emergency — stimulate, support the airway, give oxygen, and have naloxone ready.",
  },
];
