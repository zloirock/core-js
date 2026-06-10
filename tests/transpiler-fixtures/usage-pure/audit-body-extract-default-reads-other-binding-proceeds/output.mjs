import _Array$of from "@core-js/pure/actual/array/of";
// negative case: the sibling default reads an OUTER binding (`dflt = seed`), NOT the polyfilled
// binding, so there is no param-scope read of `of` to strand. body-extract proceeds normally -
// `of` relocates to a body `let` and its destructure slot becomes `of: _unused`. confirms the
// read-detection is name-targeted, not a blanket "any sibling default present" bail
// NOTE: this DECLARED function is non-exported and every local call leaves the default in
// place, so the resolver's call-site scan proves the lossy emission loses nothing and it
// stays enabled; exported / escaping / overridden functions stay verbatim instead
const seed = [0];
function g({
  of: _unused,
  dflt = seed,
  ...rest
} = Array) {
  let of = _Array$of;
  return [of, dflt, rest];
}
g();