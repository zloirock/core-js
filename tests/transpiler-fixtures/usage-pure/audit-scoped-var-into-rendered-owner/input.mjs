// a scoped `var _refN;` lands inside a block whose enclosing render re-emits that block. splicing it
// into the owner's own content keeps every substitution that render made, where a raw source re-emit
// would put the pre-substitution spelling back: the body's own polyfilled call must still read its
// memo, and the root must stay substituted inside the guard's copy.
// the chain TAIL is deliberately a member core-js does not ponyfill on this target - a block body
// leaves the chain's value unproven today, so a ponyfillable tail would be read raw and this
// baseline would pin that miss as the answer. the miss is recorded in the queue with its repro.
// one instance method per body, so a body that stops resolving shows up in the import set.
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
