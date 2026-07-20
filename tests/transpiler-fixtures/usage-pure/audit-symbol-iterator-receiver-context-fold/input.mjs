// well-known-symbol receiver folding by CONTEXT: a GET collapses through the strand and folds an
// unresolvable chain ROOT to the nav's resolvable VALUE (`window.self` reads off the pure self
// entry on BOTH emitters - the raw nav is a ReferenceError off-browser), while a doubly
// unresolvable nav stays the genuine argument; a WRITE HOST (`++` / `delete`) survives with a
// key-only rewrite and folds its receiver like the plain-key member channel; a for-x aliased
// body read deopts to the raw slot read of the substituted root on BOTH emitters
export const windowGet = window.self[Symbol.iterator];
let a;
export const keptParenGet = ((a = window)).self[Symbol.iterator];
export const doubleUnresolvable = window.window[Symbol.iterator];
export function bump() {
  return globalThis.self[Symbol.iterator]++;
}
export function drop() {
  delete globalThis.self[Symbol.toStringTag];
}
export function loop(xs) {
  for (globalThis.self[Symbol.iterator] of xs) {
    void globalThis.self[Symbol.iterator];
  }
}
// a tagged-template tag is a this-carrying invocation: the member survives with a key-only
// rewrite and the receiver renders through the root drive (raw for an unresolvable root)
export function tag(t) {
  return globalThis.self[Symbol.iterator]`${t}`;
}
export const inHas = Symbol.iterator in window.self;
