import React from "react";
import Social from "./Social";
import Data from "./Data";
import ScrollDown from "./ScrollDown";

const Landing = () => {
  return (
    <section id="home" className="pt-[10vh] pb-2">
      <div className="max-w-[968px] mx-auto grid gap-6 home__container">
        <div className="grid grid-cols-[116px_repeat(2,1fr)] pt-20 gap-x-8 items-center">
          <Social />

          <div className="bg-[url('/assets/me.png')] bg-no-repeat bg-center bg-cover shadow-[inset_0_0_0_9px_rgb(255,255,255/30%)] w-[300px] h-[300px] order-1 justify-self-center animate-profileCircles"></div>

          <Data />
        </div>

        <ScrollDown />
      </div>
    </section>
  );
};

export default Landing;
