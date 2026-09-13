// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const { Array: { prototype: { toReversed: sole } } } = (effect(), globalThis);
const { Array: { from: soleStatic } } = (effect(), globalThis);
const { Array: { prototype: { with: twoA, entries: twoB } } } = (effect(), globalThis);
const { Array: { prototype: { values: mixedLeaf } }, Object: { fromEntries: mixedStatic } } = (effect(), globalThis);
const { Array: { prototype: { findLast: restLeaf } }, ...restSiblings } = (effect(), globalThis);
const { Array: { prototype: { findIndex: shared } } } = (effect(), globalThis), sibling = 1;
export { sole, soleStatic, twoA, twoB, mixedLeaf, mixedStatic, restLeaf, restSiblings, shared, sibling };
