import { FaGithubAlt, FaHome } from "react-icons/fa";
import { GiAnatomy, GiAtomCore } from "react-icons/gi";
import { SiMinutemailer } from "react-icons/si";
import { IoIosClose } from "react-icons/io";
import { AiOutlineAppstoreAdd } from "react-icons/ai";

const Header = () => {
  return (
    <header>
      <nav>
        <a href="/">tom</a>

        <div>
          <ul>
            <li>
              <a href="#home">
                <FaHome />
              </a>
            </li>
            <li>
              <a href="#about">
                <GiAnatomy />
              </a>
            </li>
            <li>
              <a href="#skills">
                <GiAtomCore />
              </a>
            </li>
            <li>
              <a href="#portfolio">
                <FaGithubAlt />
              </a>
            </li>
            <li>
              <a href="#contact">
                <SiMinutemailer />
              </a>
            </li>
          </ul>

          <IoIosClose />
        </div>

        <div>
          <AiOutlineAppstoreAdd />
        </div>
      </nav>
    </header>
  );
};

export default Header;
