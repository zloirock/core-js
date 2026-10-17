import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Each selected receiver evaluates in its own branch; instance reads remain in parameter order.
// Falsy selecting operands retain their value so logical fallbacks choose the same receiver.
const arr = [1, [2]];
const nul = null;
export const viaLogical = function (_ref = nul || arr) {
  let at = _atMaybeArray(_ref);
  return typeof at;
}();