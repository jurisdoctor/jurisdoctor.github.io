import { FaNodeJs } from "react-icons/fa";
import { FaPython } from "react-icons/fa";
import { SiDjango } from "react-icons/si";
import { FaGolang } from "react-icons/fa6";

const Backend = () => {
  return (
    <div className="bg-[var(--container-color)] border-[1px] border-solid border-[rgba(0,0,0,0.1)] py-8 px-16 rounded-3xl">
      <h3 className="text-base font-medium text-center mb-6">Backend</h3>

      <div className="flex justify-center gap-x-10">
        <div className="grid items-start gap-y-4">
          <div className="flex gap-x-2">
            <FaNodeJs className="text-base text-[var(--title-color)]" />

            <div>
              <h3 className="text-base font-medium leading-[18px]">Node.js</h3>
              <span className="text-xs">Basic</span>
            </div>
          </div>
          <div className="flex gap-x-2">
            <FaPython className="text-base text-[var(--title-color)]" />

            <div>
              <h3 className="text-base font-medium leading-[18px]">Python</h3>
              <span className="text-xs">Intermediate</span>
            </div>
          </div>
          <div className="flex gap-x-2">
            <SiDjango className="text-base text-[var(--title-color)]" />

            <div>
              <h3 className="text-base font-medium leading-[18px]">Django</h3>
              <span className="text-xs">Basic</span>
            </div>
          </div>
        </div>
        <div className="grid items-start gap-y-4">
          <div className="flex gap-x-2">
            <FaGolang className="text-base text-[var(--title-color)]" />

            <div>
              <h3 className="text-base font-medium leading-[18px]">Golang</h3>
              <span className="text-xs">Basic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backend;
