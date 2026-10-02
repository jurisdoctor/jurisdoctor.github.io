"use client";

import SocialMedia from "./SocialMedia";
import ScrollDown from "./ScrollDown";
import Shapes from "./Shapes";
import Reveal from "../Reveal";

const Home = () => {
  return (
    <>
      {/* Shapes used to live inside the hero section below, but that
          section is overflow-hidden (to stop its own decorative elements
          from causing horizontal scroll) and only min-h-screen tall, so any
          shape that wandered or got attracted near its edge was invisibly
          clipped there. Hoisting it into its own fixed, unclipped layer —
          left-20 matches the sidebar's width, same as the NCLEX page's
          version of this fix — lets shapes roam the full viewport instead. */}
      <div className="pointer-events-none fixed inset-y-0 left-20 right-0 z-0 overflow-hidden lg:left-0">
        <Shapes />
      </div>

      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-[15px]"
        id="home"
      >
        <div data-shapes-safe className="z-10 max-w-[540px] text-center">
          <Reveal>
            <img
              className="mx-auto mb-6 h-auto max-w-full rounded-full"
              src="/assets/cat.gif"
              width={125}
              height={125}
              alt="Picture of the author"
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
