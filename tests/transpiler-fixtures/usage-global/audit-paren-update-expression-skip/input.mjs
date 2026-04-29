// compile-time assertion: when the parser keeps parens as AST nodes, the wrapper around
// `(Map)` must be peeled by the update-operand check so usage-global injects the polyfill
// for the read side of `(Map)++`. Updating a global is itself a user-bug (assignment
// coerces to NaN), gated behind `if (false)` - the test subject is plugin output, not
// runtime semantics of the user bug
if (false) {
  (Map)++;
}
