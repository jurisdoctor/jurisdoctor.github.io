import React from "react";

const Data = () => {
  return (
    <div className="home__data">
      <h1 className="text-4xl mb-2">tom phan 👋🏼</h1>
      <h3 className="relative mb-2 font-normal">mathematician</h3>
      <p className="mw-[400px] mb-8">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur
        ducimus illo et aspernatur, fugiat eveniet.
      </p>
      <a
        href="#contact"
        className="inline-flex  bg-[var(--title-color)] text-[var(--container-color)] py-5 px-8 rounded-2xl font-medium button--flex items-center"
      >
        say hello 📨
      </a>
    </div>
  );
};

export default Data;
