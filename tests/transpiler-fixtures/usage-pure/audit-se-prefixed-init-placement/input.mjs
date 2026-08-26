// where the SE PREFIX of an init goes, by CLAIM and by READER COUNT.
// one reader with a dispatch to hold it: the prefix rides that dispatch on babel and lifts to its own
// statement on the other leg - the placement decision each leg makes for a SOLE claim
const { Array: { prototype: { toReversed: sole } } } = (effect(), globalThis);
// a claim that binds its pure DIRECTLY has no dispatch to hold it, and BOTH legs lift there
const { Array: { from: soleStatic } } = (effect(), globalThis);
// SEVERAL readers: the prefix must run ONCE for all of them, so no dispatch may hold it - babel
// memoizes the surface per claim and keeps a sentinel residual, the other leg lifts once and drops
// the residual. same bindings, same imports, one shared run of the effect
const { Array: { prototype: { with: twoA, entries: twoB } } } = (effect(), globalThis);
const { Array: { prototype: { values: mixedLeaf } }, Object: { fromEntries: mixedStatic } } = (effect(), globalThis);
// ... and with a SURVIVING rest the init itself memoizes on this leg (the residual reads that ref),
// while babel lifts the prefix and memoizes the surface
const { Array: { prototype: { findLast: restLeaf } }, ...restSiblings } = (effect(), globalThis);
// a SHARED declaration splits on both legs: the extraction takes its own declarator
const { Array: { prototype: { findIndex: shared } } } = (effect(), globalThis), sibling = 1;
export { sole, soleStatic, twoA, twoB, mixedLeaf, mixedStatic, restLeaf, restSiblings, shared, sibling };
