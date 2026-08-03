import type { Metadata } from "next";
import DosageScreen from "../screen/DosageScreen";
export const metadata: Metadata = {
  title: "Dosage Calculations",
  description: "Conversions and practice for dosage calculations",
};
const DosageCalculationsPage = () => {
  return (
    <>
      <DosageScreen />
    </>
  );
};
export default DosageCalculationsPage;
