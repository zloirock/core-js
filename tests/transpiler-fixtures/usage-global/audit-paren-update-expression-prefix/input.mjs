// prefix `--(X)` / nested `((X))++` through paren wrappers preserved as AST nodes - all
// three positions (read, prefix-update, nested-postfix) inject the polyfill because the
// read side is always reached. Update statements live behind `if (false)` because
// assigning to a global is itself user-bug; plugin output is the subject of the test,
// not runtime
let x = Map;
x++;
if (false) {
  --(Promise);
  ((Set))++;
}
