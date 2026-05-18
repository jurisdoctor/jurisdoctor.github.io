"use client";

const ScrollDown = () => {
  return (
    <div className="absolute bottom-10 left-0 z-10 flex w-full justify-center">
      <a
        href="#about"
        onClick={(e) => {
          e.preventDefault();
          document
            .getElementById("about")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        className="inline-flex flex-col items-center"
      >
        <span className="text-xs">Scroll Down</span>
        <span className="relative mx-auto mt-3  block h-6 w-5 rounded-xl border-[2px] border-solid border-[#454360]">
          <span className="absolute left-[50%] top-2 h-1 w-1 -translate-x-2/4 animate-mouseBounce rounded-[100%] bg-[var(--title-color)]"></span>
        </span>
      </a>
    </div>
  );
};

export default ScrollDown;
