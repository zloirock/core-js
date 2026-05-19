import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// ArrayPattern parameter symmetric to the ObjectPattern case:
// `function f([head, tail]) { return head }` with `f([[1,2,3], 'tail'])` resolves
// `head` through `findPatternKeyPath` -> `[0]` -> the array-literal arg's element
// at index 0. without the pattern walk the param's identity check missed and the
// body fold dropped null, degrading `.at(0)` to the generic instance polyfill
function f([head, tail]) {
  return head;
}
_atMaybeArray(_ref = f([[1, 2, 3], 'tail'])).call(_ref, 0);