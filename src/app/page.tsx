import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Header from "./components/Header";
import History from "./components/History/History";
import Landing from "./components/Landing";
import Skills from "./components/Skills";

export default function Home() {
  return (
    <main>
      <Header />
      <main>
        <Landing />
        <About />
        <Skills />
        <History />
        <Contact />
        <Footer />
      </main>
    </main>
  );
}
