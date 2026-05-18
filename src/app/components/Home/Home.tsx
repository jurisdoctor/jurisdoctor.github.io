"use client";

import SocialMedia from "./SocialMedia";
import ScrollDown from "./ScrollDown";
import Shapes from "./Shapes";

const Home = () => {
  return (
    <section
      className="relative flex min-h-screen animate-fadeIn items-center justify-center overflow-hidden px-[15px]"
      id="home"
    >
      <div className="z-10 max-w-[540px] text-center">
        <img
          className="mx-auto mb-6 h-auto max-w-full rounded-full"
          src="/assets/cat.gif"
          width={125}
          height={125}
          alt="Picture of the author"
        />
        <h1 className="text-2xl font-bold">tom phan</h1>
        <span className="home__education">software + math</span>

        <SocialMedia />

        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            document
              .getElementById("contact")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className="mb-1 inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse"
        >
          Poke!
        </a>
      </div>
      <ScrollDown />
      <Shapes />
    </section>
  );
};

export default Home;
