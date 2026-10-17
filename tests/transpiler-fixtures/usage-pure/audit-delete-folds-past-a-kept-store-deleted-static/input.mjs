// A user write inside a deleted navigation is the source's own act, so it keeps the short-circuit its value spells: a `?.` above
// the store decides whether the delete happens at all, and its guard takes the whole operator, deleting through the stored value
// in its alternate - around the operand alone it would hand `delete` a conditional, which deletes nothing.
let deleted, statik, claimless, stacked, alias2, kept, below;
// ... whatever constructor the tail reads after the store, or none at all
export const deletedStatic = delete (statik = globalThis.window?.self)?.Number.MAX_SAFE_INTEGER;
export { statik };
