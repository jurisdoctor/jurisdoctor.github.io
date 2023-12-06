import Image from "next/image";
import Info from "./Info";

const About = () => {
  return (
    <section className="2xl:gap-10 pt-24 pb-8" id="about">
      <h2 className="text-4xl text-[var(--title-color)] text-center">
        About Me
      </h2>
      <span className="block text-sm text-center mb-16">Introduction</span>

      <div className="2xl:grid-cols-1 grid-cols-[repeat(2,1fr)] gap-16 items-center max-w-[968px] mx-auto grid">
        <Image
          className="2xl:w-[220px] w-[350px] rounded-3xl justify-self-center"
          src="/assets/about.png"
          height={500}
          width={500}
          alt="Picture of Tom"
        />

        <div className="2xl:text-center">
          <Info />
          <p className="2xl:px-20 2xl:mb-8 pr-16 mb-10">
            Experienced Senior Frontend Engineer with a demonstrated history of
            working in Startup & Enterprise companies building Web and iOS +
            Android Applications.
          </p>

          <a
            href="/assets/cv.pdf"
            target="_blank"
            className="inline-flex bg-[var(--title-color)] text-[var(--container-color)] py-5 px-8 rounded-2xl font-medium button--flex"
          >
            Download CV 📁
          </a>
        </div>
      </div>
    </section>
  );
};

export default About;
