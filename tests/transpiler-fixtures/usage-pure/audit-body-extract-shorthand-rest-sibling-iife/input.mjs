// body-extract for the bare shorthand `{from}` with a rest sibling. prop binding-identifier resolver
// returns the shorthand identifier directly. emits `let from = _polyfill;` at body top and
// rewrites the prop value to `_unused` so the destructure still consumes the key (rest
// exclusion preserved). complementary leaf to the aliased / default-value variants of
// body-extract. distinct keys (`from` / `of`) on separate functions verify per-key dispatch
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function run({ from, ...rest } = Array) {
  return [from([1]), rest];
})();
(function emit({ of, ...rest } = Array) {
  return [of(2, 3), rest];
})();
