// compile-time assertion: when the parser keeps parens as AST nodes, the wrapper around
// `(Map)` must be peeled by the update-target check so usage-pure does NOT rewrite to
// `(_Map)++` (imports are frozen bindings - assignment throws). Update on a global is
// itself a user-bug and would ReferenceError in IE 11 regardless, so the statement lives
// in a dead branch
if (false) {
  (Map)++;
}
