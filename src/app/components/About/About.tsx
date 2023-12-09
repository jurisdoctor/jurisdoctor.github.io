import Image from "next/image";
import AboutBox from "./AboutBox";

const About = () => {
  return (
    <section
      className="about max-w-[1080px] mx-auto px-[15px] pt-28 pb-8"
      id="about"
    >
      <h2 className="relative text-4xl font-bold ml-3.5 mb-14">about</h2>

      <div className="grid-cols-[3fr_9fr] gap-x-7 grid">
        <Image
          className="h-auto align-middle max-w-full"
          src="/assets/avatar-2.svg"
          width={125}
          height={125}
          alt="Picture of the author"
        />

        <div className="relative p-7 bg-[var(--container-color)] rounded-2xl shadow-xl grid grid-cols-2 gap-x-7 items-start before:content-[''] before:w-0 before:h-0 before:border-y-[10px] before:border-y-solid before:border-y-transparent before:border-r-[15px] before:border-r-solid before:border-r-[var(--container-color)] before:absolute before:left-[-0.93rem] before:top-[20%]">
          <div className="about__info">
            <p className="mb-4 text-justify">
              This space is where lines of code converge into transformative
              creations. As a passionate developer, I breathe life into ideas
              and craft digital experiences that leave an impact.
            </p>
            <a
              href=""
              className="inline-block bg-[var(--primary-color)] border-[1px] border-solid border-transparent rounded-[1.875rem] text-white font-bold leading-4 py-3 px-8 mb-1 shadow-lg hover:animate-pulse"
            >
              Download CV
            </a>
          </div>

          <div className="gap-y-5 grid">
            <div className="skills__data">
              <div className="flex justify-between mb-4">
                <h3 className="text-base font-semibold">
                  React & React Native
                </h3>
                <span className="leading-5">90%</span>
              </div>

              <div className="h-[7px] rounded bg-[#f1f1f1]">
                <div className="h-[7px] rounded block w-[90%] bg-[rgb(255,209,92)]"></div>
              </div>
            </div>

            <div className="skills__data">
              <div className="flex justify-between mb-4">
                <h3 className="text-base font-semibold">Node</h3>
                <span className="leading-5">70%</span>
              </div>

              <div className="h-[7px] rounded bg-[#f1f1f1]">
                <div className="h-[7px] rounded block w-[70%] bg-[rgb(255,209,92)]"></div>
              </div>
            </div>

            <div className="skills__data">
              <div className="flex justify-between mb-4">
                <h3 className="text-base font-semibold">Golang</h3>
                <span className="leading-5 ">75%</span>
              </div>

              <div className="h-[7px] rounded bg-[#f1f1f1]">
                <div className="h-[7px] rounded block w-[75%] bg-[rgb(255,209,92)]"></div>
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
