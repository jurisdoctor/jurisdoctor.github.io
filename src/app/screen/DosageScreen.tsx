import Sidebar from "../components/Sidebar";
import DosageCalculations from "../components/DosageCalculations";
import ScrollReset from "../components/ScrollReset";

const DosageScreen = () => {
  return (
    <>
      <ScrollReset />
      <Sidebar />

      <main className="ml-[110px] lg:ml-0">
        <DosageCalculations />
      </main>
    </>
  );
};

export default DosageScreen;
