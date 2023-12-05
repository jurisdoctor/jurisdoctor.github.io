"use client";

import { FaGithubAlt, FaHome } from "react-icons/fa";
import { GiAnatomy, GiAtomCore } from "react-icons/gi";
import { SiMinutemailer } from "react-icons/si";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { GrClose } from "react-icons/gr";
import { useState } from "react";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <header className="xl:bottom-0 xl:top-[var(--top-initial)] w-full fixed top-0 left-0 z-[var(--z-fixed)] bg-[var(--body-color)]">
      <nav className="max-w-[968px] 2xl:mx-[var(--mb-1-5)] xl:h-[var(--header-height)] m-auto h-[calc(var(--header-height)+1.5rem)] flex justify-between items-center gap-6">
        <a href="/">tom</a>

        <div
          className={`xl:fixed ${
            showMenu ? "xl:bottom-0" : "xl:bottom-[var(--bottom-negative)]"
          } xl:duration-500 xl:left-0 xl:w-full xl:bg-[var(--body-color)] xl:pt-8 xl:px-6 xl:pb-16 xl:shadow xl:shadow-slate-800 xl:rounded-t-3xl sm:px-1`}
        >
          <ul className="xl:grid xl:grid-cols-3 xl:gap-2 sm:gap-0 gap-x-3 list-none flex">
            <li className="xl:m-auto">
              <a
                href="#home"
                className="text-[var(--title-color-dark)] hover:text-[var(--title-color-dark)] items-center text-sm duration-300"
              >
                <FaHome className="xl:block xl:text-xl xl:m-auto my-auto hidden" />
                <span>home</span>
              </a>
            </li>
            <li className="xl:m-auto">
              <a
                href="#about"
                className="hover:text-[var(--title-color-dark)] items-center text-sm duration-300"
              >
                <GiAnatomy className="xl:block xl:text-xl xl:m-auto my-auto hidden" />
                <span>about</span>
              </a>
            </li>
            <li className="xl:m-auto">
              <a
                href="#skills"
                className="hover:text-[var(--title-color-dark)] items-center text-sm duration-300"
              >
                <GiAtomCore className="xl:block xl:text-xl xl:m-auto my-auto hidden" />
                <span>skills</span>
              </a>
            </li>
            <li className="xl:m-auto">
              <a
                href="#portfolio"
                className="hover:text-[var(--title-color-dark)] items-center text-sm duration-300"
              >
                <FaGithubAlt className="xl:block xl:text-xl xl:m-auto my-auto hidden" />
                <span>portfolio</span>
              </a>
            </li>
            <li className="xl:m-auto">
              <a
                href="#contact"
                className="hover:text-[var(--title-color-dark)] items-center text-sm duration-300"
              >
                <SiMinutemailer className="xl:block xl:text-xl xl:m-auto my-auto hidden" />
                <span>contact</span>
              </a>
            </li>
          </ul>

          <GrClose
            className="xl:block xl:text-2xl xl:absolute xl:right-5 xl:bottom-10 xl:cursor-pointer xl:text-[var(--title-cover)]  xl:hover:text-[var(--title-color-dark)] hidden"
            onClick={() => setShowMenu(!showMenu)}
          />
        </div>

        <div
          className="xl:block xl:cursor-pointer xl:text-lg hidden"
          onClick={() => setShowMenu(!showMenu)}
        >
          <AiOutlineAppstoreAdd />
        </div>
      </nav>
    </header>
  );
};

export default Header;
