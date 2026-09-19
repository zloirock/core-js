// Locals and generated memos stay inside the retained body, with every inner polyfill applied.
// Conditional realm-or-null returns stay guarded; unrelated local declarations allow proving
// a definite returned realm and injecting the static beyond it.
export const branchedBody = (() => {
  if (globalThis) {
    const inner = 'ab'.padStart(3, '-');
    return inner.length ? globalThis : null;
  }
  return null;
})()?.window?.JSON.parse('1');

let effectCount = 0;
export const effectfulBody = (() => {
  effectCount++;
  const inner = [1].includes(1);
  return inner ? globalThis : null;
})()?.window?.Math.max(1, 2);

export const nestedBodies = (() => {
  const outer = [1, [2]].flat();
  return outer.length ? globalThis : null;
})()?.window?.JSON.stringify({ a: 1 });

// NEGATIVE: no memo is needed in the body, so no scoped var is inserted and neither path runs
export const noScopedVar = (() => globalThis)()?.window?.String.fromCodePoint(99).endsWith('c');

export const localBody = (() => {
  const inner = [1, [2]].flat();
  effectCount += inner.length;
  return globalThis;
})()?.Array.of(5).at(0);
