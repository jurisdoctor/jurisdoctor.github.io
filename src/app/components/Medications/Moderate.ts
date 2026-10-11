// A light check on what people type into the Suggest window: cursing, slurs,
// insults, threats and links are turned away before anything is sent. It runs
// in the browser, so it keeps honest mistakes and casual trolling out of the
// inbox; it is not a security boundary (anyone determined can skip it, and the
// form service does its own spam filtering on top).

// Words that are ordinary in a drug guide and that a profanity list would
// otherwise catch: anatomy, routes and body-system terms ("vaginal cream",
// "anal fissure", "analgesic", "sex hormone").
const MEDICAL =
  /\b(anal|analges\w*|anus|vagin\w*|sex\w*|semen|penis|penile|rectal|rectum|breast\w*|nipple\w*|testic\w*|erectile|genital\w*|intercourse|urethra\w*)\b/gi;

const LINK =
  /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|top|info|co|me|ly)\b)/i;

// Lower-case, undo the usual letter swaps (l0ser, st00pid, @ss), collapse
// stretched letters (loooser) and doubled ones, and drop punctuation, so
// disguised spellings read as what they are. Everything compared below goes
// through this, the lists included, so both sides are cleaned the same way.
const squash = (text: string) =>
  text
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/3/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[^a-z\s]/g, " ")
    .replace(/(.)\1+/g, "$1");

// Insults and harassment the profanity list does not cover. Matched as whole
// words, so an ordinary word that merely contains one never trips it. Words
// that are also everyday medical language (fat, gross, hate...) are left out.
const INSULTS = [
  "loser",
  "losers",
  "weirdo",
  "weirdos",
  "idiot",
  "idiots",
  "stupid",
  "dumb",
  "dumbass",
  "moron",
  "morons",
  "imbecile",
  "ugly",
  "freak",
  "freaks",
  "creepy",
  "psycho",
  "pathetic",
  "worthless",
  "useless",
  "trash",
  "garbage",
  "scum",
  "scumbag",
  "jerk",
  "jerks",
  "clown",
  "lame",
  "nerd",
  "dork",
  "stfu",
  "kys",
  "retard",
  "retarded",
  "spaz",
  "cripple",
  "disgusting",
  "braindead",
];
const INSULT = new RegExp(`\\b(${INSULTS.map(squash).join("|")})\\b`);

// Threats and "go away" phrases.
const PHRASES = [
  "shut up",
  "kill yourself",
  "kill urself",
  "kill you",
  "kill him",
  "kill her",
  "go die",
  "hope you die",
  "i will find you",
  "i will hurt you",
  "ill find you",
  "ill hurt you",
  "im going to find you",
  "you suck",
  "you stink",
  "hate you",
  "bomb threat",
].map(
  (phrase) => new RegExp(`\\b${squash(phrase).replace(/\s+/g, "\\s*")}\\b`),
);

type Matcher = { hasMatch: (text: string) => boolean };
let matcher: Promise<Matcher> | null = null;

// The word list is large, so it is only fetched the first time someone sends.
const load = () => {
  matcher ??= import("obscenity").then(
    ({ RegExpMatcher, englishDataset, englishRecommendedTransformers }) =>
      new RegExpMatcher({
        ...englishDataset.build(),
        ...englishRecommendedTransformers,
      }),
  );
  return matcher;
};

export const isAcceptable = async (...fields: string[]) => {
  const text = fields.join("\n");
  if (LINK.test(text)) return false;
  const clean = text.replace(MEDICAL, " ");
  const flat = squash(clean);
  if (INSULT.test(flat) || PHRASES.some((phrase) => phrase.test(flat)))
    return false;
  const found = await load();
  return !found.hasMatch(clean);
};
