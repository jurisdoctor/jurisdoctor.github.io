import type { Metadata } from "next";
import KaplanScreen from "../screen/KaplanScreen";
export const metadata: Metadata = {
  title: "Kaplan Questions",
  description: "Kaplan practice questions by topic",
};
const KaplanPage = () => {
  return (
    <>
      <KaplanScreen />
    </>
  );
};
export default KaplanPage;
