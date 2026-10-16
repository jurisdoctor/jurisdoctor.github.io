"use client";
import { useEffect, useRef, useState } from "react";

export interface Segment {
  text: string;
  className?: string;
}

const FADE_MS = 500;

const flat = (segments: Segment[]) =>
  segments.map((segment) => segment.text).join("");

interface Layer {
  id: number;
  segments: Segment[];
  shown: boolean;
}

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

  const [layers, setLayers] = useState<Layer[]>([
    { id: 0, segments: target, shown: !typeOnMount },
  ]);
  const latest = useRef(full);
  const lastId = useRef(0);
  const targetRef = useRef(target);
  targetRef.current = target;
  const timers = useRef<number[]>([]);
  const later = (run: () => void, ms: number) => {
    timers.current.push(window.setTimeout(run, ms));
  };

  useEffect(() => {
    const pending = timers.current;
    if (typeOnMount && !calm()) {
      later(
        () => setLayers((all) => all.map((one) => ({ ...one, shown: true }))),
        30,
      );
    } else if (typeOnMount) {
      setLayers((all) => all.map((one) => ({ ...one, shown: true })));
    }
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (latest.current === full) return;
    latest.current = full;
    if (calm()) {
      lastId.current += 1;
      setLayers([
        { id: lastId.current, segments: targetRef.current, shown: true },
      ]);
      return;
    }
    lastId.current += 1;
    const id = lastId.current;
    setLayers((all) => [
      ...all.map((one) => ({ ...one, shown: false })),
      { id, segments: targetRef.current, shown: false },
    ]);
    later(
      () =>
        setLayers((all) =>
          all.map((one) => (one.id === id ? { ...one, shown: true } : one)),
        ),
      30,
    );
    later(
      () => setLayers((all) => all.filter((one) => one.shown)),
      FADE_MS + 300,
    );
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
      {layers.map((layer) => (
        <span
          key={layer.id}
          aria-hidden
          className={`col-start-1 row-start-1 duration-500 ease-out motion-reduce:transition-none ${wrap} ${
            layer.shown
              ? "opacity-100 blur-0 delay-200"
              : "opacity-0 blur-[4px]"
          }`}
        >
          {layer.segments.map((segment, at) => (
            <span key={at} className={segment.className}>
              {segment.text}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
};

export default TypedText;
