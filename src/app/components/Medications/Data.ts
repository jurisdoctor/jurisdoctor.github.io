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

// Where the learner is: nothing picked (every category), a category, or one
// medication (which always belongs to a category). Kept in the URL hash —
// "#/blood-pressure/amlodipine" — so the browser's back button, a refresh
// and a shared link all land in the same place.
export interface RouteType {
  group: string | null;
  med: string | null;
  // The interaction map ("#/compare"): not under any category.
  compare?: boolean;
}

export const ROOT: RouteType = { group: null, med: null };
export const COMPARE: RouteType = { group: null, med: null, compare: true };

export const hashOf = (route: RouteType) =>
  route.compare
    ? "#/compare"
    : route.group
      ? `#/${slugOf(route.group)}${route.med ? `/${route.med}` : ""}`
      : "#/";

export const parseHash = (hash: string, guide: MedFile): RouteType => {
  const [groupSlug, medId] = hash
    .replace(/^#\/?/, "")
    .split("/")
    .filter(Boolean);

  if (groupSlug === "compare") return COMPARE;

  const med = medId
    ? guide.medications.find((entry) => entry.id === medId)
    : undefined;
  // A medication decides its own category, so a stale or edited group in the
  // link can't put it under the wrong one.
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
export const rankOf = (med: MedType, query: string): number | null => {
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

export const search = (meds: MedType[], query: string): MedType[] =>
  meds
    .map((med) => ({ med, rank: rankOf(med, query) }))
    .filter(
      (entry): entry is { med: MedType; rank: number } => entry.rank !== null,
    )
    .sort(
      (a, b) => a.rank - b.rank || a.med.generic.localeCompare(b.med.generic),
    )
    .map((entry) => entry.med);

export const searchGroups = (groups: GroupType[], query: string) => {
  const q = norm(query.trim());
  return q ? groups.filter((group) => norm(group.name).includes(q)) : groups;
};
