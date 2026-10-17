import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Each selected receiver evaluates in its own branch; instance reads remain in parameter order.
// Falsy selecting operands retain their value so logical fallbacks choose the same receiver.
const arr = [1, [2]];
// controls: the shapes the gate DOES admit still swap - a bare binding at any prop count, and a
// side-effect-free member read at a single prop
export const viaBinding = function (_ref = arr) {
  let at = _atMaybeArray(_ref);
  return typeof at;
}();