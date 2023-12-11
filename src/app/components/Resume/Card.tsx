import { LuGraduationCap } from "react-icons/lu";
import { BsSuitcaseLg } from "react-icons/bs";

export interface CardType {
  category: string;
  year: string;
  title: string;
  desc: string;
}

const Card = ({ category, year, title, desc }: CardType) => {
  return (
    <div className="relative pb-4 pl-12 before:absolute before:left-1 before:top-0 before:h-full before:w-px before:bg-[var(--primary-color)] before:content-[''] last:pb-0">
      {category === "education" ? (
        <LuGraduationCap className="absolute -left-[0.4375rem] top-0 bg-[var(--container-color)] py-[0.3rem] text-2xl text-[var(--primary-color)]" />
      ) : (
        <BsSuitcaseLg className="absolute -left-[0.4375rem] top-0 bg-[var(--container-color)] py-[0.3rem] text-2xl text-[var(--primary-color)]" />
      )}
      <span className="text-sm text-[#8b88b1]">{year}</span>
      <h3 className="my-1 text-xl">{title}</h3>
      <p className="text-xs">{desc}</p>
    </div>
  );
};

export default Card;
