import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
// A nested instance method with an outer sibling captures the complete host once. The function
// value is rewritten in that initializer, the method dispatch reads the captured nested property,
// and the later sibling reads the same capture. Distinct methods keep the two dispatches
// attributable.
const _ref = {
  y: [() => _Map],
  k: 1
};
const a = _atMaybeArray(_ref.y);
const {
  k
} = _ref;
const _ref3 = {
  z: [() => {
    var _ref2;
    return _flatMaybeArray(_ref2 = [1, 2]).call(_ref2);
  }],
  j: 2
};
const b = _includesMaybeArray(_ref3.z);
const {
  j
} = _ref3;
export const r = [a, b, k, j];