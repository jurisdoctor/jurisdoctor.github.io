const ScrollDown = () => {
  return (
    <div className="w-full absolute bottom-10 left-0">
      <a href="#about" className="mouse__wrapper">
        <span className="text-xs">Scroll Down</span>
        <span className="h-6 w-5 relative  mt-3 mx-auto rounded-2xl block border-[2px] border-solid border-[#454360]">
          <span className="h-1 w-1 absolute top-2 left-[50%] -translate-x-2/4 bg-[var(--title-color)] rounded-[100%] animate-mouseBounce"></span>
        </span>
      </a>
    </div>
  );
};

export default ScrollDown;
