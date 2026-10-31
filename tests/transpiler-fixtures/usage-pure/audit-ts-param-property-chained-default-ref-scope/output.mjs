import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Chained dispatches in a parameter-property default share that evaluation's local memos.
// Constructor-body vars are invisible from the parameter list; enclosing vars would
// share receiver state across reentrant constructions.
function getArr() {
  return [1, [2]];
}
class C {
  constructor(public x = (() => {
    var _ref, _ref2;
    return _atMaybeArray(_ref = _flatMaybeArray(_ref2 = getArr()).call(_ref2)).call(_ref, 0);
  })()) {}
}
new C();