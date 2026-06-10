// body-extract fallback path triggered by a rest sibling with a default-value on the
// polyfilled prop: `{from = [], ...rest} = Array`. body-extract emits `let from = _polyfill;`
// at function body top, but the original `= []` user default becomes dead code (polyfill is
// always defined). caller-passed `{from: customFrom}` is also lost - this is the trade-off
// documented for the body-extract path
// NOTE: this DECLARED function is non-exported and every local call leaves the default in
// place, so the resolver's call-site scan proves the lossy emission loses nothing and it
// stays enabled; exported / escaping / overridden functions stay verbatim instead
function run({ from = [], ...rest } = Array) {
  return [from, rest];
}
run();
