"use client";

import { useEffect, useState } from "react";

const DownloadCVButton = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-1 inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse"
      >
        Download CV
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-4 max-w-sm rounded-xl bg-[var(--container-color)] p-7 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-xl font-bold">Sorry!</h3>
            <p className="mb-6">It is still in progress!</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DownloadCVButton;
