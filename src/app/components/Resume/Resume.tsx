"use client";

import { useState } from "react";
import Card from "./Card";
import Data from "./Data";
import Reveal from "../Reveal";

type Tab = "education" | "experience";

const Resume = () => {
  const [tab, setTab] = useState<Tab>("education");

  const tabBtn = (active: boolean) =>
    `flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-colors ${
      active
        ? "bg-[var(--primary-color)] text-white shadow-lg"
        : "bg-[var(--container-color)] text-[var(--title-color)] shadow"
    }`;

  return (
    <section
      className="resume mx-auto max-w-[1080px] px-10 md:px-6 pb-28 pt-28 lg:pt-12"
      id="resume"
    >
      <Reveal
        as="h2"
        className="relative mb-14 ml-3.5 text-4xl font-bold lg:mb-8 lg:ml-0 lg:text-center"
      >
        Experience
      </Reveal>

      <div className="mb-8 hidden gap-3 lg:flex lg:max-w-[450px] lg:mx-auto">
        <button
          type="button"
          onClick={() => setTab("education")}
          className={tabBtn(tab === "education")}
        >
          Education
        </button>
        <button
          type="button"
          onClick={() => setTab("experience")}
          className={tabBtn(tab === "experience")}
        >
          Experience
        </button>
      </div>

      <div className="grid grid-cols-2 items-start gap-x-7 sm:grid-cols-1 lg:grid-cols-[450px] lg:justify-center lg:gap-y-[1.875rem]">
        <Reveal delay={80}>
          <div
            key={`education-${tab}`}
            data-shapes-safe
            className={`relative grid animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 shadow-2xl ${
              tab === "education" ? "" : "lg:hidden"
            }`}
          >
            {Data.map((val, id) => {
              if (val.category === "education") {
                return (
                  <Card
                    key={id}
                    title={val.title}
                    year={val.year}
                    desc={val.desc}
                    category={val.category}
                  />
                );
              }
            })}
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div
            key={`experience-${tab}`}
            data-shapes-safe
            className={`relative grid animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 shadow-2xl ${
              tab === "experience" ? "" : "lg:hidden"
            }`}
          >
            {Data.map((val, id) => {
              if (val.category === "experience") {
                return (
                  <Card
                    key={id}
                    title={val.title}
                    year={val.year}
                    desc={val.desc}
                    category={val.category}
                  />
                );
              }
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Resume;
