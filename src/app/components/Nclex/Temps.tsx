import { ReactNode } from "react";
import Flash from "./Flash";

const NUMBER = String.raw`\d+(?:\.\d+)?`;
const TEMP = new RegExp(
  String.raw`(^|[^\w.])(?:(${NUMBER})\s?°?\s?F\s?\(\s?(${NUMBER})\s?°?\s?C\s?\)|(\d{2,3}(?:\.\d+)?)\s?°?\s?([CF])\b(?!-))`,
  "g",
);

const inRange = (value: number, unit: string) =>
  unit === "C" ? value >= 30 && value <= 45 : value >= 86 && value <= 113;

const trim = (value: number) => String(Number(value.toFixed(1)));

export const toFahrenheit = (celsius: number) => celsius * 1.8 + 32;
export const toCelsius = (fahrenheit: number) => (fahrenheit - 32) / 1.8;

export const withTemps = (text: string): ReactNode => {
  if (!/[CF]\b/.test(text)) return text;

  const parts: ReactNode[] = [];
  let last = 0;
  let found = false;
  TEMP.lastIndex = 0;

  for (let match = TEMP.exec(text); match; match = TEMP.exec(text)) {
    const [whole, prefix, pairF, pairC, num, unit] = match;
    let items: string[] | null = null;

    if (pairF && pairC) {
      items = [`${pairF} F`, `${pairC} C`];
    } else if (num && unit && inRange(Number(num), unit)) {
      items =
        unit === "C"
          ? [`${num} C`, `${trim(toFahrenheit(Number(num)))} F`]
          : [`${num} F`, `${trim(toCelsius(Number(num)))} C`];
    }
    if (!items) continue;

    found = true;
    const start = match.index + prefix.length;
    parts.push(text.slice(last, start));
    parts.push(
      <Flash
        key={`${match.index}-${whole}`}
        items={items}
        className="whitespace-nowrap"
      />,
    );
    last = match.index + whole.length;
  }

  if (!found) return text;
  parts.push(text.slice(last));
  return <>{parts}</>;
};

const Temps = ({ children }: { children: string }) => (
  <>{withTemps(children)}</>
);

export default Temps;
