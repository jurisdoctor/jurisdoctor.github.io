import { FiAward } from "react-icons/fi";
import { IoBriefcaseOutline } from "react-icons/io5";
import { FaCode } from "react-icons/fa";

const Info = () => {
  return (
    <div className="2xl:justify-center lg:grid-cols-3 lg:p-0 grid grid-cols-[repeat(3,140px)] gap-2 mb-8">
      <div className="2xl:py-3 2xl:px-2 bg-[var(--container-color)] border-[1px] border-solid border-[rgba(0,0,0,0.1)] rounded-xl text-center p-4">
        <FiAward className="text-2xl text-[var(--title-color)] mb-2 mx-auto" />
        <h3 className="text-sm font-medium">Experience</h3>
        <span className="text-xs">7 Years+</span>
      </div>

      <div className="bg-[var(--container-color)] border-[1px] border-solid border-[rgba(0,0,0,0.1)] rounded-xl text-center py-4 px-4">
        <FaCode className="text-2xl text-[var(--title-color)] mb-2 mx-auto" />
        <h3 className="text-sm font-medium">Lines of Code?</h3>
        <span className="text-xs">10k+</span>
      </div>

      <div className="bg-[var(--container-color)] border-[1px] border-solid border-[rgba(0,0,0,0.1)] rounded-xl text-center py-4 px-4">
        <IoBriefcaseOutline className="text-2xl text-[var(--title-color)] mb-2 mx-auto" />
        <h3 className="text-sm font-medium">1000lb Club?</h3>
        <span className="text-xs">YES</span>
      </div>
    </div>
  );
};

export default Info;
