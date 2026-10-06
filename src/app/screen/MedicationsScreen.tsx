import Sidebar from "../components/Sidebar";
import Medications from "../components/Medications";
import ScrollReset from "../components/ScrollReset";
const MedicationsScreen = () => {
  return (
    <>
      <ScrollReset />
      <Sidebar />

      <main className="ml-20 lg:ml-0">
        <Medications />
      </main>
    </>
  );
};
export default MedicationsScreen;
