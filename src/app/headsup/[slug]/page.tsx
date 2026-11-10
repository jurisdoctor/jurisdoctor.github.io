import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HeadsUpRound from "../../screen/HeadsUpRound";
import { CATEGORIES, categoryOf } from "../../components/HeadsUp/data";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  return {
    title: `${categoryOf(params.slug)?.name ?? "Heads Up!"} · Culture Project: Heads Up! Philippines!`,
  };
}

const HeadsUpRoundPage = ({ params }: { params: { slug: string } }) => {
  const category = categoryOf(params.slug);
  if (!category) notFound();
  return <HeadsUpRound slug={category.slug} />;
};

export default HeadsUpRoundPage;
