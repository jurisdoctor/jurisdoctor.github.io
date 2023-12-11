import Image from "next/image";
import SocialMedia from "./SocialMedia";
import ScrollDown from "./ScrollDown";
import Shapes from "./Shapes";

const Home = () => {
  return (
    <section
      className="relative mx-auto flex min-h-screen max-w-[1008px] items-center justify-center px-[15px]"
      id="home"
    >
      <div className="max-w-[540px] text-center">
        <Image
          className="mx-auto mb-6 h-auto max-w-full"
          src="/assets/avatar-1.svg"
          width={125}
          height={125}
          alt="Picture of the author"
        />
        <h1 className="text-2xl font-bold">tom phan</h1>
        <span className="home__education">software + math</span>

        <SocialMedia />

        <a
          href="#contact"
          className="mb-1 inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse"
        >
          Poke!
        </a>

        <ScrollDown />
      </div>
      <Shapes />
    </section>
  );
};

export default Home;
