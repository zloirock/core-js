// bare shorthand `{from}` with a rest sibling bails to body-extract: emit `let from = _polyfill`
// at body top, rewrite the prop value so the destructure still consumes the key with rest
// exclusion preserved. distinct keys (`from` / `of`) on separate functions verify per-key dispatch.
// immediately invoked, so caller-lossy param emit is sound (every call site visible)
(function run({ from, ...rest } = Array) {
  return [from([1]), rest];
})();
(function emit({ of, ...rest } = Array) {
  return [of(2, 3), rest];
})();
