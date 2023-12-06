import Backend from "./Backend";
import Frontend from "./Frontend";

const Skills = () => {
  return (
    <section className="skills pt-24 pb-8" id="skills">
      <h2 className="text-4xl text-[var(--title-color)] text-center">Skills</h2>
      <span className="block text-sm text-center mb-16">
        Technical Aptitude
      </span>

      <div className="2xl:grid-cols-[max-content] 2xl:gap-x-8 max-w-[968px] grid-cols-[repeat(2,350px)] gap-12 justify-center mx-auto container grid">
        <Frontend />
        <Backend />
      </div>
    </section>
  );
};

export default Skills;
