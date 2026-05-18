import AboutBox from "./AboutBox";
import SkillBar from "./SkillBar";
import DownloadCVButton from "./DownloadCVButton";

const About = () => {
  return (
    <section
      className="about mx-auto max-w-[1080px] animate-fadeIn px-[15px] pb-8 pt-28 lg:pt-12"
      id="about"
    >
      <h2 className="relative mb-14 ml-3.5 text-4xl font-bold lg:mb-8 lg:ml-0 lg:text-center">
        about
      </h2>

      <div className="grid grid-cols-[3fr_9fr] gap-x-7 xl:grid-cols-[720px] xl:justify-center xl:gap-x-[1.875rem] md:grid-cols-[320px] xs:grid-cols-1">
        <img
          className="h-auto max-w-full rounded-full align-middle xl:justify-self-center"
          src="/assets/cat-scuba.gif"
          width={125}
          height={125}
          alt="Picture of the author"
        />

        <div className="before:border-y-solid before:border-r-solid relative grid grid-cols-2 items-start gap-x-7 rounded-xl bg-[var(--container-color)] p-7 shadow-xl before:absolute before:left-[-0.93rem] before:top-[20%] before:h-0 before:w-0 before:border-y-[10px] before:border-r-[15px] before:border-y-transparent before:border-r-[var(--container-color)] before:content-[''] xl:before:left-[49%] xl:before:top-[-20px] xl:before:border-x-[10px] xl:before:border-x-transparent xl:before:border-b-white md:grid-cols-1 md:gap-y-7 md:before:left-[47%]">
          <div className="md:text-center">
            <p className="mb-4">
              This space is where lines of code converge into transformative
              creations. As a passionate developer, I breathe life into ideas
              and craft digital experiences that leave an impact.
            </p>
            <DownloadCVButton />
          </div>

          <div className="grid gap-y-5">
            <SkillBar
              name="React & React Native"
              percent={90}
              color="rgb(255,209,92)"
            />
            <SkillBar name="Python" percent={70} color="rgb(108,108,229)" />

            <div className="skills__data">
              <div className="mb-4 flex justify-between">
                <h3 className="text-base font-semibold">C++</h3>
                <span className="text-xs italic leading-5 text-[#8b88b1]">
                  in progress
                </span>
              </div>

              <div className="relative h-[7px] overflow-hidden rounded bg-[#f1f1f1]">
                <div className="absolute h-[7px] w-1/4 animate-indeterminate rounded bg-[rgb(68,215,182)]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AboutBox />
    </section>
  );
};

export default About;
