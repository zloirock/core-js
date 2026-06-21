// `(globalThis?.[X]).Y.at?.(0)` - computed leaf access through a Paren wrapper. the rebuild
// must distinguish a computed hop (emit `[prop]` / `?.[prop]`) from a non-computed one
// (`.prop` / `?.prop`). without that branch, computed `?.[X]` would emit as `.X` (lost
// brackets) or `?.X` (treats as bare name) - either shifts the runtime property name from
// `X` (the variable) to `"X"` (the literal string).
const X = 0;
(globalThis?.[X]).Y.at?.(0);
