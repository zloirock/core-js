// a read of a global this file patches that runs before every write of its slot still sees what this
// build serves, so it takes the pure import: a value, a presence test deciding the key it guards, a
// detect guarding its own patch. a read after the patch, or deferred into a function, reads the user's
// slot
export const early = new Set([0]);
let key;
if (typeof Promise != 'undefined') key = 'at';
export const readKey = list => list[key](0);
export const detected = Symbol || (Symbol = shimSymbol);
globalThis.Set = ShimSet;
globalThis.Promise = ShimPromise;
export const late = new Set([1]);
export function deferred() {
  return new Set([2]);
}
