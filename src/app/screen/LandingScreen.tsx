import Sidebar from "../components/Sidebar";
import Home from "../components/Home";
import About from "../components/About";
import Resume from "../components/Resume";
import Portfolio from "../components/Portfolio";
import Contact from "../components/Contact";

const LandingScreen = () => {
  return (
    <>
      <Sidebar />

      <main className="ml-[110px] lg:ml-0">
        <Home />
        <About />
        <Resume />
        <Portfolio />
        <Contact />
      </main>
    </>
  );
};

export default LandingScreen;
