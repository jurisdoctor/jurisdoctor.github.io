"use client";

import Image from "next/image";
import { IoHomeOutline } from "react-icons/io5";
import { PiPerson } from "react-icons/pi";
import { LuGraduationCap } from "react-icons/lu";
import { IoLayersOutline } from "react-icons/io5";
import { FaCode } from "react-icons/fa";
import { BsChat } from "react-icons/bs";
import { LuMenu } from "react-icons/lu";
import { useState } from "react";

const Sidebar = () => {
  const [toggle, setToggle] = useState(false);

  const navToggle =
    "fixed left-7 top-5 z-10 flex h-[40px] w-[45px] cursor-pointer items-center justify-center border-[1px] border-solid border-[#e8dfec] bg-[var(--body-color)] lg:flex duration-300";

  const aside =
    "l-0 t-0 fixed z-10 flex min-h-screen w-[110px] flex-col justify-between border-r border-solid border-[rgba(0,0,0,0.5)] bg-[var(--body-color)] p-10 lg:left-[-110px] duration-300";

  return (
    <>
      <aside className={toggle ? `${aside} lg:left-0` : `${aside}`}>
        <a href="#home" className="nav__logo">
          <Image
            className="h-auto max-w-full align-middle"
            src="/assets/logo.svg"
            width={40}
            height={40}
            alt="Picture of the author"
          />
        </a>

        <nav className="nav">
          <div className="nav__menu">
            <ul className="flex flex-col gap-y-4">
              <li className="nav__item">
                <a
                  href="#home"
                  className="text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
                >
                  <IoHomeOutline />
                </a>
              </li>
              <li className="nav__item">
                <a
                  href="#about"
                  className="text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
                >
                  <PiPerson />
                </a>
              </li>
              <li className="nav__item">
                <a
                  href="#resume"
                  className="text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
                >
                  <LuGraduationCap />
                </a>
              </li>
              <li className="nav__item">
                <a
                  href="#portfolio"
                  className="text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
                >
                  <IoLayersOutline />
                </a>
              </li>
              {/* <li className="nav__item">
                <a
                  href="#skills"
                  className="text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
                >
                  <FaCode />
                </a>
              </li> */}
              <li className="nav__item">
                <a
                  href="#contact"
                  className="text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
                >
                  <BsChat />
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="mx-auto -rotate-180 text-xs text-[hsl(245,15%,65%)] [writing-mode:vertical-lr]">
          <span className="copyright">&copy; 2023 - 2024</span>
        </div>
      </aside>

      <div
        className={toggle ? `${navToggle} lg:left-[140px]` : `${navToggle}`}
        onClick={() => setToggle(!toggle)}
      >
        <LuMenu />
      </div>
    </>
  );
};

export default Sidebar;
