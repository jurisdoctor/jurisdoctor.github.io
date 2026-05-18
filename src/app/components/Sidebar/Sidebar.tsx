"use client";

import Image from "next/image";
import {
  LuHome,
  LuUser,
  LuFileText,
  LuLayers,
  LuCode,
  LuMessageCircle,
  LuMenu,
} from "react-icons/lu";
import { useState } from "react";

const Sidebar = () => {
  const [toggle, setToggle] = useState(false);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navToggle =
    "fixed left-[1.875rem] top-5 z-10 hidden h-[40px] w-[45px] cursor-pointer items-center justify-center border-[1px] border-solid border-[#e8dfec] bg-[var(--body-color)] lg:flex rounded-lg duration-300 shadow-md";

  const aside =
    "l-0 t-0 fixed z-10 flex min-h-screen w-[110px] flex-col justify-between border-r border-solid border-[rgba(0,0,0,0.5)] bg-[var(--body-color)] p-10 lg:left-[-110px] duration-300";

  return (
    <>
      <aside className={toggle ? `${aside} lg:!left-0` : `${aside}`}>
        <a
          href="#home"
          onClick={(e) => scrollToSection(e, "home")}
          className="nav__logo"
        >
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
                  onClick={(e) => scrollToSection(e, "home")}
                  className="text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
                >
                  <LuHome />
                </a>
              </li>
              <li className="nav__item">
                <a
                  href="#about"
                  onClick={(e) => scrollToSection(e, "about")}
                  className="text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
                >
                  <LuUser />
                </a>
              </li>
              <li className="nav__item">
                <a
                  href="#resume"
                  onClick={(e) => scrollToSection(e, "resume")}
                  className="text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
                >
                  <LuFileText />
                </a>
              </li>
              {/* <li className="nav__item">
                <a
                  href="#portfolio"
                  className="text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
                >
                  <LuLayers />
                </a>
              </li> */}
              {/* <li className="nav__item">
                <a
                  href="#skills"
                  className="text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
                >
                  <LuCode />
                </a>
              </li> */}
              <li className="nav__item">
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, "contact")}
                  className="text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)]"
                >
                  <LuMessageCircle />
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="mx-auto -rotate-180 text-xs text-[hsl(245,15%,65%)] [writing-mode:vertical-lr]">
          <span className="copyright">&copy; 2023 - Present</span>
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
