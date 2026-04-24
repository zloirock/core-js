// compile-time assertion: `createParenthesizedExpressions: true` keeps `(Map)` as a wrapper
// node; the update-operand check must peel it so usage-global injects the polyfill for the
// read side of `(Map)++`. update on a global is user-bug (assignment coerces to NaN), gated
// behind `if (false)` - the test subject is plugin output, not runtime semantics of the user bug
if (false) {
  (Map)++;
}
