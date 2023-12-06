import About from "./components/About";
import Header from "./components/Header";
import Landing from "./components/Landing";

export default function Home() {
  return (
    <main>
      <Header />
      <main>
        <Landing />
        <About />
      </main>
    </main>
  );
}
