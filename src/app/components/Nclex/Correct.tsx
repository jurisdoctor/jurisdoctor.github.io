import Puppy from "./Puppy";

const Correct = () => (
  <div
    role="status"
    className="mb-5 flex w-fit max-w-full items-center gap-x-4 rounded-2xl bg-[rgba(var(--success-rgb),0.12)] px-5 py-3 ring-2 ring-inset ring-[rgb(var(--success-rgb))]"
  >
    <span className="text-xl font-bold leading-7 text-[var(--title-color)]">
      Correct
    </span>
    <div aria-hidden className="puppy-flip -my-1 h-8 w-[3.4rem] shrink-0">
      <div className="puppy-spin h-full w-full">
        <Puppy />
      </div>
    </div>
  </div>
);

export default Correct;
