"use client";

import { LuGraduationCap } from "react-icons/lu";
import { IoBriefcaseOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { useState } from "react";

const History = () => {
  const [toggleState, setToggleState] = useState(1);

  const toggleButtonClass =
    "flex text-xs font-medium text-[var(--title-color)] mx-4 cursor-pointer hover:text-[var(--title-color-dark)] button--flex";

  const toggleTab = (index: number) => {
    setToggleState(index);
  };

  return (
    <section className="pt-24 pb-8" id="portfolio">
      <h2 className="text-4xl text-center">History</h2>

      <span className="block text-sm mb-16 text-center">My Journey</span>

      <div className="max-w-[768px] mx-auto">
        <div className="flex justify-center mb-8">
          <div
            className={
              toggleState && toggleState === 1
                ? `${toggleButtonClass} text-[var(--title-color-dark)]`
                : `${toggleButtonClass}`
            }
            onClick={() => toggleTab(1)}
          >
            <LuGraduationCap className="text-lg mr-1" />
            Education
          </div>

          <div
            className={
              toggleState && toggleState === 2
                ? `${toggleButtonClass} text-[var(--title-color-dark)]`
                : `${toggleButtonClass}`
            }
            onClick={() => toggleTab(2)}
          >
            <IoBriefcaseOutline className="text-lg mr-1" />
            Experience
          </div>
        </div>

        <div className="grid grid-cols-[0.5fr] justify-center">
          <div className={toggleState === 1 ? "block" : "hidden"}>
            <div className="grid grid-cols-[1fr_max-content_1fr] gap-x-6">
              <div>
                <h3 className="text-xs font-medium">UC Santa Barbara</h3>
                <span className="inline-block text-xs mb-4">
                  Bachelors - Math
                </span>
                <div className="flex text-xs">
                  <LuCalendarDays className="mr-1 my-auto" />
                  2010 - 2013
                </div>
              </div>

              <div>
                <span className="inline-block w-[13px] h-[13px] bg-[--text-color] rounded-[50%]"></span>
                <span className="block w-[1px] h-full bg-[var(--text-color)] translate-x-[6px] translate-y-[-7px]">
                  {" "}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_max-content_1fr] gap-x-6">
              <div></div>

              <div>
                <span className="inline-block w-[13px] h-[13px] bg-[--text-color] rounded-[50%]"></span>
                <span className="block w-[1px] h-full bg-[var(--text-color)] translate-x-[6px] translate-y-[-7px]"></span>
              </div>
              <div>
                <h3 className="text-xs font-medium">CSU East Bay</h3>
                <span className="inline-block text-xs mb-4">
                  Masters - Math
                </span>
                <div className="flex text-xs">
                  <LuCalendarDays className="mr-1 my-auto" /> 2014 - 2016
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_max-content_1fr] gap-x-6">
              <div>
                <h3 className="text-xs font-medium">TBD</h3>
                <span className="inline-block text-xs mb-4">Juris Doctor</span>
                <div className="flex text-xs">
                  <LuCalendarDays className="mr-1 my-auto" /> Present -
                </div>
              </div>

              <div>
                <span className="inline-block w-[13px] h-[13px] bg-[--text-color] rounded-[50%]"></span>
                <span className="block w-[1px] h-full bg-[var(--text-color)] translate-x-[6px] translate-y-[-7px]">
                  {" "}
                </span>
              </div>
            </div>
          </div>

          <div className={toggleState === 2 ? "block" : "hidden"}>
            <div className="grid grid-cols-[1fr_max-content_1fr] gap-x-6">
              <div>
                <h3 className="text-xs font-medium">Technical Lead</h3>
                <span className="inline-block text-xs mb-4">
                  Avail Medsystems
                </span>
                <div className="flex text-xs">
                  <LuCalendarDays className="mr-1 my-auto" /> 2020 - Present
                </div>
              </div>

              <div>
                <span className="inline-block w-[13px] h-[13px] bg-[--text-color] rounded-[50%]"></span>
                <span className="block w-[1px] h-full bg-[var(--text-color)] translate-x-[6px] translate-y-[-7px]">
                  {" "}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_max-content_1fr] gap-x-6">
              <div></div>

              <div>
                <span className="inline-block w-[13px] h-[13px] bg-[--text-color] rounded-[50%]"></span>
                <span className="block w-[1px] h-full bg-[var(--text-color)] translate-x-[6px] translate-y-[-7px]"></span>
              </div>
              <div>
                <h3 className="text-xs font-medium">Lead Frontend Engineer</h3>
                <span className="inline-block text-xs mb-4">Sofar Ocean</span>
                <div className="flex text-xs">
                  <LuCalendarDays className="mr-1 my-auto" /> 2019 - 2020
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_max-content_1fr] gap-x-6">
              <div>
                <h3 className="text-xs font-medium">Software Engineer II</h3>
                <span className="inline-block text-xs mb-4">Oracle</span>
                <div className="flex text-xs">
                  <LuCalendarDays className="mr-1 my-auto" /> 2018-2019
                </div>
              </div>

              <div>
                <span className="inline-block w-[13px] h-[13px] bg-[--text-color] rounded-[50%]"></span>
                <span className="block w-[1px] h-full bg-[var(--text-color)] translate-x-[6px] translate-y-[-7px]">
                  {" "}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_max-content_1fr] gap-x-6">
              <div></div>

              <div>
                <span className="inline-block w-[13px] h-[13px] bg-[--text-color] rounded-[50%]"></span>
                <span className="block w-[1px] h-full bg-[var(--text-color)] translate-x-[6px] translate-y-[-7px]"></span>
              </div>
              <div>
                <h3 className="text-xs font-medium">Frontend Engineer</h3>
                <span className="inline-block text-xs mb-4">
                  Kaiser Permanente
                </span>
                <div className="flex text-xs">
                  <LuCalendarDays className="mr-1 my-auto" /> 2016-2018
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default History;
