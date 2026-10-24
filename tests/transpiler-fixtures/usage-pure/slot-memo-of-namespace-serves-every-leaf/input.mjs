// A literal slot memoized because its leaves navigate on into a built-in surface holds the namespace
// itself: every leaf off that memo reads the surface through it, a later leaf as the first one. A
// memo of the user's own object names no surface, and its leaves keep the source's own reads.
export const { slot: { prototype: { at, flat } } } = { slot: (0, Array) };
export const { realm: { Array: { prototype: { fill, includes } } } } = { realm: (0, globalThis) };
const registry = { Model: { prototype: [1, 2] } };
export const { user: { Model: { prototype: { findLast, toSorted } } } } = { user: (0, registry) };
