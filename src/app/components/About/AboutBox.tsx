import { LuRocket, LuCoffee, LuDumbbell } from "react-icons/lu";
import { FaYelp } from "react-icons/fa";
import Reveal from "../Reveal";

const STATS = [
  { Icon: LuRocket, value: "113", label: "Projects Completed" },
  { Icon: LuCoffee, value: "1992", label: "Energy Drinks" },
  { Icon: LuDumbbell, value: "1035", label: "1000lb Club" },
  { Icon: FaYelp, value: "5", label: "Yelp Elite Years" },
];

const AboutBox = () => {
  return (
    <div className="mt-16 grid grid-cols-4 justify-items-center gap-x-7 md:grid-cols-[repeat(2,150px)] md:justify-center md:gap-y-6">
      {STATS.map(({ Icon, value, label }, index) => (
        <Reveal key={label} delay={index * 100} className="flex gap-x-6">
          <Icon className="text-4xl text-[var(--icon-muted-color)]" />

          <div>
            <h3 className="text-3xl">{value}</h3>
            <span className="text-sm">{label}</span>
          </div>
        </Reveal>
      ))}
    </div>
  );
};

export default AboutBox;
