import _Set from "@core-js/pure/actual/set/constructor";
// IIFE body conditionally throws before the tail return. ThrowStatement may unwind the
// call before the tail. receiver resolution must bail on ThrowStatement: inlining the
// tail return at the caller would silently drop the throw, changing observable runtime
// behavior (ReferenceError vs silent value)
const out = (() => {
  if (cond) throw new Error('fail');
  return _Set;
})().of(1);
export { out };