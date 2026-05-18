"use client";

import { useEffect, useState } from "react";

interface SkillBarProps {
  name: string;
  percent: number;
  color: string;
}

const SkillBar = ({ name, percent, color }: SkillBarProps) => {
  const [display, setDisplay] = useState(percent);

  useEffect(() => {
    const id = setInterval(() => {
      const wiggle = (Math.random() - 0.5) * 0.6;
      setDisplay(Math.round((percent + wiggle) * 10) / 10);
    }, 1000);
    return () => clearInterval(id);
  }, [percent]);

  return (
    <div className="skills__data">
      <div className="mb-4 flex justify-between">
        <h3 className="text-base font-semibold">{name}</h3>
        <span className="font-mono leading-5 tabular-nums">
          {display.toFixed(1)}%
        </span>
      </div>

      <div className="h-[7px] rounded bg-[#f1f1f1]">
        <div
          className="block h-[7px] origin-left animate-fillBar rounded"
          style={{ width: `${percent}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
};

export default SkillBar;
