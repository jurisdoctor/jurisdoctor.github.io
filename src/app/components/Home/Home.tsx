import Image from "next/image";
import SocialMedia from "./SocialMedia";
import ScrollDown from "./ScrollDown";
import Shapes from "./Shapes";

const Home = () => {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center max-w-[1008px] mx-auto px-[15px]"
      id="home"
    >
      <div className="max-w-[540px] text-center">
        <Image
          className="h-auto mx-auto max-w-full mb-6"
          src="/assets/avatar-1.svg"
          width={125}
          height={125}
          alt="Picture of the author"
        />
        <h1 className="text-2xl font-bold">tom phan</h1>
        <span className="home__education">software + math</span>

        <SocialMedia />

        <a
          href="#contact"
          className="inline-block bg-[var(--primary-color)] border-[1px] border-solid border-transparent rounded-[1.875rem] text-white font-bold leading-4 py-3 px-8 mb-1 shadow-lg hover:animate-pulse"
        >
          Poke!
        </a>

        <ScrollDown />
      </div>
      <Shapes />
    </section>
  );
};

export default Home;
