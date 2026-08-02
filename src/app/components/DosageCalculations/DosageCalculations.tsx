import Conversions from "./Conversions";
import Practice from "./Practice";
import ScenarioPractice from "./ScenarioPractice";

const DosageCalculations = () => {
  return (
    <section className="mx-auto max-w-[1080px] animate-fadeIn px-10 pb-24 pt-28 lg:pt-12 md:px-6">
      <h1 className="relative mb-2 ml-3.5 text-4xl font-bold lg:ml-0 lg:text-center">
        Dosage Calculations
      </h1>
      <p className="mb-14 ml-3.5 lg:ml-0 lg:text-center">
        A reference for the conversions, and a spot to practice them.
      </p>

      <Conversions />
      <ScenarioPractice />
      <Practice />
    </section>
  );
};

export default DosageCalculations;
