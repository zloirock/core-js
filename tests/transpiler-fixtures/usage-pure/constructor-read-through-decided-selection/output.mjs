import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3;
// A constructor read through a selection this build decides is the operand it yields: a `new`, a
// static call and an `instanceof` over it type their result or narrow their receiver by that
// constructor alone. An undecided selection keeps both.
export const made = _atMaybeArray(_ref = new Array()).call(_ref, 0);
export const converted = _includesMaybeArray(_ref2 = _Array$from(input)).call(_ref2, 1);
export function narrowed(value) {
  if (value instanceof String) return value.concat('d');
}
export const undecided = _sliceMaybeArray(_ref3 = new (_globalThis.flag ? Array : String)()).call(_ref3, 1);