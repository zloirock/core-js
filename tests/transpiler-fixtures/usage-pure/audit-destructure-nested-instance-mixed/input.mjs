// nested STATIC (`from` on Array) + nested INSTANCE (`flat` on `arr`) in sibling branches, no side-effect
// keys. both polyfill: the static branch flattens (drops to `const f = _Array$from`), the instance branch
// residual-extracts `const m = _flatMaybeArray(arr)` (receiver `arr` walked from the RHS) and keeps the
// key renamed. both extractions emit in SOURCE order (a branch dispatched after the flatten claimed the
// declaration joins the claimed slot's extraction list instead of inserting above the render)
const arr = [1, [2]];
const { x: { from: f }, y: { flat: m } } = { x: Array, y: arr };
