// A pattern hop through an object literal can reach a built-in surface. A sole consumed hop may
// dispatch directly on that surface. With an outer sibling, capture the complete literal first,
// dispatch through its nested property, then read the sibling. A user value keeps its own receiver
// type.
const { w: { Array: { prototype: { at } } } } = { w: globalThis };
const { q: { w: { Array: { prototype: { includes } } } } } = { q: { w: globalThis } };
const { w: { Array: { prototype: { map } } }, z } = { w: globalThis, z: 1 };
const { y: { find } } = { y: [1, 2] };
export default [at, includes, map, z, find];
