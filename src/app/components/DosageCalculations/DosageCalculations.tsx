import Shapes from "../Home/Shapes";
import TypedText from "../Typed/TypedText";
import Conversions from "./Conversions";
import Practice from "./Practice";
import ScenarioPractice from "./ScenarioPractice";
const DosageCalculations = () => {
  return (
    <>
      {/* A sibling of the section, not a child: see Nclex.tsx for why a
          `fixed` layer can't live inside an element that animates in. */}
      <div className="pointer-events-none fixed inset-y-0 left-20 right-0 z-0 overflow-hidden lg:left-0">
        <Shapes />
      </div>

      <section className="relative mx-auto max-w-[1080px] animate-fadeIn px-10 pb-24 pt-28 lg:pt-12 md:px-6">
        <h1 className="relative mb-2 ml-3.5 text-4xl font-bold lg:ml-0 lg:text-center">
          <TypedText text="Dosage Calculations" typeOnMount />
        </h1>
        <p className="mb-14 ml-3.5 lg:ml-0 lg:text-center">
          The conversions I keep having to look up, and drills until I stop.
        </p>

        <Conversions />
        <ScenarioPractice />
        <Practice />
      </section>
    </>
  );
};
export default DosageCalculations;
