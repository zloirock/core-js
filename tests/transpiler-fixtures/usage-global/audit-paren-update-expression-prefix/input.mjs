// prefix `--(X)` / nested `((X))++` through `createParenthesizedExpressions: true` wrappers
// - all three positions (read, prefix-update, nested-postfix) inject the polyfill because
// the read side is always reached. gated update expressions live behind `if (false)` because
// assigning to a global is user-bug; plugin output is the subject of the test, not runtime
let x = Map;
x++;
if (false) {
  --(Promise);
  ((Set))++;
}
