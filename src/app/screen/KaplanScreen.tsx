import Sidebar from "../components/Sidebar";
import ScrollReset from "../components/ScrollReset";
import Nclex from "../components/Nclex";
import Gate from "../components/Nclex/Gate";

const KaplanScreen = () => {
  return (
    <>
      <ScrollReset />
      <Sidebar />

      <main className="ml-20 lg:ml-0">
        <Gate what="Kaplan questions">
          <Nclex kind="kaplan" />
        </Gate>
      </main>
    </>
  );
};
export default KaplanScreen;
