import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// usage-pure outer polyfilled method whose receiver is a conditional with the SAME polyfilled
// sub-expression in both branches, asymmetrically nested (`(c ? A.flat() : A.flat().at(0)).flat()`):
// the shallow branch's slot must not be re-targeted by the deeper branch's nth-recovery, or the
// compose corrupts a sibling and a later locate crashes. regression lock
function f(c, A) {
  var _ref, _ref2;
  return _flatMaybeArray(_ref = c ? _flatMaybeArray(A).call(A) : _at(_ref2 = _flatMaybeArray(A).call(A)).call(_ref2, 0)).call(_ref);
}
f;