import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
// a re-referenceable destructure receiver carrying a FUNCTION value feeds a nested instance-method
// extraction. the whole declaration is consumed (sole binding), so the receiver lives only in the
// copy - and its function BODY must be polyfilled like babel's re-traversed clone: a global ref and an
// instance call inside the body both substitute (visitor-driven, scope-aware), not left raw. distinct
// instance methods per declaration so each copy is attributable.
const a = _atMaybeArray([() => _Map]);
const b = _includesMaybeArray([() => {
  var _ref;
  return _flatMaybeArray(_ref = [1, 2]).call(_ref);
}]);
export const r = [a, b];