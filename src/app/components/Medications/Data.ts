import { GroupType, MedFile, MedType } from "./types";

// Loaded on demand so the ~400 KB guide isn't part of every page's bundle.
// The copy of the data that ships with the site leaves out the study-card
// editing log (what was changed and why): that is for whoever maintains the
// data, not for students. The full file stays in the question-bank folder.
export const loadGuide = (): Promise<MedFile> =>
  import("./medications.json").then((mod) => mod.default as unknown as MedFile);

export const slugOf = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export interface RouteType {
  group: string | null;
  med: string | null;
  compare?: boolean;
  study?: boolean;
}

export const BASE = "/medications";

export const ROOT: RouteType = { group: null, med: null };
export const COMPARE: RouteType = { group: null, med: null, compare: true };
export const STUDY: RouteType = { group: null, med: null, study: true };

export const pathOf = (route: RouteType) =>
  route.compare
    ? `${BASE}/compare`
    : route.study
      ? `${BASE}/study`
      : route.group
        ? `${BASE}/${slugOf(route.group)}${route.med ? `/${route.med}` : ""}`
        : BASE;

// "/medications/blood-pressure/amlodipine" -> that medication. Anything it
// can't place (a typo, an old link) falls back to the main page.
export const parsePath = (pathname: string, guide: MedFile): RouteType => {
  const [groupSlug, medId] = pathname
    .replace(new RegExp(`^${BASE}/?`), "")
    .split("/")
    .filter(Boolean);

  if (groupSlug === "compare") return COMPARE;
  if (groupSlug === "study") return STUDY;

  const med = medId
    ? guide.medications.find((entry) => entry.id === medId)
    : undefined;
  if (med) return { group: med.group, med: med.id };

  const group = groupSlug
    ? guide.groups.find((entry) => slugOf(entry.name) === groupSlug)
    : undefined;
  return group ? { group: group.name, med: null } : ROOT;
};

const norm = (text: string) => text.toLowerCase();

// How well a medication matches what was typed, lowest first; null = no
// match. Names beat classes, which beat the free-text "use" lines, so typing
// "lis" puts lisinopril ahead of anything that merely mentions it.
// What was typed, split at commas: "lisinopril, metoprolol" is two searches
// whose results are shown together.
export const termsOf = (query: string) =>
  query
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);

const rankOne = (med: MedType, query: string): number | null => {
  const q = norm(query.trim());
  if (!q) return 0;

  const generic = norm(med.generic);
  if (generic.startsWith(q)) return 0;
  if (med.brand.some((brand) => norm(brand).startsWith(q))) return 1;
  if (generic.includes(q)) return 2;
  if (med.brand.some((brand) => norm(brand).includes(q))) return 3;
  if (
    med.drug_class.some((entry) => norm(entry).includes(q)) ||
    norm(med.subclass).includes(q)
  )
    return 4;
  if (norm(med.group).includes(q)) return 5;
  if (
    norm(med.highlight.headline).includes(q) ||
    norm(med.use.primary).includes(q) ||
    med.use.secondary.some((entry) => norm(entry).includes(q)) ||
    norm(med.quick.one_liner).includes(q) ||
    norm(med.why_this_one.text).includes(q)
  )
    return 6;
  return null;
};

export const rankOf = (med: MedType, query: string): number | null => {
  const terms = termsOf(query);
  if (!terms.length) return 0;
  const ranks = terms
    .map((term) => rankOne(med, term))
    .filter(
      (rank): rank is number =>
        rank !== null && (terms.length === 1 || rank <= NAME),
    );
  return ranks.length ? Math.min(...ranks) : null;
};

const MENTION = 6;
const NAME = 3;

export const search = (meds: MedType[], query: string): MedType[] => {
  const ranked = meds
    .map((med) => ({ med, rank: rankOf(med, query) }))
    .filter(
      (entry): entry is { med: MedType; rank: number } => entry.rank !== null,
    );
  const named = ranked.some((entry) => entry.rank <= NAME);
  return ranked
    .filter((entry) => !named || entry.rank < MENTION)
    .sort(
      (a, b) => a.rank - b.rank || a.med.generic.localeCompare(b.med.generic),
    )
    .map((entry) => entry.med);
};

export const searchGroups = (groups: GroupType[], query: string) => {
  const terms = termsOf(norm(query));
  return terms.length
    ? groups.filter((group) =>
        terms.some((term) => norm(group.name).includes(term)),
      )
    : groups;
};
