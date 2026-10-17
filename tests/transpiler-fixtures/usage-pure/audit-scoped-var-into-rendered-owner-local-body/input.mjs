let effectCount = 0;
export const localBody = (() => {
  const inner = [1, [2]].flat();
  effectCount += inner.length;
  return globalThis;
})()?.Array.of(5).at(0);
