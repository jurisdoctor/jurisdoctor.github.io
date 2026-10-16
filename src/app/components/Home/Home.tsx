"use client";

import SocialMedia from "./SocialMedia";
import ScrollDown from "./ScrollDown";
import Shapes from "./Shapes";
import Reveal from "../Reveal";

const Home = () => {
  return (
    <>
      <div className="pointer-events-none fixed inset-y-0 left-20 right-0 -z-[5] overflow-hidden lg:left-0">
        <Shapes />
      </div>

      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-[15px]"
        id="home"
      >
        <div data-shapes-safe className="z-10 max-w-[540px] text-center">
          <Reveal>
            <img
              className="mx-auto mb-6 h-[125px] w-[125px] max-w-full rounded-full object-cover"
              src="/assets/cat-knight.webp"
              width={125}
              height={125}
              alt="A kitten in a tiny suit of armor, holding up a sword"
            />
          </Reveal>
          <Reveal delay={120} as="h1" className="text-2xl font-bold">
            tom phan
          </Reveal>
          <Reveal
            delay={220}
            as="span"
            className="home__education inline-block"
          >
            software + math
          </Reveal>

          <Reveal delay={320}>
            <SocialMedia />
          </Reveal>
        </div>
        <ScrollDown />
      </section>
    </>
  );
};

export default Home;
