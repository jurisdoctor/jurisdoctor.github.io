import ScrollReset from "../components/ScrollReset";
import Round from "../components/HeadsUp/Round";
import { categoryOf } from "../components/HeadsUp/data";

const HeadsUpRound = ({ slug }: { slug: string }) => {
  const category = categoryOf(slug);
  if (!category) return null;
  return (
    <>
      <ScrollReset />
      <main>
        <Round category={category} />
      </main>
    </>
  );
};

export default HeadsUpRound;
