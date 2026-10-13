import Link from "next/link";

export const metadata = {
  title: "Page not found",
};

const NotFound = () => {
  return (
    <>
      <main>
        <section className="mx-auto flex min-h-screen max-w-[1080px] items-center justify-center px-10 md:px-6">
          <div className="w-full max-w-[420px] animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 text-center shadow-xl">
            <h1 className="mb-2 text-2xl font-bold">
              Oops! This page does not exist!
            </h1>
            <p className="mb-6 text-sm text-[var(--muted-color)]">
              Let&apos;s take you back home
            </p>
            <Link
              href="/"
              className="inline-block rounded-md border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-[var(--on-primary)] shadow-lg"
            >
              Take me home
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};
export default NotFound;
