import type { Metadata } from "next";
import HeadsUpScreen from "../screen/HeadsUpScreen";

export const metadata: Metadata = {
  title: "Culture Project: Heads Up! Philippines!",
  description: "Culture Project: Heads Up! Philippines!",
};

const HeadsUpPage = () => {
  return <HeadsUpScreen />;
};

export default HeadsUpPage;
