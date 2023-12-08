import Image from "next/image";
import { IoHomeOutline } from "react-icons/io5";
import { PiPerson } from "react-icons/pi";
import { LuGraduationCap } from "react-icons/lu";
import { IoLayersOutline } from "react-icons/io5";
import { FaCode } from "react-icons/fa";
import { BsChat } from "react-icons/bs";

const Sidebar = () => {
  return (
    <aside className="fixed flex flex-col justify-between w-[110px] bg-[var(--body-color)] l-0 t-0 border-r border-solid border-[rgba(0,0,0,0.5)] p-10 min-h-screen z-10">
      <a href="#home" className="nav__logo">
        <Image
          className="h-auto align-middle max-w-full"
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
                className="text-2xl text-[var(--title-color)] font-bold duration-300 hover:text-[hsl(43,100%,68%)]"
              >
                <IoHomeOutline />
              </a>
            </li>
            <li className="nav__item">
              <a
                href="#about"
                className="text-2xl text-[var(--title-color)] font-bold duration-300 hover:text-[hsl(43,100%,68%)]"
              >
                <PiPerson />
              </a>
            </li>
            <li className="nav__item">
              <a
                href="#resume"
                className="text-2xl text-[var(--title-color)] font-bold duration-300 hover:text-[hsl(43,100%,68%)]"
              >
                <LuGraduationCap />
              </a>
            </li>
            <li className="nav__item">
              <a
                href="#portfolio"
                className="text-2xl text-[var(--title-color)] font-bold duration-300 hover:text-[hsl(43,100%,68%)]"
              >
                <IoLayersOutline />
              </a>
            </li>
            <li className="nav__item">
              <a
                href="#skills"
                className="text-2xl text-[var(--title-color)] font-bold duration-300 hover:text-[hsl(43,100%,68%)]"
              >
                <FaCode />
              </a>
            </li>
            <li className="nav__item">
              <a
                href="#contact"
                className="text-2xl text-[var(--title-color)] font-bold duration-300 hover:text-[hsl(43,100%,68%)]"
              >
                <BsChat />
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="text-[hsl(245,15%,65%)] text-xs -rotate-180 [writing-mode:vertical-lr] mx-auto">
        <span className="copyright">&copy; 2023 - 2024</span>
      </div>
    </aside>
  );
};

export default Sidebar;
