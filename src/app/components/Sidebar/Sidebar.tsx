"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LuHome,
  LuCalculator,
  LuBookOpen,
  LuPill,
  LuMenu,
} from "react-icons/lu";
import { useState } from "react";
import { SCROLL_TO } from "../ScrollReset";
import ThemeToggle from "../ThemeToggle";
const Sidebar = () => {
  const [toggle, setToggle] = useState(false);
  const path = usePathname();
  const onLanding = path === "/";
  const router = useRouter();
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    setToggle(false);
    e.preventDefault();
    if (onLanding) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    sessionStorage.setItem(SCROLL_TO, id);
    router.push("/", { scroll: false });
  };
  const navLink =
    "text-2xl font-bold text-[var(--title-color)] duration-300 hover:text-[var(--accent-color)]";
  const sectionHref = (id: string) => (onLanding ? `#${id}` : `/#${id}`);
  const navToggle =
    "fixed left-[1.875rem] top-5 z-10 hidden h-[40px] w-[45px] cursor-pointer items-center justify-center border-[1px] border-solid border-[var(--border-color)] bg-[var(--body-color)] lg:flex rounded-lg duration-300 shadow-md";
  const aside =
    // min-h-[100dvh], not min-h-screen (100vh): on mobile, 100vh is the
    // viewport height with the browser's address bar hidden, which is
    // taller than what's actually visible while it's showing — the
    // justify-between pushed the theme toggle below the real fold, behind
    // the browser chrome, so it was there but unreachable. dvh tracks the
    // viewport that's actually visible. It's also a slim 80px icon rail at
    // every width — the old 110px with p-10 padding read as oversized for
    // what's just a handful of icons. Page screens offset their <main> by the
    // same 80px (ml-20), as do the floating-shapes layers (left-20).
    "l-0 t-0 fixed z-10 flex min-h-[100dvh] w-20 flex-col justify-between border-r border-solid border-[var(--border-color)] bg-[var(--body-color)] p-6 lg:left-[-80px] duration-300";
  return (
    <>
      {toggle && (
        <div
          className="fixed inset-0 z-[9] hidden bg-[rgba(0,0,0,0.2)] lg:block"
          onClick={() => setToggle(false)}
          aria-hidden
        />
      )}

      <aside className={toggle ? `${aside} lg:!left-0` : `${aside}`}>
        <Link
          href={sectionHref("home")}
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
        </Link>

        <nav className="nav">
          <div className="nav__menu">
            <ul className="flex flex-col gap-y-4">
              <li className="nav__item">
                <Link
                  href={sectionHref("home")}
                  onClick={(e) => scrollToSection(e, "home")}
                  className={navLink}
                >
                  <LuHome />
                </Link>
              </li>
              <li className="nav__item">
                <Link
                  href="/dosage-calculations"
                  onClick={() => setToggle(false)}
                  className={`${navLink} ${path === "/dosage-calculations" ? "!text-[var(--accent-color)]" : ""}`}
                >
                  <LuCalculator />
                </Link>
              </li>

              <li className="nav__item">
                <Link
                  href="/nclex"
                  onClick={() => setToggle(false)}
                  className={`${navLink} ${path === "/nclex" ? "!text-[var(--accent-color)]" : ""}`}
                >
                  <LuBookOpen />
                </Link>
              </li>

              <li className="nav__item">
                <Link
                  href="/medications"
                  onClick={() => setToggle(false)}
                  aria-label="Drug guide"
                  title="Drug guide"
                  className={`${navLink} ${path.startsWith("/medications") ? "!text-[var(--accent-color)]" : ""}`}
                >
                  <LuPill />
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="mx-auto">
          <ThemeToggle />
        </div>
      </aside>

      <div
        className={toggle ? `${navToggle} lg:left-[110px]` : `${navToggle}`}
        onClick={() => setToggle(!toggle)}
      >
        <LuMenu />
      </div>
    </>
  );
};
export default Sidebar;
