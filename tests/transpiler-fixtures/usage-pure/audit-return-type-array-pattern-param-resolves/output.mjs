import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// ArrayPattern parameter symmetric to the ObjectPattern case:
// `function f([head, tail])` with `f([[1,2,3], 'tail'])` resolves `head` via key
// path `[0]` to the array-literal arg's element at index 0. without the pattern
// walk the param identity check misses and `.at(0)` degrades to the generic polyfill.
function f([head, tail]) {
  return head;
}
_atMaybeArray(_ref = f([[1, 2, 3], 'tail'])).call(_ref, 0);