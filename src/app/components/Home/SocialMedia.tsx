import { FaInstagram } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { CiLinkedin } from "react-icons/ci";

const SocialMedia = () => {
  return (
    <div className="my-6 flex justify-center gap-x-7">
      <a
        href="https://www.instagram.com/tomtldr"
        className="text-xl text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)] xl:text-[1.125rem]"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaInstagram />
      </a>
      <a
        href="https://github.com/jurisdoctor"
        className="text-xl text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)] xl:text-[1.125rem]"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithub />
      </a>
      <a
        href="https://www.linkedin.com/in/tomtldr"
        className="text-xl text-[var(--title-color)] duration-300 hover:text-[hsl(43,100%,68%)] xl:text-[1.125rem]"
        target="_blank"
        rel="noopener noreferrer"
      >
        <CiLinkedin />
      </a>
    </div>
  );
};

export default SocialMedia;
