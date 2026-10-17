import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A folded guard tail ends in a bare ternary, the loosest expression there is: an OPERAND slot on either side of an operator
// swallows it, so the fold owes that consumer its parens.
export const eqRight = 1 === (null == _globalThis.window ? void 0 : _atMaybeArray(_ref = _Array$of(1)).call(_ref, 0));