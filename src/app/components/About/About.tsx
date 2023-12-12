import Image from "next/image";
import AboutBox from "./AboutBox";

const About = () => {
  return (
    <section
      className="about mx-auto max-w-[1080px] px-[15px] pb-8 pt-28"
      id="about"
    >
      <h2 className="relative mb-14 ml-3.5 text-4xl font-bold">about</h2>

      <div className="grid grid-cols-[3fr_9fr] gap-x-7 xl:grid-cols-[720px] xl:justify-center xl:gap-x-[1.875rem] md:grid-cols-[320px] xs:grid-cols-1">
        <Image
          className="h-auto max-w-full align-middle xl:justify-self-center"
          src="/assets/avatar-2.svg"
          width={125}
          height={125}
          alt="Picture of the author"
        />

        <div className="before:border-y-solid before:border-r-solid relative grid grid-cols-2 items-start gap-x-7 rounded-xl bg-[var(--container-color)] p-7 shadow-xl before:absolute before:left-[-0.93rem] before:top-[20%] before:h-0 before:w-0 before:border-y-[10px] before:border-r-[15px] before:border-y-transparent before:border-r-[var(--container-color)] before:content-[''] xl:before:left-[49%] xl:before:top-[-20px] xl:before:border-x-[10px] xl:before:border-x-transparent xl:before:border-b-white md:grid-cols-1 md:gap-y-7 md:before:left-[47%]">
          <div className="md:text-center">
            <p className="mb-4 text-justify">
              This space is where lines of code converge into transformative
              creations. As a passionate developer, I breathe life into ideas
              and craft digital experiences that leave an impact.
            </p>
            <a
              href="/assets/resume.pdf"
              target="_blank"
              className="mb-1 inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse"
            >
              Download CV
            </a>
          </div>

          <div className="grid gap-y-5">
            <div className="skills__data">
              <div className="mb-4 flex justify-between">
                <h3 className="text-base font-semibold">
                  React & React Native
                </h3>
                <span className="leading-5">90%</span>
              </div>

              <div className="h-[7px] rounded bg-[#f1f1f1]">
                <div className="block h-[7px] w-[90%] rounded bg-[rgb(255,209,92)]"></div>
              </div>
            </div>

            <div className="skills__data">
              <div className="mb-4 flex justify-between">
                <h3 className="text-base font-semibold">Node</h3>
                <span className="leading-5">70%</span>
              </div>

              <div className="h-[7px] rounded bg-[#f1f1f1]">
                <div className="block h-[7px] w-[70%] rounded bg-[rgb(255,209,92)]"></div>
              </div>
            </div>

            <div className="skills__data">
              <div className="mb-4 flex justify-between">
                <h3 className="text-base font-semibold">Golang</h3>
                <span className="leading-5 ">75%</span>
              </div>

              <div className="h-[7px] rounded bg-[#f1f1f1]">
                <div className="block h-[7px] w-[75%] rounded bg-[rgb(255,209,92)]"></div>
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
