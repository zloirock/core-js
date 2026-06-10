import _Array$from from "@core-js/pure/actual/array/from";
// renamed-local binding (`from: alias`) read by a sibling in-pattern default (`dup = alias`).
// the read-detection keys on the LOCAL binding name, not the property key, so relocating
// `alias` via body-extract is correctly avoided and the emitter keeps `alias` bound through
// inline-default. distinct static (`from`) from the shorthand `of` cases
// NOTE: this DECLARED function is non-exported and every local call leaves the default in
// place, so the resolver's call-site scan proves the lossy emission loses nothing and it
// stays enabled; exported / escaping / overridden functions stay verbatim instead
function make({
  from: alias = _Array$from,
  dup = alias,
  ...rest
} = Array) {
  return [alias([1]), dup, rest];
}
make();