import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// chained polyfill in a TS parameter-property default: BOTH memoize refs must hoist above the class,
// not into the constructor body. a body var is invisible to the parameter default, which evaluates
// in the parameter scope - it would throw a ReferenceError once the parameter-property is desugared
function getArr() {
  return [1, [2]];
}
class C {
  constructor(public x = _atMaybeArray(_ref = _flatMaybeArray(_ref2 = getArr()).call(_ref2)).call(_ref, 0)) {}
}
new C();