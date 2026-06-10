// renamed-local binding (`from: alias`) read by a sibling in-pattern default (`dup = alias`).
// the read-detection keys on the LOCAL binding name, not the property key, so relocating
// `alias` via body-extract is correctly avoided and the emitter keeps `alias` bound through
// inline-default. distinct static (`from`) from the shorthand `of` cases
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function make({ from: alias, dup = alias, ...rest } = Array) {
  return [alias([1]), dup, rest];
})();
