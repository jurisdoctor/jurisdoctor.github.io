import { LiaAtomSolid } from "react-icons/lia";
import { GrHtml5 } from "react-icons/gr";
import { TbBrandCss3 } from "react-icons/tb";
import { IoLogoJavascript } from "react-icons/io";
import { FaReact } from "react-icons/fa";
import { TbBrandNextjs } from "react-icons/tb";

const Frontend = () => {
  return (
    <div className="lg:grid-cols-1 bg-[var(--container-color)] border-[1px] border-solid border-[rgba(0,0,0,0.1)] py-8 px-16 rounded-3xl">
      <h3 className="text-base font-medium text-center mb-6">Frontend</h3>

      <div className="flex justify-center gap-x-10">
        <div className="grid items-start gap-y-4">
          <div className="flex gap-x-2">
            <GrHtml5 className="text-base text-[var(--title-color)]" />

            <div>
              <h3 className="text-base font-medium leading-[18px]">HTML</h3>
              <span className="text-xs ">Advanced</span>
            </div>
          </div>
          <div className="flex gap-x-2">
            <TbBrandCss3 className="text-base text-[var(--title-color)]" />

            <div>
              <h3 className="text-base font-medium leading-[18px]">CSS</h3>
              <span className="text-xs ">Advanced</span>
            </div>
          </div>
          <div className="flex gap-x-2">
            <IoLogoJavascript className="text-base text-[var(--title-color)]" />

            <div>
              <h3 className="text-base font-medium leading-[18px]">
                JavaScript
              </h3>
              <span className="text-xs ">Advanced</span>
            </div>
          </div>
        </div>
        <div className="grid items-start gap-y-4">
          <div className="flex gap-x-2">
            <FaReact className="text-base text-[var(--title-color)]" />

            <div>
              <h3 className="text-base font-medium leading-[18px]">React</h3>
              <span className="text-xs ">Advanced</span>
            </div>
          </div>
          <div className="flex gap-x-2">
            <LiaAtomSolid className="text-base text-[var(--title-color)]" />

            <div>
              <h3 className="text-base font-medium leading-[18px]">
                React Native
              </h3>
              <span className="text-xs ">Intermediate</span>
            </div>
          </div>
          <div className="flex gap-x-2">
            <TbBrandNextjs className="text-base text-[var(--title-color)]" />

            <div>
              <h3 className="text-base font-medium leading-[18px]">Next.js</h3>
              <span className="text-xs ">Intermediate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Frontend;
