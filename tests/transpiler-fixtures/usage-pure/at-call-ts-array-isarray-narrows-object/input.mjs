// regression: `object` is wide enough that `Array.isArray(x)` should narrow it,
// but the previous logic stopped at the binding-level type and never re-tried
// guard narrowing once `resolveBindingType` produced a hit. expect `_atMaybeArray`.
function f(x: object) {
  if (Array.isArray(x)) return x.at(0);
}
