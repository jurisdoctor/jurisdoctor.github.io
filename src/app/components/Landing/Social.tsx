import { FaInstagram } from "react-icons/fa";
import { CiLinkedin } from "react-icons/ci";
import { FiGithub } from "react-icons/fi";

const Social = () => {
  return (
    <div className="grid grid-cols-[max-content] gap-4">
      <a
        href="https://www.instagram.com/tomtldr/"
        className="text-xl text-[var(--title-color)] hover:text-[var(--title-color-dark)]"
        target={"_blank"}
      >
        <FaInstagram />
      </a>
      <a
        href="https://www.linkedin.com/in/tomtldr"
        className="text-xl text-[var(--title-color)] hover:text-[var(--title-color-dark)]"
        target={"_blank"}
      >
        <CiLinkedin />
      </a>
      <a
        href="https://github.com/jurisdoctor"
        className="text-xl text-[var(--title-color)] hover:text-[var(--title-color-dark)]"
        target={"_blank"}
      >
        <FiGithub />
      </a>
    </div>
  );
};

export default Social;
