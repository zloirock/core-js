// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const { Array: { prototype: { toReversed: sole } } } = (effect(), globalThis);
const { Array: { from: soleStatic } } = (effect(), globalThis);
const { Array: { prototype: { with: twoA, entries: twoB } } } = (effect(), globalThis);
const { Array: { prototype: { values: mixedLeaf } }, Object: { fromEntries: mixedStatic } } = (effect(), globalThis);
const { Array: { prototype: { findLast: restLeaf } }, ...restSiblings } = (effect(), globalThis);
const { Array: { prototype: { findIndex: shared } } } = (effect(), globalThis), sibling = 1;
export { sole, soleStatic, twoA, twoB, mixedLeaf, mixedStatic, restLeaf, restSiblings, shared, sibling };
