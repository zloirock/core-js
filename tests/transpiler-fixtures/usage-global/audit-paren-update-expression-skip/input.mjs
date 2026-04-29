// parser-preserved parens around `Map` must be peeled so the read side of `(Map)++` still
// triggers the polyfill. Wrapped in `if (false)` because updating a global itself is a
// user bug; only plugin output is asserted, not runtime behavior.
if (false) {
  (Map)++;
}
