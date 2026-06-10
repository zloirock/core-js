// aliased-with-default `{from: alias = []}` + rest sibling. body-extract emits
// `key: _unusedN` (uniform across all 4 prop-value shapes) so destructure still consumes
// the key and rest exclusion survives. body prepends `let alias = _polyfill;`. parity
// with babel-plugin's unconditional body-extract dispatch
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function run({ from: alias = [], ...rest } = Array) {
  return [alias, rest];
})();
