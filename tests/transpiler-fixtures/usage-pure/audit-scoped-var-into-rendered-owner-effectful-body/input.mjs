let effectCount = 0;
export const effectfulBody = (() => {
  effectCount++;
  const inner = [1].includes(1);
  return inner ? globalThis : null;
})()?.window?.Math.max(1, 2);
