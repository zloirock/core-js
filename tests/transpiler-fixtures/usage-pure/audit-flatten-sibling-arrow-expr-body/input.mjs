// multi-decl flatten + sibling arrow with expression body (no block) needing instance
// dispatch. arrow-body wrap inserts a NEW block + var _ref + return - these wraps land
// at the same byte range as the sibling, potentially overlapping the multi-decl overwrite
const { Array: { from } } = globalThis, val = (() => [].values())();
export { from, val };
