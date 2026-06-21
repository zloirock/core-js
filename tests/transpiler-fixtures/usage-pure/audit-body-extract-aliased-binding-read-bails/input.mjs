// renamed-local binding (`from: alias`) read by a sibling in-pattern default (`dup = alias`).
// read-detection keys on the LOCAL binding name, not the property key, so `alias` is not
// relocated via body-extract and stays bound through inline-default. non-exported declared
// function with all call sites visible, so the lossy param emission is proven safe and enabled.
function make({ from: alias, dup = alias, ...rest } = Array) {
  return [alias([1]), dup, rest];
}
make();
