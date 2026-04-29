// parser-preserved parens around `Map`/`Promise`/`Set` must be peeled so the read side of
// `--(X)` and `((X))++` still triggers each polyfill. Wrapped in `if (false)` because
// updating a global itself is a user bug; only plugin output is asserted, not runtime
// behavior.
let x = Map;
x++;
if (false) {
  --(Promise);
  ((Set))++;
}
