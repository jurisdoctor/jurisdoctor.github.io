import About from "./components/About";
import Header from "./components/Header";
import History from "./components/History/History";
import Landing from "./components/Landing";
import Skills from "./components/Skills";

export default function Home() {
  return (
    <main>
      <Header />
      <main className="mb-20">
        <Landing />
        <About />
        <Skills />
        <History />
      </main>
    </main>
  );
}
