import { FaInstagram } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { CiLinkedin } from "react-icons/ci";

const SocialMedia = () => {
  return (
    <div className="my-6 flex justify-center gap-x-7">
      <a
        href=""
        className="text-xl text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)] xl:text-[1.125rem]"
        target="_blank"
      >
        <FaInstagram />
      </a>
      <a
        href=""
        className="text-xl text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)] xl:text-[1.125rem]"
        target="_blank"
      >
        <FaGithub />
      </a>
      <a
        href=""
        className="text-xl text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)] xl:text-[1.125rem]"
        target="_blank"
      >
        <CiLinkedin />
      </a>
    </div>
  );
};

export default SocialMedia;
