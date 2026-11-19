// Local declarations stay inside the retained call, including the body's own polyfills.
// The returned realm still proves the static beyond the optional receiver.
export const log = [];
export const value = (() => {
  const inner = [1, [2]].flat();
  log.push(inner.length);
  return globalThis;
})()?.Array.of(5).at(0);
