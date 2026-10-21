"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PiCheckBold, PiXBold } from "react-icons/pi";
import { isAcceptable } from "./Moderate";

export const ENDPOINT = "https://api.web3forms.com/submit";
export const SUGGEST_KEY = "02962e0d-4c68-437a-806d-b750a7e0ed0e";

type Status =
  | "idle"
  | "sending"
  | "sent"
  | "failed"
  | "unconnected"
  | "blocked"
  | "local";

// Developing on this machine: nothing is sent, so a test never becomes a real
// submission or an email.
const isLocal = () =>
  /^(localhost|127\.0\.0\.1|\[::1\]|.*\.localhost)$/.test(
    window.location.hostname,
  );

export const SuggestModal = ({ onClose }: { onClose: () => void }) => {
  const [medication, setMedication] = useState("");
  const [note, setNote] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    input.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const name = medication.trim();
    if (!name || status === "sending") return;
    if (trap) {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    if (!(await isAcceptable(name, note))) {
      setStatus("blocked");
      return;
    }
    if (isLocal()) {
      setStatus("local");
      return;
    }
    if (!SUGGEST_KEY) {
      setStatus("unconnected");
      return;
    }
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: SUGGEST_KEY,
          subject: `Medication suggestion: ${name}`,
          from_name: "Agave's Lab",
          medication: name,
          message: note.trim() || "(no note)",
        }),
      });
      const result = await response.json().catch(() => null);
      setStatus(response.ok && result?.success ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-[rgba(0,0,0,0.6)] px-4 py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Suggest a medication"
        onClick={(event) => event.stopPropagation()}
        className="m-auto w-full max-w-[28rem] animate-fadeIn rounded-2xl bg-[var(--container-color)] p-6 shadow-2xl md:p-4"
      >
        <div
          className={`flex items-start gap-x-4 ${
            status === "blocked"
              ? "mb-3 justify-center text-center"
              : "mb-4 justify-between"
          }`}
        >
          <div>
            <h2 className="text-2xl font-bold">Suggest a medication</h2>
          </div>
          {status !== "blocked" && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--muted-color)] duration-300 hover:bg-[var(--body-color)] hover:text-[var(--title-color)]"
            >
              <PiXBold />
            </button>
          )}
        </div>

        {status === "blocked" ? (
          <div className="pb-2 text-center">
            <p className="font-bold text-[var(--title-color)]">
              Please keep it respectful. I can ping and find you :)
            </p>
            <button
              type="button"
              onClick={() => {
                setMedication("");
                setNote("");
                setTrap("");
                setStatus("idle");
              }}
              className="mt-4 inline-block rounded-md border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-[var(--on-primary)] shadow-lg"
            >
              Try again
            </button>
          </div>
        ) : status === "sent" || status === "local" ? (
          <div className="py-6 text-center">
            <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,212,127,0.18)] text-[rgb(0,212,127)]">
              <PiCheckBold aria-hidden />
            </span>
            <p className="font-bold text-[var(--title-color)]">
              Got it, thank you.
            </p>
            <p className="mt-1 text-sm text-[var(--muted-color)]">
              I&apos;ll look it up and add it.
            </p>
            {status === "local" && (
              <p className="mt-3 text-xs italic text-[var(--muted-color)]">
                Running locally, so nothing was actually sent.
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-block rounded-md border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-[var(--on-primary)] shadow-lg"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-y-4">
            <label className="grid gap-y-1.5">
              <span className="text-sm font-bold text-[var(--title-color)]">
                Medication
              </span>
              <input
                ref={input}
                type="text"
                value={medication}
                onChange={(event) => setMedication(event.target.value)}
                placeholder="Generic or brand name"
                maxLength={120}
                required
                autoComplete="off"
                className="h-11 w-full rounded-md border border-solid border-transparent bg-[var(--body-color)] px-4 text-[var(--title-color)] outline-none duration-300 placeholder:text-[var(--muted-color)] focus:border-[var(--chip-blue-border)]"
              />
            </label>

            <label className="grid gap-y-1.5">
              <span className="text-sm font-bold text-[var(--title-color)]">
                Anything else?{" "}
                <span className="font-normal text-[var(--muted-color)]">
                  (optional)
                </span>
              </span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                maxLength={600}
                placeholder="Something missing from the guide? Tell me about it."
                className="w-full resize-none rounded-md border border-solid border-transparent bg-[var(--body-color)] px-4 py-3 text-[var(--title-color)] outline-none duration-300 placeholder:text-[var(--muted-color)] focus:border-[var(--chip-blue-border)]"
              />
            </label>

            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={trap}
              onChange={(event) => setTrap(event.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              name="website"
            />

            {status === "failed" && (
              <p className="text-sm font-bold text-[var(--primary-color)]">
                That didn&apos;t send. Check your connection and try again.
              </p>
            )}
            {status === "unconnected" && (
              <p className="text-sm font-bold text-[var(--primary-color)]">
                Suggestions aren&apos;t connected to an inbox yet, so nothing
                was sent.
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={!medication.trim() || status === "sending"}
                className="inline-block rounded-md border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-[var(--on-primary)] shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "sending" ? "Sending…" : "Send suggestion"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
};
