// aliased-with-default `{from: alias = []}` + rest sibling. body-extract rewrites the prop
// value to `key: _unusedN` (uniform across all 4 prop-value shapes) so destructure still
// consumes the key and rest exclusion survives, then prepends `let alias = _polyfill;`.
// non-exported declared function: all call sites visible, so the lossy emission is enabled.
function run({ from: alias = [], ...rest } = Array) {
  return [alias, rest];
}
run();
