import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref;
// Nested Symbol.iterator pattern values keep inner defaults and their polyfills intact.
// Literal and member receivers preserve property order across sibling properties,
// computed keys, declaration hosts and deeper nested patterns.
// Each receiver is evaluated once and unrelated receiver captures remain independent.

// A literal receiver combines an inner polyfillable default with a sibling property.
const _ref2 = [1, 2, 3],
  {
    next = _flatMaybeArray(_ref = [1]).call(_ref)
  } = _getIteratorMethod(_ref2),
  {
    other
  } = _ref2;
export const viaLiteralDefault = [next, other];