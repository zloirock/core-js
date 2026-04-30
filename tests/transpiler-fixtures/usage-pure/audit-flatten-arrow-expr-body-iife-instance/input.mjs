// flatten + sibling arrow EXPRESSION body (not block) requiring _ref. arrow expression
// body's `_ref` goes through scope-tracker's `arrowVars` path (different from block-body
// `scopedVars`). consumeRefBindingsInRange must handle both maps so the arrow body's
// block-conversion overwrite doesn't collide with the parent flatten overwrite
const { Array: { from } } = globalThis, kls = (() => [].values())();
export { from, kls };
