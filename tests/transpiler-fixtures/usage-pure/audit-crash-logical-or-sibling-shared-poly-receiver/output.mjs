import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// usage-pure outer polyfilled method whose receiver is a `||` with the same polyfilled
// sub-expression in both branches, asymmetrically nested (`(A.flat() || A.flat().at(0)).flat()`):
// same nth-recovery root as the conditional case - the shallow branch's slot must not be
// re-targeted by the deeper branch. regression lock
function f(A) {
  var _ref, _ref2;
  return _flatMaybeArray(_ref = _flatMaybeArray(A).call(A) || _at(_ref2 = _flatMaybeArray(A).call(A)).call(_ref2, 0)).call(_ref);
}
f;