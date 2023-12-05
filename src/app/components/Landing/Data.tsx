import React from "react";

const Data = () => {
  return (
    <div className="xl:col-start-1 xl:col-end-3">
      <h1 className="xl:pt-8 text-4xl mb-2">tom phan 👋🏼</h1>
      <h3 className="2xl:mb-4 relative mb-2 font-normal">mathematician</h3>
      <p className="2xl:mw-[var(--top-initial)] 2xl:mb-10 mw-[400px] mb-8">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur
        ducimus illo et aspernatur, fugiat eveniet.
      </p>
      <a
        href="#contact"
        className="inline-flex bg-[var(--title-color)] text-[var(--container-color)] py-5 px-8 rounded-2xl font-medium button--flex items-center"
      >
        say hello 📨
      </a>
    </div>
  );
};

export default Data;
