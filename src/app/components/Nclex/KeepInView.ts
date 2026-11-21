import { RefObject, useEffect, useState } from "react";

const ROOM = 12;

export const useKeepInView = (
  panel: RefObject<HTMLElement>,
  active: boolean,
) => {
  const [shift, setShift] = useState(0);

  useEffect(() => {
    if (!active) {
      setShift(0);
      return;
    }
    const node = panel.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    const natural = box.left - shift;
    let next = 0;
    if (natural + box.width > window.innerWidth - ROOM) {
      next = window.innerWidth - ROOM - (natural + box.width);
    }
    if (natural + next < ROOM) next = ROOM - natural;
    if (next !== shift) setShift(next);
  }, [active, panel, shift]);

  return shift;
};
