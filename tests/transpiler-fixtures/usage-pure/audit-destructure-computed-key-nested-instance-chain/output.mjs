import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// a destructure COMPUTED KEY holding a nested instance chain (`[[9].flat().at(0)]`) routes through
// the range compose via the key path (not the default path), folding the inner `.flat` into the
// outer `.at` so the two overwrites don't flat-splice into an overlap
const {
  [_atMaybeArray(_ref = _flatMaybeArray(_ref2 = [9]).call(_ref2)).call(_ref, 0)]: x
} = obj;
x;