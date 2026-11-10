import { ReactNode } from "react";
import { TITLE } from "./game";

const Shell = ({
  children,
  wide = false,
  title = TITLE,
}: {
  children: ReactNode;
  wide?: boolean;
  title?: string;
}) => (
  <section
    className={`mx-auto flex min-h-screen flex-col items-center justify-center px-10 py-16 md:px-6 ${
      wide ? "max-w-[980px]" : "max-w-[760px]"
    }`}
  >
    <h1 className="mb-8 max-w-[34rem] animate-fadeIn text-center text-4xl font-bold leading-tight lg:text-3xl">
      {title}
    </h1>
    {children}
  </section>
);

export default Shell;
