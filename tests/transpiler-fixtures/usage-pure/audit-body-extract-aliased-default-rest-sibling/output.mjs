import _Array$from from "@core-js/pure/actual/array/from";
// aliased-with-default `{from: alias = []}` + rest sibling. body-extract emits
// `key: _unusedN` (uniform across all 4 prop-value shapes) so destructure still consumes
// the key and rest exclusion survives. body prepends `let alias = _polyfill;`. parity
// with babel-plugin's unconditional body-extract dispatch
function run({
  from: _unused,
  ...rest
} = Array) {
  let alias = _Array$from;
  return [alias, rest];
}
run();