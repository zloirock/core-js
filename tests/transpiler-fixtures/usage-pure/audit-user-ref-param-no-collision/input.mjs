// user code already binds `_ref` / `_ref2`; plugin's UID allocator must pick a free slot
// (`_ref3`) for its own memoization. downstream ref-param normalization must not slice
// the user's bindings even though they share the plugin's prefix
const _ref = { items: [1, 2, 3] };
const _ref2 = { items: [4, 5, 6] };
const first = _ref.items?.at?.(0);
const second = _ref2.items?.at?.(0);
export { first, second };
