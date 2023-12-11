import Card from "./Card";
import Data from "./Data";

const Resume = () => {
  return (
    <section
      className="resume mx-auto max-w-[1080px] px-[15px] pb-8 pt-28"
      id="resume"
    >
      <h2 className="relative mb-14 ml-3.5 text-4xl font-bold">Experience</h2>

      <div className="grid grid-cols-2 gap-x-7 sm:grid-cols-1 lg:grid-cols-[450px] lg:justify-center lg:gap-y-[1.875rem]">
        <div className="relative grid rounded-xl bg-[var(--container-color)] p-7 shadow-2xl">
          {Data.map((val, id) => {
            if (val.category === "education") {
              return (
                <Card
                  key={id}
                  title={val.title}
                  year={val.year}
                  desc={val.desc}
                  category={val.category}
                />
              );
            }
          })}
        </div>
        <div className="relative grid rounded-xl bg-[var(--container-color)] p-7 shadow-2xl">
          {Data.map((val, id) => {
            if (val.category === "experience") {
              return (
                <Card
                  key={id}
                  title={val.title}
                  year={val.year}
                  desc={val.desc}
                  category={val.category}
                />
              );
            }
          })}
        </div>
      </div>
    </section>
  );
};

export default Resume;
