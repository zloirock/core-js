import _Array$from from "@core-js/pure/actual/array/from";
// aliased-with-default `{from: alias = []}` + rest sibling. body-extract rewrites the prop
// value to `key: _unusedN` (uniform across all 4 prop-value shapes) so destructure still
// consumes the key and rest exclusion survives, then prepends `let alias = _polyfill;`.
// immediately-invoked twin: the lossy emission is sound because the single call site is visible.
(function run({
  from: _unused,
  ...rest
} = Array) {
  let alias = _Array$from;
  return [alias, rest];
})();