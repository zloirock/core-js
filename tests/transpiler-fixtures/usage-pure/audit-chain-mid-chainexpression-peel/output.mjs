import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// `(arr?.flat())?.at(0)`: paren-wrapped inner optional call followed by an outer
// optional member-call. oxc emits a nested ChainExpression for the inner segment
// inside the parens. each chain is handled as its own unit: outer chain stops at
// the paren boundary, inner chain visits independently. both polyfills land.
const arr: number[] = [1, 2];
null == (_ref = arr == null ? void 0 : _flatMaybeArray(arr).call(arr)) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);