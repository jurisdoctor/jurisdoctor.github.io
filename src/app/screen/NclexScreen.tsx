import Sidebar from "../components/Sidebar";
import ScrollReset from "../components/ScrollReset";
import Nclex from "../components/Nclex";
import Gate from "../components/Nclex/Gate";

const NclexScreen = () => {
  return (
    <>
      <ScrollReset />
      <Sidebar />

      <main className="ml-[110px] lg:ml-0">
        <Gate>
          <Nclex />
        </Gate>
      </main>
    </>
  );
};
export default NclexScreen;
