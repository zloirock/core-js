import _Array$from from "@core-js/pure/actual/array/from";
// renamed-local binding (`from: alias`) read by a sibling in-pattern default (`dup = alias`).
// read-detection keys on the LOCAL binding name, not the property key, so `alias` is not
// relocated via body-extract and stays bound through inline-default. non-exported declared
// function with all call sites visible, so the lossy param emission is proven safe and enabled.
function make({
  from: alias = _Array$from,
  dup = alias,
  ...rest
} = Array) {
  return [alias([1]), dup, rest];
}
make();