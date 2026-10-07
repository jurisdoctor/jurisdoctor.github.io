import type { Metadata } from "next";
import guide from "../../components/Medications/medications.json";
import { slugOf } from "../../components/Medications/Data";
import MedicationsScreen from "../../screen/MedicationsScreen";

export const metadata: Metadata = {
  title: "Drug Guide",
  description: "Searchable medication guide organized by category",
};

// The site is a static export, so every address the guide can be at is built
// as its own page: /medications, /medications/compare, each category, and each
// medication under its category. The page itself is the same one; it reads the
// address and shows the right view. (`dynamicParams = false` is deliberately not
// set: with it, `next dev` refuses the route under `output: "export"`.)
export function generateStaticParams() {
  return [
    { path: [] as string[] },
    { path: ["compare"] },
    { path: ["study"] },
    ...guide.groups.map((group) => ({ path: [slugOf(group.name)] })),
    ...guide.medications.map((med) => ({
      path: [slugOf(med.group), med.id],
    })),
  ];
}

const MedicationsPage = () => {
  return (
    <>
      <MedicationsScreen />
    </>
  );
};
export default MedicationsPage;
