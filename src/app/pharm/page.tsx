import type { Metadata } from "next";
import PharmScreen from "../screen/PharmScreen";
export const metadata: Metadata = {
  title: "Pharmacology Crash Course",
  description: "Step-through medication safety training course",
};
const PharmPage = () => {
  return (
    <>
      <PharmScreen />
    </>
  );
};
export default PharmPage;
