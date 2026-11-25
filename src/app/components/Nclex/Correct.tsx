"use client";
import { useEffect, useState } from "react";

interface WordType {
  language: string;
  word: string;
  lang: string;
  rtl?: boolean;
}

const WORDS: WordType[] = [
  { language: "Spanish", word: "Correcto", lang: "es" },
  { language: "French", word: "Correct", lang: "fr" },
  { language: "German", word: "Richtig", lang: "de" },
  { language: "Italian", word: "Corretto", lang: "it" },
  { language: "Portuguese", word: "Correto", lang: "pt" },
  { language: "Dutch", word: "Juist", lang: "nl" },
  { language: "Swedish", word: "Rätt", lang: "sv" },
  { language: "Norwegian", word: "Riktig", lang: "no" },
  { language: "Danish", word: "Rigtigt", lang: "da" },
  { language: "Finnish", word: "Oikein", lang: "fi" },
  { language: "Icelandic", word: "Rétt", lang: "is" },
  { language: "Irish", word: "Ceart", lang: "ga" },
  { language: "Welsh", word: "Cywir", lang: "cy" },
  { language: "Polish", word: "Poprawnie", lang: "pl" },
  { language: "Czech", word: "Správně", lang: "cs" },
  { language: "Slovak", word: "Správne", lang: "sk" },
  { language: "Hungarian", word: "Helyes", lang: "hu" },
  { language: "Romanian", word: "Corect", lang: "ro" },
  { language: "Greek", word: "Σωστό", lang: "el" },
  { language: "Turkish", word: "Doğru", lang: "tr" },
  { language: "Russian", word: "Верно", lang: "ru" },
  { language: "Ukrainian", word: "Правильно", lang: "uk" },
  { language: "Bulgarian", word: "Правилно", lang: "bg" },
  { language: "Serbian", word: "Тачно", lang: "sr" },
  { language: "Croatian", word: "Točno", lang: "hr" },
  { language: "Slovenian", word: "Pravilno", lang: "sl" },
  { language: "Lithuanian", word: "Teisingai", lang: "lt" },
  { language: "Latvian", word: "Pareizi", lang: "lv" },
  { language: "Estonian", word: "Õige", lang: "et" },
  { language: "Hebrew", word: "נכון", lang: "he", rtl: true },
  { language: "Arabic", word: "صحيح", lang: "ar", rtl: true },
  { language: "Persian", word: "درست", lang: "fa", rtl: true },
  { language: "Urdu", word: "درست", lang: "ur", rtl: true },
  { language: "Hindi", word: "सही", lang: "hi" },
  { language: "Bengali", word: "সঠিক", lang: "bn" },
  { language: "Marathi", word: "बरोबर", lang: "mr" },
  { language: "Gujarati", word: "સાચું", lang: "gu" },
  { language: "Punjabi", word: "ਸਹੀ", lang: "pa" },
  { language: "Tamil", word: "சரி", lang: "ta" },
  { language: "Telugu", word: "సరైనది", lang: "te" },
  { language: "Thai", word: "ถูกต้อง", lang: "th" },
  { language: "Vietnamese", word: "Chính xác", lang: "vi" },
  { language: "Indonesian", word: "Benar", lang: "id" },
  { language: "Malay", word: "Betul", lang: "ms" },
  { language: "Filipino", word: "Tama", lang: "fil" },
  { language: "Chinese", word: "正确", lang: "zh-Hans" },
  { language: "Chinese (Traditional)", word: "正確", lang: "zh-Hant" },
  { language: "Japanese", word: "正解", lang: "ja" },
  { language: "Korean", word: "정답", lang: "ko" },
  { language: "Swahili", word: "Sahihi", lang: "sw" },
  { language: "Zulu", word: "Kulungile", lang: "zu" },
  { language: "Afrikaans", word: "Reg", lang: "af" },
];

const HOLD = 1800;
let lastPick = -1;

const pickWord = () => {
  let next = Math.floor(Math.random() * WORDS.length);
  if (next === lastPick) next = (next + 1) % WORDS.length;
  lastPick = next;
  return WORDS[next];
};

// Says "Correct" and flips back and forth between it and one random
// translation. A new language is drawn each time the banner appears, so a
// redo shows a different one.
const Correct = () => {
  const [entry] = useState(pickWord);
  const [translated, setTranslated] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    const timer = window.setInterval(() => setTranslated((on) => !on), HOLD);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="mb-6 flex min-h-[4.5rem] flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-[rgba(var(--success-rgb),0.12)] p-5"
      role="status"
    >
      <span className="sr-only">Correct</span>
      <span
        aria-hidden
        className="flex flex-wrap items-baseline gap-x-3 text-2xl font-bold text-[var(--title-color)]"
      >
        {still ? (
          <>
            <span>Correct ✅</span>
            <span
              lang={entry.lang}
              dir={entry.rtl ? "rtl" : undefined}
              className="text-[var(--muted-color)]"
            >
              {entry.word}
            </span>
          </>
        ) : translated ? (
          <>
            <span
              key="word"
              lang={entry.lang}
              dir={entry.rtl ? "rtl" : undefined}
              className="flash-num"
            >
              {entry.word} ✅
            </span>
            <span className="flash-num text-sm font-normal text-[var(--muted-color)]">
              {entry.language}
            </span>
          </>
        ) : (
          <span key="english" className="flash-num">
            Correct ✅
          </span>
        )}
      </span>
    </div>
  );
};

export default Correct;
