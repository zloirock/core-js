// A default under a served realm key is dead even when the assignment's result is used.
// Its writes must leave the type facts together with the default; the result stays the realm.
let a = 'ab', b = 'cd', c = 'ef', concat;
const { WeakMap: { custom } = (a = [1], Set) } = globalThis;
const { Promise: { allSettled } = (b = [2], WeakSet), ...rest } = globalThis;
use(({ Iterator: { concat } = (c = [3], DOMException) } = globalThis));
export const reads = [a.flat(), b.findLast(Boolean), c.toReversed()];
export { custom, allSettled, rest, concat };
