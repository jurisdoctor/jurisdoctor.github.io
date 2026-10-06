import type { Metadata } from "next";
import MedicationsScreen from "../screen/MedicationsScreen";
export const metadata: Metadata = {
  title: "Drug Guide",
  description: "Searchable medication guide organized by category",
};
const MedicationsPage = () => {
  return (
    <>
      <MedicationsScreen />
    </>
  );
};
export default MedicationsPage;
