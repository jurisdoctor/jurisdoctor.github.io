import React from "react";
import Social from "./Social";
import Data from "./Data";
import ScrollDown from "./ScrollDown";

const Landing = () => {
  return (
    <section id="home" className="2xl:px-8 pt-[10vh] pb-2">
      <div className="h-screen max-w-[968px] mx-auto grid gap-y-28 home__container">
        <div className="2xl:grid-cols-[100px_repeat(2,1fr)] 2xl:gap-x-5 xl:grid-cols-[0.5fr_3fr] grid grid-cols-[116px_repeat(2,1fr)] pt-20 gap-x-8 items-center">
          <Social />

          <div className="2xl:w-[250px] 2xl:h-[250px] bg-[url('/assets/me.png')] 2xl:shadow-[inset_0_0_0_8px_rgb(255,255,255/30%)] xl:order-[var(--top-initial)] xl:justify-self-[var(--top-initial)] xl:shadow-[inset_0_0_0_6px_rgb(255,255,255/30%)] xl:w-[200px] xl:h-[200px] l:h-[180px] l:w-[180px] bg-no-repeat bg-center bg-cover shadow-[inset_0_0_0_9px_rgb(255,255,255/30%)] w-[300px] h-[300px] order-1 justify-self-center animate-profileCircles"></div>

          <Data />
        </div>

        <ScrollDown />
      </div>
    </section>
  );
};

export default Landing;
