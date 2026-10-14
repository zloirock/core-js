// A realm a pattern reads through a wrapper - a `window` read, a for-of over an array holding it, a sequence
// prefix, a TS assertion, a `self` hop above the key - still fills the key's slot, so a default on the key is dead
// all the same: no usage in usage-global, and in usage-pure it leaves with the level's mirror, its import too.
const { Map: { groupBy } = Set, JSON: J } = window;
for (const { Promise: { allSettled } = WeakSet } of [globalThis]) use(allSettled);
const { Iterator: { concat } = WeakMap } = (log(), globalThis);
const { Object: { entries } = DataView } = globalThis as any;
const { self: { Reflect: { ownKeys } = Number } } = globalThis;
export { groupBy, J, concat, entries, ownKeys };
