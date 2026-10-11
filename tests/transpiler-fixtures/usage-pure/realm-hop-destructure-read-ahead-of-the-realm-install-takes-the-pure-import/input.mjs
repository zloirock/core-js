// a destructure reading a realm KEY (`{ self: ... } = globalThis`) ahead of the realm's own install reads it once
// its receiver has evaluated - before the install - so the key is the realm and every level under it reads like
// its install-free twin: the level folds, a constructor, static, prototype or alias of it takes the pure import
const g = globalThis;
const { self: { Array: A } } = globalThis;
const { self: { Set } } = globalThis;
const { self: { Array: { from } } } = globalThis;
const { self: { Map: { groupBy } } } = globalThis;
const { self: s } = globalThis;
const { self: { Array: { prototype: { at } } } } = globalThis;
const { self: { Array: { prototype: { includes } } } } = g;
let B, flat;
({ self: { Array: B } } = globalThis);
({ self: { Array: { prototype: { flat } } } } = globalThis);
for (const { self: { Promise: P } } of [globalThis]) sink(P.resolve(1));
export { A, Set, from, groupBy, B, at, includes, flat };
export const fromAlias = s.Array.of(1);
globalThis.self = globalThis;
