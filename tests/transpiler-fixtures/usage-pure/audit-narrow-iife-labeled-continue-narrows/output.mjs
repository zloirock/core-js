import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// labeled `continue` targeting a label in the descent path is local: `outer: for (...)
// { continue outer; }` - the continue is caught by the descent through LabeledStatement
// which adds 'outer' to the labels set. without label tracking, the labeled continue
// would be treated as a function-level exit and bail the straight-line assignment
let x = [1, 2, 3];
let n = 3;
(() => {
  outer: for (let i = 0; i < n; i++) {
    continue outer;
  }
  x = "hello";
})();
_atMaybeString(x).call(x, 0);