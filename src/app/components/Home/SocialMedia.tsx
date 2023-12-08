import { FaInstagram } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { CiLinkedin } from "react-icons/ci";

const SocialMedia = () => {
  return (
    <div className="flex gap-x-7 my-6 justify-center">
      <a
        href=""
        className="text-[var(--title-color)] text-xl duration-300 hover:text-[hsl(43,100%,68%)]"
        target="_blank"
      >
        <FaInstagram />
      </a>
      <a
        href=""
        className="text-[var(--title-color)] text-xl duration-300 hover:text-[hsl(43,100%,68%)]"
        target="_blank"
      >
        <FaGithub />
      </a>
      <a
        href=""
        className="text-[var(--title-color)] text-xl duration-300 hover:text-[hsl(43,100%,68%)]"
        target="_blank"
      >
        <CiLinkedin />
      </a>
    </div>
  );
};

export default SocialMedia;
