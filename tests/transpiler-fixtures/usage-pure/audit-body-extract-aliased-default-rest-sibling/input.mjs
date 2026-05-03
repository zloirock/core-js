// aliased-with-default `{from: alias = []}` + rest sibling. body-extract emits
// `key: _unusedN` (uniform across all 4 prop-value shapes) so destructure still consumes
// the key and rest exclusion survives. body prepends `let alias = _polyfill;`. parity
// with babel-plugin's unconditional body-extract dispatch
function run({ from: alias = [], ...rest } = Array) {
  return [alias, rest];
}
run();
