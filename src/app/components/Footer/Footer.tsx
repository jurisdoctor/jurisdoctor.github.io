import { FaFacebook } from "react-icons/fa";
import { FaYelp } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[var(--container-color)] border-[1px] border-solid border-[rgba(0,0,0,0.1)]">
      <div className="pt-8 pb-8 max-w-[968px] mx-auto">
        <h1 className="text-[var(--title-color)] text-center mb-8 text-2xl font-semibold">
          tom
        </h1>

        <ul className="flex justify-center gap-x-6 mb-8">
          <li>
            <a
              href="#about"
              className="text-[var(--title-color)] hover:text-[var(--title-color-dark)]"
            >
              about
            </a>
          </li>
          <li>
            <a
              href="#skills"
              className="text-[var(--title-color)] hover:text-[var(--title-color-dark)]"
            >
              skills
            </a>
          </li>
          <li>
            <a
              href="#portfolio"
              className="text-[var(--title-color)] hover:text-[var(--title-color-dark)]"
            >
              portfolio
            </a>
          </li>
        </ul>

        <div className="flex justify-center gap-x-5">
          <a
            href="https://www.facebook.com/tomtldr/"
            className="text-xl text-[var(--title-color)] hover:text-[var(--title-color-dark)]"
            target={"_blank"}
          >
            <FaFacebook />
          </a>
          <a
            href="https://www.yelp.com/user_details?userid=2r1p3ulD_9UhPOXvqb50VA"
            className="text-xl text-[var(--title-color)] hover:text-[var(--title-color-dark)]"
            target={"_blank"}
          >
            <FaYelp />
          </a>
          <a
            href="https://www.tiktok.com/@tomtldr"
            className="text-xl text-[var(--title-color)] hover:text-[var(--title-color-dark)]"
            target={"_blank"}
          >
            <FaTiktok />
          </a>
        </div>
        <span className="block mt-16 text-[var(--title-color)] text-center text-xs">
          &#169; all rights reserved
        </span>
      </div>
    </footer>
  );
};

export default Footer;
