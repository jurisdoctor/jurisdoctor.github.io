import type { Metadata } from "next";
import NclexScreen from "../screen/NclexScreen";
export const metadata: Metadata = {
  title: "NCLEX-style Questions",
  description: "NCLEX practice questions by chapter",
};
const NclexPage = () => {
  return (
    <>
      <NclexScreen />
    </>
  );
};
export default NclexPage;
