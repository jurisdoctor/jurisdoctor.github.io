import Sidebar from "../components/Sidebar";
import Medications from "../components/Medications";
import Gate from "../components/Medications/Gate";
import ScrollReset from "../components/ScrollReset";
const MedicationsScreen = () => {
  return (
    <>
      <ScrollReset />
      <Sidebar />

      <main className="ml-20 lg:ml-0">
        <Gate>
          <Medications />
        </Gate>
      </main>
    </>
  );
};
export default MedicationsScreen;
