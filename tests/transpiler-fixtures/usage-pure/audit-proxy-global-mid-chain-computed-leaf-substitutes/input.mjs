// `(globalThis?.[X]).Y.at?.(0)` - computed leaf access through a Paren wrapper. rebuild
// must distinguish hop.computed (emit `[propText]` / `?.[propText]`) from non-computed
// (`.propText` / `?.propText`). without the branch, computed `?.[X]` would emit as
// `.X` (lost brackets) or `?.X` (treats as bare name) - either case shifts the runtime
// property name from `X` (the variable) to `"X"` (the literal string).
const X = 0;
(globalThis?.[X]).Y.at?.(0);
