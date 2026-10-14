// A default on a slot the realm always fills never runs - a realm key's, on a leaf as on a level, and a
// static's read through such a key - so a write in it reaches no later read, which loads none of the
// array modules the dead write would bring. A parameter's realm default stands in for a caller's object,
// which may lack the slot: the default there runs, and its write reaches the read.
let a = 'ab', b = 'cd', c = 'ef', d = 'gh';
const { Map: M = (a = [1], Set) } = globalThis;
const { Promise: { allSettled } = (b = [2], WeakMap) } = globalThis;
const { Array: { from = (c = [3], 0) } } = globalThis;
export function parameter({ Reflect: { ownKeys } = (d = [4], URLSearchParams) } = globalThis) {
  return ownKeys;
}
parameter({});
export const reads = [a.flat(), b.findLast(Boolean), c.toReversed(), d.with(0, 1)];
export { M, allSettled, from };
