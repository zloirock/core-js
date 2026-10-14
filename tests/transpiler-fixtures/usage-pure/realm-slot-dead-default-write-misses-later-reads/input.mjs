// A default on a slot the realm always fills never runs. Pure drops a realm key's default with the rewrite - on
// a leaf with the extraction, on a level with the level's mirror - so a write in it reaches no later read; a
// static's default inside a level it keeps as written, where its write still counts. A parameter's realm default
// stands in for a caller's object, which may lack the slot: the default there runs.
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
