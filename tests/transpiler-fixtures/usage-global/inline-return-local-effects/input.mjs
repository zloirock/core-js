// A returned realm proves the outer static despite unrelated local declarations.
// Inject the outer static and methods used inside the retained body.
export const log = [];
export const value = (() => {
  const inner = [1, [2]].flat();
  log.push(inner.length);
  return globalThis;
})()?.Array.of(5).at(0);
