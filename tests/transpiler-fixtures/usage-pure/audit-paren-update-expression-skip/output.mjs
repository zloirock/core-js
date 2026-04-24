// compile-time assertion: `createParenthesizedExpressions: true` keeps `(Map)` as a wrapper
// node; the update-target check must peel it so usage-pure does NOT rewrite to `(_Map)++`
// (imports are frozen bindings - assignment throws). update on a global is itself user-bug
// and would ReferenceError in IE 11 regardless, so the statement lives in a dead branch
if (false) {
  (Map)++;
}