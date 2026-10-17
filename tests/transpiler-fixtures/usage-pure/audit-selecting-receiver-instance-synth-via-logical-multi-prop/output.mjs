import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Each selected receiver evaluates in its own branch; instance reads remain in parameter order.
// Falsy selecting operands retain their value so logical fallbacks choose the same receiver.
const arr = [1, [2]];
const nul = null;
export const viaLogicalMultiProp = function (_ref = nul || arr) {
  let at = _atMaybeArray(_ref);
  let flat = _flatMaybeArray(_ref);
  return typeof at + typeof flat;
}();