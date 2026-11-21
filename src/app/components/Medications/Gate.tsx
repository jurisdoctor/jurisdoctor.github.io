"use client";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

const KEY = "meds:unlocked";
const DIGEST =
  "86bd851d8cf0fb773bf3b5998fcdf4cff799973203169ad4d099ce4e1ab317ba";
const LIMIT = 3;

const SHAKE = [
  { transform: "translateX(0)" },
  { transform: "translateX(-9px)" },
  { transform: "translateX(8px)" },
  { transform: "translateX(-5px)" },
  { transform: "translateX(3px)" },
  { transform: "translateX(0)" },
];

const hash = async (word: string) => {
  const bytes = new TextEncoder().encode(word);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const Gate = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [word, setWord] = useState("");
  const [wrong, setWrong] = useState(0);
  const cardRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      if (window.localStorage.getItem(KEY) === DIGEST) setOpen(true);
    } catch {}
    setReady(true);
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!word.trim()) return;

    if ((await hash(word.trim().toLowerCase())) === DIGEST) {
      try {
        window.localStorage.setItem(KEY, DIGEST);
      } catch {}
      setOpen(true);
      return;
    }

    const missed = wrong + 1;
    setWrong(missed);
    setWord("");

    if (missed >= LIMIT) {
      router.replace("/");
      return;
    }

    const card = cardRef.current;
    if (
      card &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      card.animate(SHAKE, { duration: 520, easing: "ease-out" });
    }
  };

  if (!ready) return null;
  if (open) return <>{children}</>;

  const left = LIMIT - wrong;

  return (
    <section className="mx-auto flex min-h-screen max-w-[1080px] items-center justify-center px-10 md:px-6">
      <form
        ref={cardRef}
        onSubmit={submit}
        className="grid w-full max-w-[420px] animate-fadeIn justify-items-center gap-6 rounded-xl bg-[var(--container-color)] p-6 text-center shadow-xl"
      >
        <h1 className="sr-only">This one&apos;s private</h1>
        <div className="gate-stage" aria-hidden>
          <div className="gate-walker">
            <div className="gate-flip">
              <svg viewBox="0 0 64 40" className="h-full w-full">
                <g className="gate-bob">
                  <g className="gate-tail">
                    <path
                      d="M22 17 C14 16 7 20 1 28 C8 26 15 26 23 27 Z"
                      fill="#5ea35c"
                    />
                  </g>
                  <g className="gate-leg gate-leg-b">
                    <rect
                      x="31"
                      y="25"
                      width="5.5"
                      height="11"
                      rx="2.6"
                      fill="#4a8a49"
                    />
                    <ellipse cx="36" cy="36" rx="4" ry="2" fill="#4a8a49" />
                  </g>
                  <polygon points="22,12 24.5,5.5 27,11" fill="#3f7a3f" />
                  <polygon points="27,10.5 29.5,4 32,10" fill="#3f7a3f" />
                  <polygon points="32,10.5 34.5,4.5 37,11" fill="#3f7a3f" />
                  <ellipse cx="30" cy="20" rx="14" ry="9.5" fill="#6fb36a" />
                  <ellipse cx="31" cy="24" rx="9" ry="4.5" fill="#b9de9c" />
                  <polygon points="37,18 41,8 48,9 45,22" fill="#6fb36a" />
                  <g className="gate-leg gate-leg-a">
                    <rect
                      x="25"
                      y="25"
                      width="5.5"
                      height="11"
                      rx="2.6"
                      fill="#6fb36a"
                    />
                    <ellipse cx="30" cy="36" rx="4" ry="2" fill="#6fb36a" />
                  </g>
                  <path
                    d="M38 22 C41 23 42 25 41 27"
                    fill="none"
                    stroke="#4a8a49"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <g className="gate-head">
                    <ellipse cx="50" cy="10" rx="9.5" ry="6.5" fill="#6fb36a" />
                    <ellipse cx="52" cy="14" rx="8" ry="2.8" fill="#b9de9c" />
                    <polygon
                      points="47,12.8 48.5,15.5 50,12.8"
                      fill="#ffffff"
                    />
                    <polygon points="52,13 53.5,15.8 55,13" fill="#ffffff" />
                    <polygon
                      points="56.5,12.8 58,15.3 59,12.8"
                      fill="#ffffff"
                    />
                    <circle cx="55" cy="6.5" r="2" fill="#ffffff" />
                    <circle cx="55.6" cy="6.6" r="1" fill="#2a2018" />
                    <circle cx="58.6" cy="8.4" r="0.8" fill="#3f7a3f" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>

        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={word}
          onChange={(event) => setWord(event.target.value)}
          placeholder="Password"
          className="h-14 w-full rounded-2xl border-none bg-[var(--body-color)] px-[max(0px,calc(1.875rem-2px))] py-[max(0px,calc(0.625rem-2px))] text-center text-[var(--text-color)] shadow-inner outline-none"
        />

        {wrong > 0 && (
          <p className="text-sm font-bold text-[var(--danger-color)]">
            Not that one. {left} {left === 1 ? "try" : "tries"} left.
          </p>
        )}

        <button
          type="submit"
          className="inline-block rounded-md border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-[var(--on-primary)] shadow-lg"
        >
          Unlock
        </button>
      </form>
    </section>
  );
};

export default Gate;
