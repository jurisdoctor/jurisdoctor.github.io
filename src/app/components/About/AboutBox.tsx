import { LuRocket, LuCoffee, LuDumbbell } from "react-icons/lu";
import { FaYelp } from "react-icons/fa";

const AboutBox = () => {
  return (
    <div className="mt-16 grid grid-cols-4 justify-items-center gap-x-7 md:grid-cols-[repeat(2,150px)] md:justify-center md:gap-y-6">
      <div className="flex gap-x-6">
        <LuRocket className="text-4xl text-[#dedeea]" />

        <div>
          <h3 className="text-3xl">113</h3>
          <span className="text-sm">Projects Completed</span>
        </div>
      </div>

      <div className="flex gap-x-6">
        <LuCoffee className="text-4xl text-[#dedeea]" />

        <div>
          <h3 className="text-3xl">1992</h3>
          <span className="text-sm">Energy Drinks</span>
        </div>
      </div>

      <div className="flex gap-x-6">
        <LuDumbbell className="text-4xl text-[#dedeea]" />

        <div>
          <h3 className="text-3xl">1035</h3>
          <span className="text-sm">1000lb Club</span>
        </div>
      </div>

      <div className="flex gap-x-6">
        <FaYelp className="text-4xl text-[#dedeea]" />

        <div>
          <h3 className="text-3xl">5</h3>
          <span className="text-sm">Yelp Elite Years</span>
        </div>
      </div>
    </div>
  );
};

export default AboutBox;
