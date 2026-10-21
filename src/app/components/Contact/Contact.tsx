"use client";
import { FormEvent, useState } from "react";
import { PiCheckBold } from "react-icons/pi";
import Reveal from "../Reveal";
import { isAcceptable } from "../Medications/Moderate";
import { ENDPOINT, SUGGEST_KEY } from "../Medications/Suggest";

type Status = "idle" | "sending" | "sent" | "failed" | "blocked" | "local";

const isLocal = () =>
  /^(localhost|127\.0\.0\.1|\[::1\]|.*\.localhost)$/.test(
    window.location.hostname,
  );

const field =
  "w-full rounded-md border border-solid border-transparent bg-[var(--body-color)] px-4 text-[var(--title-color)] outline-none duration-300 placeholder:text-[var(--muted-color)] focus:border-[var(--chip-blue-border)]";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || status === "sending") return;
    if (trap) {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    if (!(await isAcceptable(name, message))) {
      setStatus("blocked");
      return;
    }
    if (isLocal()) {
      setStatus("local");
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
          subject: "Message from the site",
          from_name: name.trim() || "Site visitor",
          name: name.trim() || "Site visitor",
          email: email.trim() || undefined,
          message: message.trim(),
        }),
      });
      const result = await response.json().catch(() => null);
      setStatus(response.ok && result?.success ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  const reset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setTrap("");
    setStatus("idle");
  };

  return (
    <section
      className="contact mx-auto max-w-[1080px] px-10 pb-28 pt-8 lg:pt-4 md:px-6"
      id="contact"
    >
      <Reveal
        as="h2"
        className="relative mb-14 ml-3.5 text-4xl font-bold lg:mb-8 lg:ml-0 lg:text-center"
      >
        Contact
      </Reveal>

      <Reveal
        delay={80}
        data-shapes-safe
        className="grid grid-cols-[1fr_1.4fr] gap-x-10 rounded-xl bg-[var(--container-color)] p-7 shadow-xl md:grid-cols-1 md:gap-y-6 md:p-5"
      >
        <div className="md:text-center">
          <h3 className="mb-3 text-xl font-bold text-[var(--title-color)]">
            Say hello
          </h3>
          <p className="mb-3">
            A question about the drug guide, a correction, or a tool you wish
            this site had? Send me a message.
          </p>
          <p className="text-sm text-[var(--muted-color)]">
            This is a personal study site.
          </p>
        </div>

        {status === "sent" || status === "local" ? (
          <div className="grid content-center justify-items-center py-6 text-center">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,212,127,0.18)] text-[rgb(0,212,127)]">
              <PiCheckBold aria-hidden />
            </span>
            <p className="font-bold text-[var(--title-color)]">
              Got it, thank you.
            </p>
            {status === "local" && (
              <p className="mt-2 text-xs italic text-[var(--muted-color)]">
                Running locally, so nothing was actually sent.
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              className="mt-5 inline-block rounded-md border-[1px] border-solid border-transparent bg-[color-mix(in_srgb,var(--primary-color)_16%,transparent)] px-8 py-3 font-bold leading-4 text-[var(--primary-color)]"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-y-4">
            <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-1 sm:gap-y-4">
              <label className="grid gap-y-1.5">
                <span className="text-sm font-bold text-[var(--title-color)]">
                  Name{" "}
                  <span className="font-normal text-[var(--muted-color)]">
                    (optional)
                  </span>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={80}
                  autoComplete="name"
                  className={`${field} h-11`}
                />
              </label>
              <label className="grid gap-y-1.5">
                <span className="text-sm font-bold text-[var(--title-color)]">
                  Email{" "}
                  <span className="font-normal text-[var(--muted-color)]">
                    (for a reply)
                  </span>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={120}
                  autoComplete="email"
                  className={`${field} h-11`}
                />
              </label>
            </div>

            <label className="grid gap-y-1.5">
              <span className="text-sm font-bold text-[var(--title-color)]">
                Message
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                maxLength={1000}
                required
                className={`${field} resize-none py-3`}
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
            {status === "blocked" && (
              <p className="text-sm font-bold text-[var(--primary-color)]">
                Please keep it respectful and leave out links.
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={!message.trim() || status === "sending"}
                className="inline-block rounded-md border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-[var(--on-primary)] shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </div>
          </form>
        )}
      </Reveal>
    </section>
  );
};

export default Contact;
