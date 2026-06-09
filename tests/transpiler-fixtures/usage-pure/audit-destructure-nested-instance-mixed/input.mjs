// nested STATIC (`from` on Array) + nested INSTANCE (`flat` on `arr`) in sibling branches, no side-effect
// keys. both polyfill: the static branch flattens (drops to `const f = _Array$from`), the instance branch
// residual-extracts `const m = _flatMaybeArray(arr)` (receiver `arr` walked from the RHS) and keeps the
// key renamed. the two extracted bindings are PURE, so their relative order is unobservable - babel emits
// the static first (source order), unplugin the instance first; the sidecar records that cosmetic gap
const arr = [1, [2]];
const { x: { from: f }, y: { flat: m } } = { x: Array, y: arr };
