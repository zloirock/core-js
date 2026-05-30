import _Array$of from "@core-js/pure/actual/array/of";
// negative case: the sibling default reads an OUTER binding (`dflt = seed`), NOT the polyfilled
// binding, so there is no param-scope read of `of` to strand. body-extract proceeds normally -
// `of` relocates to a body `let` and its destructure slot becomes `of: _unused`. confirms the
// read-detection is name-targeted, not a blanket "any sibling default present" bail
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