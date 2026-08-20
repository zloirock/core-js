// nested STATIC (`from` on Array) + nested INSTANCE (`flat` on `arr`) in sibling branches, no
// side-effect keys. both polyfill: `const f = _Array$from` and `const m = _flatMaybeArray(arr)`.
// the declaration binds TWO names, so the residual is kept (elimination needs a sole binding).
// the binding count is taken from the ORIGINAL pattern, keeping keep-vs-drop identical across both emitters.
const arr = [1, [2]];
const { x: { from: f }, y: { flat: m } } = { x: Array, y: arr };
