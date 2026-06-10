// aliased-with-default `{from: alias = []}` + rest sibling. body-extract emits
// `key: _unusedN` (uniform across all 4 prop-value shapes) so destructure still consumes
// the key and rest exclusion survives. body prepends `let alias = _polyfill;`. parity
// with babel-plugin's unconditional body-extract dispatch
// NOTE: this DECLARED function is non-exported and every local call leaves the default in
// place, so the resolver's call-site scan proves the lossy emission loses nothing and it
// stays enabled; exported / escaping / overridden functions stay verbatim instead
function run({ from: alias = [], ...rest } = Array) {
  return [alias, rest];
}
run();
