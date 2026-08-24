import Sidebar from "../components/Sidebar";
import Shapes from "../components/Home/Shapes";
import ScrollReset from "../components/ScrollReset";

// Under construction. To restore the question bank:
//   1. put questions.json back in src/app/components/Nclex/
//   2. drop that path from .gitignore
//   3. drop "src/app/components/Nclex" from exclude in tsconfig.json,
//      otherwise the page builds but the components are never typechecked
//   4. uncomment the two imports and the Gate block below, and delete the
//      placeholder section
// import Nclex from "../components/Nclex";
// import Gate from "../components/Nclex/Gate";

const NclexScreen = () => {
  return (
    <>
      <ScrollReset />
      <Sidebar />

      <main className="ml-[110px] lg:ml-0">
        {/*
        <Gate>
          <Nclex />
        </Gate>
        */}

        <section className="relative mx-auto flex min-h-screen max-w-[1080px] items-center justify-center px-10 md:px-6">
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <Shapes />
          </div>

          <div className="relative z-10 w-full max-w-[460px] animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 text-center shadow-xl">
            <h1 className="mb-2 text-3xl font-bold">Under construction</h1>
            <p className="text-[#8b88b1]">
              The question bank is being worked on. Check back soon.
            </p>
          </div>
        </section>
      </main>
    </>
  );
};
export default NclexScreen;
