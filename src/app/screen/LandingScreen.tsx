import Sidebar from "../components/Sidebar";
import Home from "../components/Home";
import About from "../components/About";
import Resume from "../components/Resume";
import ScrollReset from "../components/ScrollReset";

const LandingScreen = () => {
  return (
    <>
      <ScrollReset />
      <Sidebar />

      <main className="ml-20 lg:ml-0">
        <Home />
        <About />
        <Resume />
      </main>
    </>
  );
};

export default LandingScreen;
