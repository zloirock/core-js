// User-shape `_ref = foo()` inside a nested function body must NOT be adopted by the
// orphan heuristic - the var-scope boundary check during binding-name collection downgrades
// `atTopLevel=false` once a function body is entered.
function inner() {
  _ref = helper();
}
[1, 2, 3].at(0);
function helper() { return 42; }
