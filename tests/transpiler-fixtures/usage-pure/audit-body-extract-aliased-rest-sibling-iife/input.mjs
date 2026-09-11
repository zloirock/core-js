// body-extract for the renamed-alias shape `{from: alias}` (no default) with a rest sibling.
// the body emits `let alias = _polyfill;`, preserving the user's chosen local name; distinct
// keys (`from` / `of`) on separate functions verify per-key dispatch. immediately-invoked twin:
// the lossy emission is sound because every call site is visible.
(function run({ from: arr, ...rest } = Array) {
  return [arr([1]), rest];
})();
(function emit({ of: arrOf, ...rest } = Array) {
  return [arrOf(2, 3), rest];
})();
