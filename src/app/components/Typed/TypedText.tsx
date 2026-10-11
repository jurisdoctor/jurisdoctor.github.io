"use client";
import { useEffect, useRef, useState } from "react";

// Text that types itself. When the text it is given changes, the old text is
// wiped letter by letter and the new text is typed in; with `typeOnMount` the
// first text is typed in as well, which is what page headings use. This is the
// one text transition used across the site.
//
// The words are also laid out unseen in the same space (the longest of this
// text and everything in `reserve`), so the box keeps its size and nothing
// around it shifts while letters come and go. Screen readers get the finished
// text, not the letters; with reduced motion on, text just changes.

export interface Segment {
  text: string;
  className?: string;
}

const ERASE_MS = 9; // per letter, taking the old text away
const TYPE_MS = 26; // per letter, putting the new text in

const flat = (segments: Segment[]) =>
  segments.map((segment) => segment.text).join("");

// The first `count` letters of the segments, each part keeping its own style.
const upTo = (segments: Segment[], count: number) => {
  let left = count;
  return segments.map((segment, index) => {
    const part = segment.text.slice(0, Math.max(0, left));
    left -= segment.text.length;
    return part ? (
      <span key={index} className={segment.className}>
        {part}
      </span>
    ) : null;
  });
};

const TypedText = ({
  text,
  segments,
  reserve = [],
  className = "",
  inline = false,
  nowrap = false,
  typeOnMount = false,
}: {
  text?: string;
  segments?: Segment[];
  reserve?: string[];
  className?: string;
  inline?: boolean;
  nowrap?: boolean;
  typeOnMount?: boolean;
}) => {
  const target: Segment[] = segments ?? [{ text: text ?? "" }];
  const full = flat(target);
  const calm = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // What is on screen: some segments, and how many of their letters.
  const [view, setView] = useState<Segment[]>(typeOnMount ? [] : target);
  const [count, setCount] = useState(typeOnMount ? 0 : full.length);
  const [typing, setTyping] = useState(false);
  const shownFull = useRef(typeOnMount ? "" : full);
  const countRef = useRef(count);
  const viewRef = useRef(view);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    if (shownFull.current === full) return;
    if (calm()) {
      shownFull.current = full;
      viewRef.current = targetRef.current;
      countRef.current = full.length;
      setView(targetRef.current);
      setCount(full.length);
      return;
    }

    let timer = 0;
    const put = (next: number) => {
      countRef.current = next;
      setCount(next);
    };
    setTyping(true);
    const type = () => {
      if (countRef.current < full.length) {
        put(countRef.current + 1);
        timer = window.setTimeout(type, TYPE_MS);
      } else {
        // Only now is this text really on screen; an effect that is cleaned up
        // half-way (React's development double run) starts over cleanly.
        shownFull.current = full;
        setTyping(false);
      }
    };
    const erase = () => {
      if (countRef.current > 0) {
        put(countRef.current - 1);
        timer = window.setTimeout(erase, ERASE_MS);
      } else {
        viewRef.current = targetRef.current;
        setView(targetRef.current);
        type();
      }
    };
    erase();
    return () => window.clearTimeout(timer);
  }, [full]);

  const wrap = nowrap ? "whitespace-nowrap" : "";
  return (
    <span className={`${inline ? "inline-grid" : "grid"} ${className}`}>
      {[full, ...reserve].map((words, index) => (
        <span
          key={`${index}-${words}`}
          aria-hidden
          className={`invisible col-start-1 row-start-1 ${wrap}`}
        >
          {index === 0 && segments
            ? segments.map((segment, at) => (
                <span key={at} className={segment.className}>
                  {segment.text}
                </span>
              ))
            : words}
        </span>
      ))}
      <span className="sr-only">{full}</span>
      <span aria-hidden className={`col-start-1 row-start-1 ${wrap}`}>
        {upTo(view, count)}
        <span
          className={`ml-px inline-block h-[1em] w-[2px] translate-y-[0.12em] bg-current ${
            typing ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
    </span>
  );
};

export default TypedText;
