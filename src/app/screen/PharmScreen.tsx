import Sidebar from "../components/Sidebar";
import Pharm from "../components/Pharm";
import ScrollReset from "../components/ScrollReset";
const PharmScreen = () => {
  return (
    <>
      <ScrollReset />
      <Sidebar />

      <main className="ml-20 lg:ml-0">
        <Pharm />
      </main>
    </>
  );
};
export default PharmScreen;
