"use client";

import { useState } from "react";
import Menu from "./Menu";
import Image from "next/image";
import { FaLink } from "react-icons/fa6";

const Portfolio = () => {
  const [items, setItems] = useState(Menu);

  const filterItems = (category: string) =>
    setItems(Menu.filter((item) => item?.category === category));

  return (
    <section
      className="work mx-auto max-w-[1080px] px-[15px] pb-8 pt-28"
      id="portfolio"
    >
      <h2 className="relative mb-14 ml-3.5 text-4xl font-bold">Recent Works</h2>

      <div className="mb-10 flex flex-wrap items-center gap-x-7 lg:justify-center">
        <span
          className="cursor-pointer font-bold duration-300 hover:text-[var(--primary-color)]"
          onClick={() => setItems(Menu)}
        >
          Everything
        </span>
        <span
          className="cursor-pointer font-bold duration-300 hover:text-[var(--primary-color)]"
          onClick={() => filterItems("React")}
        >
          React
        </span>
        <span
          className="cursor-pointer font-bold duration-300 hover:text-[var(--primary-color)]"
          onClick={() => filterItems("React Native")}
        >
          React Native
        </span>
        <span className="hover:text-[var(--primary-color)]pointer-events-none cursor-pointer font-bold duration-300">
          Golang
        </span>
      </div>

      <div className="grid grid-cols-3 gap-7 lg:grid-cols-[repeat(2,330px)] lg:justify-center lg:gap-y-[1.875rem] md:grid-cols-[310px] xs:grid-cols-1">
        {items.map((item) => {
          const { id, image, title, category }: any = item;

          return (
            <div
              className="group relative overflow-hidden rounded-xl shadow-2xl"
              key={id}
            >
              <div className="work__thumbnail">
                <Image
                  className="m-auto"
                  src={image}
                  width={200}
                  height={200}
                  alt={title}
                />
                <div className="absolute left-0 top-0 h-full w-full bg-[purple] opacity-0 duration-300 group-hover:opacity-90"></div>
              </div>

              <span className="absolute left-0 top-0 inline-block -translate-y-[40px] rounded-b-2xl bg-[var(--primary-color)] px-[0.625rem] py-[0.19rem] text-xs text-white duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {category}
              </span>
              <h3 className="absolute top-[3.75rem] mb-4 translate-y-[30px] px-5 text-xl text-white opacity-0 duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {title}
              </h3>
              <a
                href={item?.url}
                className="absolute bottom-6 left-6 flex h-[40px] w-[40px] cursor-pointer rounded-[50%] bg-[#ffd15c] text-center text-xl leading-[42px] text-white opacity-0 duration-300 group-hover:opacity-100"
                target="_blank"
              >
                <FaLink className="m-auto" />
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Portfolio;
