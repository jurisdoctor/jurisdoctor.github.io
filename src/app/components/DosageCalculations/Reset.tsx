"use client";
import { useState } from "react";

const Reset = ({ onReset }: { onReset: () => void }) => {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-bold uppercase tracking-wide text-[#8b88b1] duration-300 hover:text-[var(--primary-color)]"
      >
        Reset all
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
      <span className="font-bold text-[var(--title-color)]">
        Clear all progress?
      </span>

      <button
        type="button"
        onClick={() => {
          onReset();
          setConfirming(false);
        }}
        className="rounded-full bg-[var(--primary-color)] px-3 py-1 font-bold uppercase tracking-wide text-white"
      >
        Reset
      </button>

      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="font-bold uppercase tracking-wide text-[#8b88b1] duration-300 hover:text-[var(--title-color)]"
      >
        Cancel
      </button>
    </span>
  );
};

export default Reset;
