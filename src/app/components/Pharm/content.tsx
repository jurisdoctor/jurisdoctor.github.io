import { ReactNode } from "react";
import {
  CjmmFlow,
  Objectives,
  PatientChart,
  RoadTrip,
  TherapeuticWindow,
  ThreeChecks,
} from "./Diagrams";
import { MODULE1_QUESTIONS, MODULE2_QUESTIONS, MODULE3_QUESTIONS } from "./questions";
import { Block, Step } from "./types";

const DECIDE = ["✅ Give", "✋ Hold + notify", "❓ Clarify the order"];

const PHARM_2E_URL = "https://wtcs.pressbooks.pub/pharmacology2e/";
const NURSING_SKILLS_2E_URL = "https://wtcs.pressbooks.pub/nursingskills/";

const ExternalLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="underline decoration-[var(--chip-blue-border)] underline-offset-2 hover:text-[var(--chip-blue-border)]"
  >
    {children}
  </a>
);

export const REFERENCES: ReactNode[] = [
  <>
    Open Resources for Nursing (Open RN). (2023).{" "}
    <ExternalLink href={PHARM_2E_URL}>Nursing Pharmacology 2e</ExternalLink>,
    Chapter 1: Pharmacokinetics and Pharmacodynamics. WisTech Open. CC BY
    4.0.
  </>,
  <>
    Open Resources for Nursing (Open RN). (2023).{" "}
    <ExternalLink href={PHARM_2E_URL}>Nursing Pharmacology 2e</ExternalLink>,
    2.3 Legal Foundations and National Guidelines for Safe Medication
    Administration. WisTech Open. CC BY 4.0.
  </>,
  <>
    Open Resources for Nursing (Open RN). (2023).{" "}
    <ExternalLink href={NURSING_SKILLS_2E_URL}>
      Nursing Skills 2e
    </ExternalLink>
    , 15.3 Assessments Related to Medication Administration. WisTech Open.
    CC BY 4.0.
  </>,
];

export const STEPS: Step[] = [
  {
    id: "welcome",
    section: "Start",
    title: "Welcome",
    icon: "👋",
    meta: "Pharmacology Crash Course 1 · ~5 min",
    blocks: [
      {
        type: "callout",
        tone: "idea",
        title: "Core message",
        text: "You don't need to memorize every drug. You need the same safety routine — check, think, act, recheck — for every med, every time.",
      },
      { type: "heading", text: "What you'll be able to do" },
      {
        type: "node",
        node: (
          <Objectives
            items={[
              ["🔄", "Explain a drug's trip through the body and who is at higher risk."],
              ["✅", "Use the rights and the 3 checks at every med pass."],
              ["🚨", "Spot high-alert meds, allergies, controlled substances, and black box warnings."],
              ["🩺", "Decide to give, hold, or clarify using assessment before and after."],
            ]}
          />
        ),
      },
      {
        type: "table",
        headers: ["Part", "Time", "What you do"],
        rows: [
          ["Module 1: How drugs work", "20 min", "Read, self-check"],
          ["Module 2: Safe administration", "30 min", "Read, error-spotting"],
          ["Module 3: Assess before and after", "10 min", "Give-or-hold practice"],
          ["Readiness quiz", "10 min", "7 questions, due before class"],
        ],
      },
      {
        type: "callout",
        tone: "reference",
        title: "Reference",
        text: (
          <>
            Aligned with Open RN,{" "}
            <ExternalLink href={PHARM_2E_URL}>
              Nursing Pharmacology 2e
            </ExternalLink>{" "}
            (WisTech Open, 2023, CC BY 4.0). Use it for deeper reading. Full
            list at the end.
          </>
        ),
      },
      {
        type: "callout",
        tone: "tip",
        title: "How this course works",
        text: "Each lesson has activities. Finish them to unlock the next lesson. Your progress saves automatically on this device, so you can close the tab and pick up where you left off.",
      },
      { type: "name" },
    ],
  },
  {
    id: "top10",
    section: "Start",
    title: "Top 10 takeaways",
    icon: "⭐",
    meta: "Print this, pocket it, use it at every med pass.",
    blocks: [
      { type: "p", text: "Tap each card to flip it. Flip all 10 to continue." },
      {
        type: "flip",
        id: "top10",
        items: [
          { emoji: "🪪", title: "Two identifiers", back: "Two identifiers, every time: name + date of birth, armband to MAR." },
          { emoji: "🔁", title: "Three checks", back: "Three checks: pull → prepare → bedside." },
          { emoji: "🫘", title: "Liver & kidneys", back: "Weak liver or kidneys = drug builds up → watch for toxicity." },
          { emoji: "🩺", title: "Check before you give", back: "Know the check before you give: HR and BP, RR and sedation, glucose, labs." },
          { emoji: "✋", title: "When in doubt", back: "When in doubt, hold and clarify. Asking is safe; guessing is not." },
          { emoji: "⚠️", title: "High-alert meds", back: '"I Hate Other Pain" = Insulin, Heparin, Opioids, Potassium.' },
          { emoji: "🤧", title: "Allergies", back: 'Ask "What happened?" Anaphylaxis → stop the drug, call for help, epinephrine.' },
          { emoji: "🔒", title: "Controlled substances", back: "Lock, count, witness every waste." },
          { emoji: "⬛", title: "Black box", back: "Black box = the drug's biggest risk. Watch for it and teach it." },
          { emoji: "📲", title: "Scanner alerts", back: "Scanner alert = STOP. Find out why. Chart after giving, never before." },
        ],
      },
    ],
  },
  {
    id: "m1-roadtrip",
    section: "Module 1 · How Drugs Work",
    title: "The drug's road trip (ADME)",
    icon: "🚗",
    meta: "Module 1 · 20 min",
    blocks: [
      {
        type: "callout",
        tone: "idea",
        title: "Big idea",
        text: "Every drug takes the same 4-stop trip. If a stop is broken, the drug stays longer → stronger → possibly toxic.",
      },
      { type: "node", node: <RoadTrip /> },
      {
        type: "p",
        text: "Pharmacokinetics (PK) is what the body does to the drug.",
      },
      {
        type: "table",
        headers: ["Stop", "Plain words", "Nurse watches"],
        rows: [
          ["1. Absorption (getting in)", "Drug enters the blood", "Can they swallow? Vomiting? Food timing? Never crush ER (extended-release) pills"],
          ["2. Distribution (getting around)", "Blood carries it to tissues", "Albumin (protein that holds drug; low = more active drug), dehydration"],
          ["3. Metabolism (breaking down)", "Liver breaks it down", "AST/ALT (liver damage labs), yellow skin (jaundice)"],
          ["4. Excretion (getting out)", "Kidneys remove it", "Creatinine (kidney lab; high = kidneys struggling), urine output at least 30 mL/hr"],
        ],
      },
      {
        type: "callout",
        tone: "critical",
        title: "Critical",
        text: "Weak liver or kidneys = drug stays longer = stronger = toxic. Check liver and kidney labs before you give.",
      },
      {
        type: "sort",
        id: "adme-sort",
        q: "Which stop on the trip is affected? Pick one for each finding.",
        buckets: ["Absorption", "Distribution", "Metabolism", "Excretion"],
        items: [
          { text: "AST and ALT are high; skin looks yellow", answer: 2, explain: "The liver, the breakdown crew, is struggling." },
          { text: "Someone crushed an extended-release tablet", answer: 0, explain: "The whole dose is absorbed at once, which can cause an overdose." },
          { text: "Albumin is low from malnutrition", answer: 1, explain: 'Less protein to "park" the drug, so more free drug circulates.' },
          { text: "Creatinine is rising; urine output 15 mL/hr", answer: 3, explain: "The kidneys can't clear the drug, so it builds up." },
          { text: "Severe dehydration", answer: 1, explain: "Less blood flow carries less drug to the tissues." },
          { text: "Patient vomited 10 minutes after swallowing her pills", answer: 0, explain: "The drug never got in." },
        ],
      },
    ],
  },
  {
    id: "m1-zoom",
    section: "Module 1 · How Drugs Work",
    title: "Zoom in on each stop",
    icon: "🔬",
    meta: "Module 1",
    blocks: [
      { type: "heading", text: "Absorption: the route changes how much and how fast" },
      {
        type: "p",
        text: "Bioavailability is how much of the dose actually reaches the blood. The first-pass effect means swallowed drugs pass through the liver first, which breaks some down before it reaches the body.",
      },
      {
        type: "table",
        headers: ["Route", "Speed and amount", "Nurse tip"],
        rows: [
          ["IV", "Fastest; 100% reaches the blood", "Sterile technique; check IV compatibility; infection risk"],
          ["Oral (PO)", "Slowest; less reaches the blood (first-pass)", "Food, stomach acid, other drugs, enteric coating and ER forms change absorption. Can they swallow?"],
          ["Subcut / IM", "Medium", "Rotate sites; watch for bruising, redness, swelling"],
          ["Inhaled", "Fast, straight to the lungs", "Works only with good technique: teach and watch them use it"],
          ["Topical / patch", "Slow and steady; skips first-pass", "Remove the old patch; rotate sites; heat speeds absorption"],
        ],
      },
      {
        type: "mcq",
        id: "route-mcq",
        q: "Why does the same drug often need a higher dose by mouth than by IV?",
        options: [
          "Oral drugs are absorbed faster",
          "The first-pass effect: the liver breaks down part of an oral dose first",
          "IV drugs are excreted faster",
          "Stomach acid makes oral drugs stronger",
        ],
        answer: 1,
        explain: "Bioavailability is lower by mouth. IV delivers 100% to the blood.",
      },
      { type: "heading", text: "Distribution: getting to the right place" },
      {
        type: "table",
        headers: ["Factor", "What it means", "Nursing example"],
        rows: [
          ["Blood flow", "Drug goes where blood goes", "Dehydration, blocked vessels, or heart failure = less drug reaches the target"],
          ['Protein binding', 'Drug "parked" on albumin = inactive; only free drug works', "Low albumin = more free drug = stronger effect"],
          ["Blood-brain barrier", "Tight wall protecting the brain", "Some drugs need a carrier to get in"],
          ["Placental barrier", "Some drugs reach the baby", "Always ask about pregnancy before giving meds"],
        ],
      },
      {
        type: "mcq",
        id: "albumin-mcq",
        q: "An older adult with low albumin gets a drug that binds heavily to protein. What do you expect?",
        options: ["A weaker effect", "A stronger effect: more free (active) drug", "No change", "The drug can't reach the blood"],
        answer: 1,
        explain: 'Less albumin means less "parking," so more drug is free and active. Watch for toxicity.',
      },
      { type: "heading", text: "Metabolism: the liver's breakdown crew" },
      {
        type: "p",
        text: "CYP450 enzymes, the liver's main drug-breaking enzymes, have limited capacity.",
      },
      {
        type: "list",
        items: [
          "Competition: two drugs using the same enzymes can slow each other's breakdown, so levels build up.",
          "Enzyme induction: some drugs speed up the enzymes, so other drugs break down faster and work less well.",
          "Alcohol stacks with sedatives and opioids and changes how the liver clears them — this combination can be deadly.",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Tip",
        text: "Always ask about alcohol, herbals, and other meds. They change how fast drugs are broken down.",
      },
      { type: "heading", text: "Excretion: getting out" },
      {
        type: "p",
        text: "Mostly through the kidneys (urine), also bile and stool, lungs, and sweat. Weak kidneys = drug stays longer — watch creatinine and urine output.",
      },
    ],
  },
  {
    id: "m1-timing",
    section: "Module 1 · How Drugs Work",
    title: "What the drug does + timing",
    icon: "⏱️",
    meta: "Module 1",
    blocks: [
      {
        type: "p",
        text: "Pharmacodynamics (PD) is what the drug does to the body. The mechanism of action is how it works, and affinity is how strongly a drug grabs its receptor.",
      },
      {
        type: "table",
        headers: ["Term", "Meaning", "Example"],
        rows: [
          ["Therapeutic effect", "The reason we give it", "Morphine relieves pain"],
          ["Side effect", "Expected, usually mild", "Morphine: constipation, drowsiness"],
          ["Adverse effect", "Harmful, unintended", "Morphine: RR 8, hard to wake"],
          ["Narrow therapeutic range", 'Tiny gap between "works" and "toxic"', "Digoxin, warfarin, lithium, vancomycin, phenytoin"],
        ],
      },
      {
        type: "sort",
        id: "pd-sort",
        q: "Your patient got morphine. Sort each finding.",
        buckets: ["Therapeutic", "Side effect", "Adverse effect"],
        items: [
          { text: "RR 8, hard to wake", answer: 2, explain: "Respiratory depression is harmful. Act now." },
          { text: "No bowel movement for 2 days", answer: 1, explain: "Constipation is expected. Plan a bowel regimen." },
          { text: "Pain goes from 7/10 to 2/10", answer: 0, explain: "This is the reason we gave it." },
          { text: "Mild drowsiness", answer: 1, explain: "Expected and usually mild. Keep watching." },
        ],
      },
      { type: "heading", text: "Onset, peak, duration, half-life" },
      {
        type: "table",
        headers: ["Term", "Meaning", "Nursing use"],
        rows: [
          ["Onset", "When the drug starts working", "Tells you when relief should begin"],
          ["Peak", "Highest drug level = strongest effect", "Reassess at the peak and watch for adverse effects"],
          ["Duration", "How long it works", "Plan the next dose"],
          ["Half-life", "Time for half the drug to leave the body", "Liver or kidney disease can lengthen it"],
          ["Steady state", "Amount in = amount out", "Reached after about 4 to 5 half-lives"],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Tip",
        text: "Time the dose to the patient's day — give pain medicine so it peaks during physical therapy, not after it.",
      },
      {
        type: "mcq",
        id: "peak-mcq",
        q: "When is the best time to reassess pain and watch for adverse effects?",
        options: ["Right after giving it", "At the drug's peak", "At the end of its duration", "At the next shift"],
        answer: 1,
        explain: "The peak is the strongest effect, so it's the time to check both benefit and harm.",
      },
      {
        type: "mcq",
        id: "ss-mcq",
        q: "About how long until a drug reaches steady state?",
        options: ["1 half-life", "2 half-lives", "4 to 5 half-lives", "10 half-lives"],
        answer: 2,
        explain: "This is why some drugs take days to reach full effect.",
      },
    ],
  },
  {
    id: "m1-window",
    section: "Module 1 · How Drugs Work",
    title: "The safe zone + who's at risk",
    icon: "🎯",
    meta: "Module 1",
    blocks: [
      {
        type: "p",
        text: "The therapeutic window is a drug level high enough to work and low enough to be safe. Drag the slider to move the drug level.",
      },
      { type: "node", node: <TherapeuticWindow /> },
      {
        type: "table",
        headers: ["Term", "Meaning", "Nursing use"],
        rows: [
          ["Therapeutic index", "Gap between the helpful dose and the toxic dose", "Small gap = narrow = risky: digoxin, warfarin, lithium, vancomycin, phenytoin"],
          ["Peak level", "Blood drawn when the drug is highest", "Shows if the dose is too strong"],
          ["Trough level", "Blood drawn right before the next dose", "Shows if the drug is clearing; a high trough signals toxicity risk"],
        ],
      },
      {
        type: "callout",
        tone: "critical",
        title: "Critical",
        text: "For drugs with ordered peak or trough levels (e.g., IV vancomycin), time the dose around the lab draw. Make sure the trough is drawn at the scheduled time, before you give the next dose.",
      },
      {
        type: "mcq",
        id: "trough-mcq",
        q: "A trough level is ordered. When should it be drawn?",
        options: ["At the drug's peak", "Right before the next dose", "Any time today", "1 hour after the dose"],
        answer: 1,
        explain: "The trough is the lowest level, just before the next dose.",
      },
      { type: "heading", text: "Who is at higher risk" },
      {
        type: "table",
        headers: ["Who", "Why"],
        rows: [
          ["Older adults", "Weaker liver and kidneys, less albumin, polypharmacy, falls"],
          ["Infants and children", "Immature liver and kidneys; weight-based doses"],
          ["Pregnant or breastfeeding", "Drug can cross the placenta or enter breast milk"],
          ["Kidney or liver disease", "Drug builds up; longer half-life"],
          ["Genetic differences", "Pharmacogenetics: same dose, different effect"],
        ],
      },
      {
        type: "callout",
        tone: "takeaway",
        title: "Takeaway",
        text: "Before any med, ask: can this patient's liver and kidneys clear it?",
      },
      {
        type: "mcq",
        id: "nti-mcq",
        q: "Which drug has a narrow therapeutic range?",
        options: ["Acetaminophen", "Docusate", "Digoxin", "Multivitamin"],
        answer: 2,
        explain: "Digoxin, warfarin, lithium, vancomycin, and phenytoin all need close monitoring.",
      },
    ],
  },
  {
    id: "m1-check",
    section: "Module 1 · How Drugs Work",
    title: "Module 1 knowledge check",
    icon: "✏️",
    meta: "3 CJMM-style questions · answer all 3 correctly to continue",
    blocks: [
      {
        type: "nclexQuiz",
        id: "m1-quiz",
        label: "Module 1 knowledge check",
        questions: MODULE1_QUESTIONS,
      },
    ],
  },
  {
    id: "m2-rights",
    section: "Module 2 · Safe Administration",
    title: "The rights + the 3 checks",
    icon: "✅",
    meta: "Module 2 · 30 min",
    blocks: [
      {
        type: "callout",
        tone: "idea",
        title: "Big idea",
        text: "Most med errors are process gaps — a skipped step — not knowledge gaps. The same checks, every time, keep patients safe.",
      },
      { type: "heading", text: "The rights: ask yourself before every med" },
      {
        type: "table",
        headers: ["Right", "Ask yourself"],
        rows: [
          ["Patient", "Name + date of birth match the armband and MAR? Also check allergies every time."],
          ["Drug", "Label matches the MAR exactly? Look-alike name?"],
          ["Dose", "Does it make sense for this patient?"],
          ["Route", "Can they safely take it this way?"],
          ["Time", "Due now? Last dose? If PRN, is it needed?"],
          ["Reason", "Why is this patient on it?"],
          ["Assessment", "Did I check the vitals or labs it needs?"],
          ["Response", "What will I recheck, and when?"],
          ["Refuse", "Did the patient get the info to decide?"],
          ["Documentation", "Charted after giving, never before?"],
        ],
      },
      { type: "heading", text: "The 3 checks" },
      { type: "node", node: <ThreeChecks /> },
      {
        type: "callout",
        tone: "critical",
        title: "Critical",
        text: "The barcode scanner helps you; it does not replace you. A scanner alert means STOP and find out why — never override without clarifying.",
      },
      {
        type: "order",
        id: "3checks",
        q: "Put the 3 checks in order. Tap each one in sequence.",
        items: ["Pull from the med system", "Prepare before opening", "Bedside with armband + scan"],
      },
      {
        type: "mcq",
        id: "chart-mcq",
        q: "When do you chart a medication?",
        options: ["Before giving it, so you don't forget", "After giving it", "At the end of the shift", "Whenever the scanner reminds you"],
        answer: 1,
        explain: "Always chart after giving, never before.",
      },
    ],
  },
  {
    id: "m2-ihop",
    section: "Module 2 · Safe Administration",
    title: 'High-alert meds: "I Hate Other Pain"',
    icon: "⚠️",
    meta: "Module 2",
    blocks: [
      {
        type: "p",
        text: "A high-alert medication isn't given wrong more often, but it causes more harm when it is. It usually needs an independent double check: a second nurse checks on their own.",
      },
      { type: "p", text: "Tap each letter to flip it." },
      {
        type: "flip",
        id: "ihop",
        items: [
          { emoji: "I", title: "Insulin", back: "Danger: hypoglycemia. Safeguard: check glucose, insulin type and concentration, vial open date; second-nurse check." },
          { emoji: "H", title: "Heparin & anticoagulants", back: "Danger: bleeding. Safeguard: check aPTT/INR and platelets; watch for bleeding." },
          { emoji: "O", title: "Opioids", back: "Danger: respiratory depression. Safeguard: RR, sedation, SpO2; naloxone ready." },
          { emoji: "P", title: "Potassium, concentrated IV", back: "Danger: deadly heart rhythms. Safeguard: never IV push; premixed bag on a pump." },
        ],
      },
      { type: "p", text: "Also high-alert: IV sedatives and chemotherapy, given in specialty or monitored settings." },
      {
        type: "sort",
        id: "ihop-sort",
        q: "Match each safeguard to its drug.",
        buckets: ["Insulin", "Heparin", "Opioids", "Potassium"],
        items: [
          { text: "Naloxone at the bedside", answer: 2, explain: "Naloxone reverses opioids." },
          { text: "Never IV push; premixed bag on a pump", answer: 3, explain: "Concentrated IV potassium can stop the heart." },
          { text: "Check aPTT/INR and platelets", answer: 1, explain: "Clotting labs guide anticoagulants." },
          { text: "Check glucose and the date the vial was opened", answer: 0, explain: "Low glucose plus insulin means hypoglycemia." },
        ],
      },
    ],
  },
  {
    id: "m2-allergy",
    section: "Module 2 · Safe Administration",
    title: "Allergies + anaphylaxis",
    icon: "🤧",
    meta: "Module 2",
    blocks: [
      {
        type: "table",
        headers: ["Type", "What it means", "Example"],
        rows: [
          ["Side effect", "Expected, not immune-related", "Nausea with codeine"],
          ["Intolerance", "Unpleasant, not immune-related", "Upset stomach with ibuprofen"],
          ["Allergy", "Immune system reaction; can worsen with each exposure", "Hives with penicillin"],
          ["Anaphylaxis", "Severe, fast, whole-body allergy — life-threatening", "Throat swelling minutes after an IV antibiotic"],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Tip",
        text: 'Ask "What happened when you took it?" Document the reaction, not just the drug.',
      },
      {
        type: "p",
        text: 'Warning signs of anaphylaxis: hives, swelling of lips, tongue, or throat, wheezing, hoarse voice, low BP, fast HR, "sense of doom." Often within minutes, especially with IV drugs.',
      },
      {
        type: "sort",
        id: "allergy-sort",
        q: "Classify each reaction.",
        buckets: ["Side effect / intolerance", "Allergy", "Anaphylaxis"],
        items: [
          { text: '"Codeine makes me nauseated"', answer: 0, explain: 'Not immune-related. Document "codeine: nausea."' },
          { text: "Throat swelling 5 min into an IV antibiotic", answer: 2, explain: "This is an emergency. Start the response now." },
          { text: "Hives after penicillin", answer: 1, explain: "An immune reaction that can worsen with each exposure." },
          { text: "Upset stomach with ibuprofen", answer: 0, explain: "Unpleasant, but not an allergy." },
          { text: 'Wheezing, low BP, "sense of doom"', answer: 2, explain: "Whole-body and life-threatening." },
        ],
      },
      {
        type: "callout",
        tone: "critical",
        title: "Critical: anaphylaxis response",
        text: "1) Stop the drug (keep the IV line open). 2) Call for help and stay. 3) Airway — sit up if breathing is hard, lie flat with legs up if BP is low; give oxygen. 4) Epinephrine IM in the outer thigh per order/protocol — it is first-line, antihistamines alone are not enough. 5) Monitor — reactions can return hours later. 6) Document and update the allergy band.",
      },
      {
        type: "order",
        id: "ana-order",
        q: "Put the anaphylaxis response in order.",
        items: ["STOP the drug", "CALL for help", "AIRWAY + oxygen", "EPINEPHRINE IM", "MONITOR", "DOCUMENT + allergy band"],
      },
    ],
  },
  {
    id: "m2-controlled",
    section: "Module 2 · Safe Administration",
    title: "Controlled substances + black box",
    icon: "🔒",
    meta: "Module 2",
    blocks: [
      {
        type: "p",
        text: "A DEA schedule is the legal category for abuse risk. A lower number means higher risk: C-I is highest, C-V is lowest.",
      },
      {
        type: "table",
        headers: ["Schedule", "Risk", "Examples"],
        rows: [
          ["C-I", "Highest; no accepted medical use", "Heroin, LSD"],
          ["C-II", "High; severe dependence", "Morphine, oxycodone, fentanyl, hydromorphone, amphetamine"],
          ["C-III", "Moderate", "Acetaminophen with codeine, ketamine, buprenorphine"],
          ["C-IV", "Lower", "Lorazepam, alprazolam, zolpidem, tramadol"],
          ["C-V", "Lowest", "Cough syrup with codeine, pregabalin"],
        ],
      },
      {
        type: "callout",
        tone: "critical",
        title: "Critical nurse rules",
        text: "Lock it. Count it. Witness every waste. Never sign for a waste you didn't see. Report diversion.",
      },
      {
        type: "sort",
        id: "sched-sort",
        q: "Sort each drug into its schedule.",
        buckets: ["C-II", "C-III", "C-IV", "C-V"],
        items: [
          { text: "Lorazepam", answer: 2 },
          { text: "Oxycodone", answer: 0 },
          { text: "Pregabalin", answer: 3 },
          { text: "Acetaminophen with codeine", answer: 1 },
          { text: "Zolpidem", answer: 2 },
          { text: "Fentanyl", answer: 0 },
        ],
      },
      { type: "heading", text: "Black box warnings" },
      {
        type: "p",
        text: "A black box warning is the FDA's strongest label warning for a serious or life-threatening risk.",
      },
      {
        type: "table",
        headers: ["Drug", "Boxed risk", "Watch for"],
        rows: [
          ["Opioids", "Addiction, breathing problems", "RR, sedation, SpO2"],
          ["Opioids + benzodiazepines", "Deep sedation, stopped breathing", "Avoid unless ordered; monitor closely"],
          ["Warfarin", "Major bleeding", "INR, bleeding signs"],
          ["Fluoroquinolones", "Tendon rupture, nerve damage", "Tendon pain, numbness, especially older adults"],
          ["Antidepressants", "Suicidal thoughts in children and young adults", "Mood changes, especially early on"],
        ],
      },
      {
        type: "callout",
        tone: "takeaway",
        title: "Takeaway",
        text: "Know it. Watch for it. Teach it.",
      },
      {
        type: "mcq",
        id: "bbw-mcq",
        q: "A 74-year-old starts levofloxacin. Which boxed risk do you teach?",
        options: ["Tendon rupture: report tendon pain right away", "Hair loss", "Yellow-tinted vision", "Weight gain"],
        answer: 0,
        explain: "Fluoroquinolones carry a boxed warning for tendon rupture and nerve damage, especially in older adults.",
      },
    ],
  },
  {
    id: "m2-errors",
    section: "Module 2 · Safe Administration",
    title: "Error-prevention habits",
    icon: "🧠",
    meta: "Module 2",
    blocks: [
      {
        type: "table",
        headers: ["Do", "Don't"],
        rows: [
          ["Read tall-man letters: hydrALAZINE vs hydrOXYzine", "Trust a quick glance"],
          ["Give only what you prepared", "Give a med someone else drew up"],
          ["Protect your focus during med pass", "Multitask while preparing meds"],
          ["Report errors and near misses", "Hide mistakes"],
        ],
      },
      {
        type: "callout",
        tone: "takeaway",
        title: "Takeaway",
        text: "Questioning an order is a safety skill, not a weakness.",
      },
      {
        type: "mcq",
        id: "tall-mcq",
        q: 'Why is "hydrALAZINE" printed with some capital letters?',
        options: ["It's a controlled substance", "Tall-man letters show the difference from look-alike names like hydrOXYzine", "It's a high-alert medication", "It's a brand name"],
        answer: 1,
        explain: "The capitals draw your eye to the letters that differ.",
      },
      {
        type: "mcq",
        id: "drawup-mcq",
        q: "A busy colleague drew up a med and asks you to give it. What do you do?",
        options: ["Give it; they're experienced", "Give only what you prepared: politely decline", "Give it, but chart their name", "Ask the patient if it looks right"],
        answer: 1,
        explain: "You can't verify what you didn't prepare.",
      },
    ],
  },
  {
    id: "m2-check",
    section: "Module 2 · Safe Administration",
    title: "Module 2 knowledge check",
    icon: "✏️",
    meta: "3 CJMM-style questions · answer all 3 correctly to continue",
    blocks: [
      {
        type: "nclexQuiz",
        id: "m2-quiz",
        label: "Module 2 knowledge check",
        questions: MODULE2_QUESTIONS,
      },
    ],
  },
  {
    id: "m3-decide",
    section: "Module 3 · Assess Before + After",
    title: "Give, hold, or clarify?",
    icon: "🧭",
    meta: "Module 3 · 10 min",
    blocks: [
      {
        type: "callout",
        tone: "idea",
        title: "Big idea",
        text: "Know what you check before you give, and what you watch after.",
      },
      {
        type: "p",
        text: "This follows the Clinical Judgment Measurement Model (CJMM): the NCLEX thinking steps.",
      },
      { type: "node", node: <CjmmFlow /> },
      { type: "heading", text: "What to check for common meds" },
      {
        type: "p",
        text: "Hold parameters are the limits in the order that tell you when NOT to give.",
      },
      {
        type: "table",
        headers: ["Drug", "Check before", "Hold and notify if", "Recheck after"],
        rows: [
          ["Beta blockers (metoprolol)", "HR, BP", "HR under 60 or SBP under 100, or per order", "HR, BP, dizziness"],
          ["Digoxin", "Apical pulse for 1 full minute, potassium, dig level", "Apical pulse under 60 (adult); nausea, vision changes", "HR, toxicity signs"],
          ["Loop diuretics (furosemide)", "BP, potassium, urine output", "Low BP, potassium under 3.5", "Urine output, weight, BP, potassium"],
          ["Opioids", "RR, sedation, SpO2, pain", "RR under 12, too sleepy", "Pain in 30-60 min; RR, sedation"],
          ["Insulin", "Glucose, meal plan", "Low glucose; NPO (clarify)", "Glucose; low-sugar signs"],
          ["Anticoagulants", "aPTT or INR, platelets, bleeding", "Labs out of range; bleeding", "Bleeding, bruising, stool color"],
          ["ACE inhibitors (lisinopril)", "BP, potassium, creatinine", "Low BP; high potassium", "BP, cough, face or lip swelling"],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Tip",
        text: "A name ending often tells you the drug family, and the family tells you what to check — watch for exceptions.",
      },
      { type: "heading", text: "Your call" },
      {
        type: "mcq",
        id: "d1",
        q: "Lisinopril is due. BP 86/50, potassium 4.2.",
        options: DECIDE,
        answer: 1,
        explain: "Hold and notify. Low BP is a hold parameter for ACE inhibitors.",
      },
      {
        type: "mcq",
        id: "d2",
        q: "Oxycodone PRN is requested. RR 16, alert and talking, SpO2 97%, pain 6/10.",
        options: DECIDE,
        answer: 0,
        explain: "Give it, since it's safe. Then reassess pain, RR, and sedation in 30 to 60 minutes.",
      },
      {
        type: "mcq",
        id: "d3",
        q: "Insulin lispro is due with breakfast, but the patient was just made NPO for a scan.",
        options: DECIDE,
        answer: 2,
        explain: "Clarify. Mealtime insulin with no meal risks hypoglycemia.",
      },
      {
        type: "mcq",
        id: "d4",
        q: "Enoxaparin is due. Platelets are low and there is new bruising on the arms.",
        options: DECIDE,
        answer: 1,
        explain: "Hold and notify. Labs are out of range and there are signs of bleeding.",
      },
    ],
  },
  {
    id: "m3-recheck",
    section: "Module 3 · Assess Before + After",
    title: "When to recheck",
    icon: "🔁",
    meta: "Module 3",
    blocks: [
      {
        type: "p",
        text: "Reassess when the drug should be working its hardest (its peak). Typical timing — always check the drug reference and facility policy.",
      },
      {
        type: "table",
        headers: ["Route", "Reassess about", "Example"],
        rows: [
          ["IV", "15-30 min", "IV morphine: pain, RR, sedation"],
          ["IM / subcut", "30 min", "Rapid-acting insulin: watch glucose around meals"],
          ["PO", "30-60 min", "Oral acetaminophen or oxycodone: pain score"],
          ["Drug levels", "Per order", "Peak or trough: give the dose around the lab draw"],
        ],
      },
      {
        type: "callout",
        tone: "takeaway",
        title: "Takeaway",
        text: "No reassessment = you don't know if it worked or if it harmed. Chart the recheck.",
      },
      {
        type: "callout",
        tone: "critical",
        title: "Critical",
        text: "Always follow the order's hold parameters and facility policy. No parameter written? Use clinical judgment and contact the provider before giving. When in doubt, hold and ask first.",
      },
      {
        type: "mcq",
        id: "re-iv",
        q: "You gave IV morphine at 1000. When do you reassess pain, RR, and sedation?",
        options: ["1015 to 1030", "1100", "1200", "At the next dose"],
        answer: 0,
        explain: "IV peaks fast: 15 to 30 minutes.",
      },
      {
        type: "mcq",
        id: "re-po",
        q: "You gave oral oxycodone at 1400. When do you reassess the pain score?",
        options: ["1405", "1430 to 1500", "1800", "Tomorrow morning"],
        answer: 1,
        explain: "Oral meds peak in about 30 to 60 minutes.",
      },
      {
        type: "callout",
        tone: "takeaway",
        title: "Takeaway",
        text: 'Before: is it safe? After: did it work, and is the patient OK?',
      },
    ],
  },
  {
    id: "m3-check",
    section: "Module 3 · Assess Before + After",
    title: "Module 3 knowledge check",
    icon: "✏️",
    meta: "3 CJMM-style questions · answer all 3 correctly to continue",
    blocks: [
      {
        type: "nclexQuiz",
        id: "m3-quiz",
        label: "Module 3 knowledge check",
        questions: MODULE3_QUESTIONS,
      },
    ],
  },
  {
    id: "readiness",
    section: "Readiness Quiz",
    title: "Readiness quiz",
    icon: "📝",
    meta: "7 questions · open book · unlimited attempts · get all 7 right to unlock the cases",
    blocks: [
      {
        type: "readinessQuiz",
        id: "quiz",
        questions: [
          {
            q: "Which organ is mainly responsible for drug metabolism?",
            options: ["Kidneys", "Liver", "Lungs", "Heart"],
            answer: 1,
          },
          {
            q: "A patient has chronic kidney disease. Which is most likely with a renally excreted drug?",
            options: ["The drug is cleared faster", "The drug builds up and may become toxic", "The drug is not absorbed", "No change in drug effect"],
            answer: 1,
          },
          {
            q: "Which is an adverse effect rather than a side effect of morphine?",
            options: ["Constipation", "Mild drowsiness", "Respiratory rate of 8", "Nausea"],
            answer: 2,
          },
          {
            q: "Which two identifiers should be used before giving a medication?",
            options: ["Room number and name", "Name and date of birth", "Bed number and diagnosis", "Name and provider"],
            answer: 1,
          },
          {
            q: "Which medication group is high-alert?",
            options: ["Acetaminophen", "Docusate", "Insulin", "Multivitamin"],
            answer: 2,
          },
          {
            q: "Before giving digoxin to an adult, you check the apical pulse. Which finding means hold and notify?",
            options: ["58", "72", "88", "64"],
            answer: 0,
          },
          {
            q: "The barcode scanner flags a mismatch at the bedside. What should you do?",
            options: ["Override it; you already checked twice", "Give the med and report it later", "Stop and find the cause before giving", "Ask the patient if it looks right"],
            answer: 2,
          },
        ],
      },
    ],
  },
  {
    id: "case-1",
    section: "Case Studies",
    title: "Case 1: The sleepy post-op patient",
    icon: "😴",
    meta: "Opioids, kidney function · think through each CJMM step",
    blocks: [
      {
        type: "node",
        node: (
          <PatientChart
            emoji="👴"
            name="Mr. Lee, 78"
            sub="Day 1 after hip surgery · chronic kidney disease"
            pills={[
              ["RR 10", true],
              ["SpO2 91% RA", true],
              ["Hard to keep awake", true],
              ["Pain 7/10", false],
              ["UO 20 mL/hr x 4 hr", true],
            ]}
          >
            <p>
              Order: morphine 4 mg IV every 4 hours PRN for pain. Last dose
              was 3 hours 50 minutes ago. He is asking for more pain
              medicine.
            </p>
          </PatientChart>
        ),
      },
      {
        type: "reveal",
        id: "c1-1",
        q: "Recognize cues: which findings concern you?",
        answer: "RR 10, SpO2 91%, difficult to keep awake mid-sentence, and low urine output (20 mL/hr).",
      },
      {
        type: "reveal",
        id: "c1-2",
        q: "Analyze cues: how do his age and kidney disease change the way morphine acts in his body?",
        answer: "Reduced kidney function lets morphine and its active metabolites build up, and older adults clear drugs more slowly, so each dose acts stronger and longer.",
      },
      {
        type: "reveal",
        id: "c1-3",
        q: "Prioritize hypotheses: what is the most urgent problem right now?",
        answer: "Opioid-induced respiratory depression.",
      },
      {
        type: "mcq",
        id: "c1-mcq",
        q: "Take action: he's due in 10 minutes and asking for it. What do you do?",
        options: [
          "Give the morphine; he's due and in pain",
          "Hold it: stay, stimulate, raise the HOB, oxygen per protocol, call the provider or rapid response",
          "Give half the dose",
          "Wait an hour and recheck",
        ],
        answer: 1,
        explain: "Have naloxone ready and give it per order or protocol.",
      },
      {
        type: "reveal",
        id: "c1-5",
        q: "Evaluate outcomes: what findings would show your actions worked?",
        answer: "RR 12 or higher, SpO2 at least 94%, and easier arousal.",
      },
      {
        type: "after",
        title: "Case answer",
        node: (
          <>
            <p>
              Do not give the morphine. RR 10, SpO2 91%, and heavy sedation
              point to opioid-induced respiratory depression; reduced kidney
              function lets morphine and its active metabolites build up.
              Stay with him, stimulate and tell him to take deep breaths,
              raise the head of the bed, apply oxygen per protocol, and call
              the provider or rapid response. Have naloxone ready and give
              per order or protocol. Success looks like RR 12 or higher,
              SpO2 at least 94%, and easier arousal.
            </p>
            <p className="mt-3 font-semibold text-[var(--title-color)]">
              Sleepy + slow breathing = do NOT give the opioid. Weak kidneys
              make opioids build up.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "case-2",
    section: "Case Studies",
    title: "Case 2: Insulin and the NPO patient",
    icon: "🍬",
    meta: "High-alert medication",
    blocks: [
      {
        type: "node",
        node: (
          <PatientChart
            emoji="👩"
            name="Ms. Garcia, 55"
            sub="Type 2 diabetes · NPO for a procedure this morning"
            pills={[
              ["NPO", true],
              ["0700 glucose 72 mg/dL", true],
              ['"A little shaky"', true],
            ]}
          >
            <p>
              0730 scheduled: insulin glargine 20 units subcut, plus insulin
              lispro per sliding scale with meals.
            </p>
          </PatientChart>
        ),
      },
      {
        type: "reveal",
        id: "c2-1",
        q: "Recognize cues: what information matters for her insulin today?",
        answer: "She is NPO, her glucose is low-normal (72), and she feels shaky, a possible early sign of low blood sugar.",
      },
      {
        type: "reveal",
        id: "c2-2",
        q: "Analyze cues: what is the difference between long-acting and rapid-acting insulin here?",
        answer: "Glargine is basal (long-acting) and covers baseline needs; it is often reduced or held when NPO. Lispro is rapid-acting and covers meals, so with no meal it would drop her glucose.",
      },
      {
        type: "mcq",
        id: "c2-mcq",
        q: "Take action: what about the lispro?",
        options: ["Give it per the sliding scale", "Hold it: she's NPO with low-normal glucose", "Give half the dose", "Give it with juice"],
        answer: 1,
        explain: "Then clarify the glargine with the provider before giving it.",
      },
      {
        type: "reveal",
        id: "c2-4",
        q: "Take action: she is shaky with a glucose of 72. What do you do for her right now, given she is NPO?",
        answer: "Recheck her glucose now. If it's under 70 mg/dL, follow the hypoglycemia protocol; because she is NPO, this usually means IV dextrose per order rather than juice.",
      },
      {
        type: "reveal",
        id: "c2-5",
        q: "Evaluate outcomes: when do you recheck, and what result do you want?",
        answer: "Recheck in 15 minutes; aim for over 70 mg/dL with symptoms resolved.",
      },
      {
        type: "after",
        title: "Case answer",
        node: (
          <>
            <p>
              Hold the lispro: she is NPO and her glucose is low-normal.
              Clarify the glargine with the provider before giving; basal
              insulin is often reduced or held when a patient is NPO,
              depending on the order and protocol. Recheck her glucose now.
              If it is under 70 mg/dL, follow the hypoglycemia protocol;
              because she is NPO, this usually means IV dextrose per order
              rather than juice. Recheck in 15 minutes and aim for over 70
              mg/dL with symptoms resolved.
            </p>
            <p className="mt-3 font-semibold text-[var(--title-color)]">
              No food + low glucose = hold the mealtime insulin and clarify
              the long-acting dose.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "case-3",
    section: "Case Studies",
    title: "Case 3: Two heart meds, one problem",
    icon: "❤️",
    meta: "Lab and vital-sign checks",
    blocks: [
      {
        type: "node",
        node: (
          <PatientChart
            emoji="👵"
            name="Mrs. Johnson, 82"
            sub="Heart failure"
            pills={[
              ["Apical 54", true],
              ["BP 104/62", false],
              ["K+ 3.1 mEq/L", true],
              ["Nausea", true],
              ['"Everything looks yellow"', true],
            ]}
          >
            <p>Due at 0900: furosemide 40 mg PO and digoxin 0.125 mg PO.</p>
          </PatientChart>
        ),
      },
      {
        type: "reveal",
        id: "c3-1",
        q: "Recognize cues: list every abnormal finding.",
        answer: "HR 54, low-normal BP, potassium 3.1, nausea, and yellow vision.",
      },
      {
        type: "reveal",
        id: "c3-2",
        q: "Analyze cues: how does low potassium relate to digoxin? How could furosemide make it worse?",
        answer: "Low potassium increases the risk of digoxin toxicity, and furosemide lowers potassium further.",
      },
      {
        type: "mcq",
        id: "c3-mcq",
        q: "Prioritize hypotheses: what condition do her symptoms suggest?",
        options: ["Dehydration", "Digoxin toxicity", "An allergic reaction", "High potassium"],
        answer: 1,
        explain: "Nausea, yellow vision, and bradycardia with low potassium are classic signs.",
      },
      {
        type: "reveal",
        id: "c3-4",
        q: "Take action: which medications do you hold? What do you report, and in what format?",
        answer: "Hold the digoxin and hold or clarify the furosemide. Call the provider using SBAR (Situation, Background, Assessment, Recommendation).",
      },
      {
        type: "reveal",
        id: "c3-5",
        q: "Evaluate outcomes: what labs or follow-up would you expect?",
        answer: "A digoxin level, potassium replacement, an ECG, and closer monitoring.",
      },
      {
        type: "after",
        title: "Case answer",
        node: (
          <>
            <p>
              Abnormal findings are HR 54, low-normal BP, potassium 3.1,
              nausea, and yellow vision. Low potassium increases the risk of
              digoxin toxicity, and furosemide lowers potassium further. Her
              symptoms suggest digoxin toxicity. Hold the digoxin and hold
              or clarify the furosemide, then call the provider using SBAR.
              Expect a digoxin level, potassium replacement, an ECG, and
              closer monitoring.
            </p>
            <p className="mt-3 font-semibold text-[var(--title-color)]">
              Low potassium + digoxin = toxicity risk. Nausea and yellow
              vision are red flags.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "case-4",
    section: "Case Studies",
    title: "Case 4: Med-pass drill",
    icon: "🏃",
    meta: "Two errors are hidden. Say each check aloud as you go.",
    blocks: [
      {
        type: "node",
        node: (
          <PatientChart
            emoji="🧑"
            name="Robert Chen"
            sub="DOB 03/14/1961 · 0900 med pass"
            pills={[
              ["Allergy: penicillin (hives)", true],
              ["HR 76", false],
              ["BP 132/80", false],
            ]}
          >
            <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
              <table className="w-full min-w-[22rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[var(--chip-blue-soft)]">
                    <th className="border-b border-[var(--border-color)] px-3 py-2 font-semibold text-[var(--title-color)]">
                      Medication on MAR
                    </th>
                    <th className="border-b border-[var(--border-color)] px-3 py-2 font-semibold text-[var(--title-color)]">
                      What&apos;s in your hand
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border-color)]">
                    <td className="px-3 py-2">Metoprolol tartrate 25 mg PO</td>
                    <td className="px-3 py-2">Metoprolol tartrate 25 mg</td>
                  </tr>
                  <tr className="border-b border-[var(--border-color)]">
                    <td className="px-3 py-2">Amoxicillin 500 mg PO</td>
                    <td className="px-3 py-2">Amoxicillin 500 mg</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">HydrALAZINE 25 mg PO</td>
                    <td className="px-3 py-2">HydrOXYzine 25 mg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </PatientChart>
        ),
      },
      {
        type: "sort",
        id: "drill",
        q: "For each med: give it, or don't?",
        buckets: ["Give", "Don't give"],
        items: [
          { text: "Metoprolol tartrate 25 mg PO", answer: 0, explain: "Safe to give: HR 76 and BP 132/80 are within range. Not every med needs to be held." },
          { text: "Amoxicillin 500 mg PO", answer: 1, explain: "Amoxicillin is a penicillin, and he has a penicillin allergy (hives). Notify the provider." },
          { text: "HydrALAZINE 25 mg PO", answer: 1, explain: "Pharmacy sent hydrOXYzine, a look-alike, sound-alike drug. Get the correct drug from pharmacy." },
        ],
      },
      { type: "heading", text: "Debrief" },
      {
        type: "reveal",
        id: "c4-1",
        q: "Which errors did you catch, and at which check?",
        answer: "Amoxicillin + penicillin allergy: caught at the allergy check. Hydroxyzine instead of hydralazine: caught at the label check during prepare or at the bedside scan.",
      },
      {
        type: "reveal",
        id: "c4-2",
        q: "What would have happened if each one reached the patient?",
        answer: "Amoxicillin: an allergic reaction, possibly anaphylaxis. Hydroxyzine: his blood pressure would go untreated, and he would get an unneeded sedating drug (fall risk).",
      },
      {
        type: "reveal",
        id: "c4-3",
        q: "What would you say to the provider about the amoxicillin, and to pharmacy about the hydroxyzine?",
        answer: 'Provider (SBAR): "Robert Chen has a documented penicillin allergy with hives, and amoxicillin is ordered. I\'m holding it. Can we get an alternative?" Pharmacy: "The MAR says hydralazine 25 mg, but hydroxyzine 25 mg was sent. Please send the correct medication."',
      },
      {
        type: "callout",
        tone: "takeaway",
        title: "Takeaway",
        text: "The allergy check and the label check catch errors before they reach the patient. Not every med needs to be held.",
      },
    ],
  },
  {
    id: "checklist",
    section: "Wrap-up",
    title: "Med-pass checklist",
    icon: "📋",
    meta: "Your routine for every med pass. Check each one to commit to it.",
    blocks: [
      {
        type: "check",
        id: "checklist",
        q: "I will do these at every med pass:",
        items: [
          "Hand hygiene",
          "Two patient identifiers checked against armband and MAR",
          "Allergies confirmed",
          "Three checks completed (pull, prepare, bedside)",
          "Required assessment done before giving (vitals, labs, glucose)",
          "Patient educated on the drug's purpose and main side effect",
          "Barcode scanned; any alert investigated",
          "Documented after giving",
          "Reassessment time stated",
        ],
      },
    ],
  },
  {
    id: "exit",
    section: "Wrap-up",
    title: "Exit ticket",
    icon: "🎟",
    meta: "Answer before you leave.",
    blocks: [
      {
        type: "fields",
        id: "exit",
        items: [
          { key: "habit", label: "One habit I will use at every med pass starting at my next clinical:" },
          { key: "alert", label: "One high-alert medication and what I will check before giving it:" },
          { key: "rate", label: "On a scale of 1 to 5, how confident do I feel giving medications safely?", rating: true },
          { key: "raise", label: "What would raise it by one point?" },
        ],
      },
    ],
  },
  {
    id: "complete",
    section: "Wrap-up",
    title: "Course complete",
    icon: "🏆",
    final: true,
    blocks: [],
  },
];

export const LAST_INDEX = STEPS.length - 1;

export const stepSections = () => {
  const sections: string[] = [];
  STEPS.forEach((step) => {
    if (!sections.includes(step.section)) sections.push(step.section);
  });
  return sections;
};

export type { Block };
