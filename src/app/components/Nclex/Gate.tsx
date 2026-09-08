"use client";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

const KEY = "nclex:unlocked";
const DIGEST =
  "391a2c33f2f79913a980fb0c7096c94724886ce763096fbf277122637d15cba2";
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
        className="w-full max-w-[420px] animate-fadeIn rounded-xl bg-[var(--container-color)] p-7 text-center shadow-xl"
      >
        <h1 className="mb-2 text-2xl font-bold">This page is private</h1>
        <p className="mb-6 text-sm text-[#8b88b1]">
          Enter the password to open the question bank.
        </p>

        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={word}
          onChange={(event) => setWord(event.target.value)}
          placeholder="Password"
          className="mb-4 h-14 w-full rounded-2xl border-none bg-[var(--body-color)] px-[1.875rem] py-[0.625rem] text-center text-[var(--text-color)] shadow-inner outline-none"
        />

        {wrong > 0 && (
          <p className="mb-4 text-sm font-bold text-[var(--primary-color)]">
            Not that one. {left} {left === 1 ? "try" : "tries"} left.
          </p>
        )}

        <button
          type="submit"
          className="inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse"
        >
          Unlock
        </button>
      </form>
    </section>
  );
};

export default Gate;
