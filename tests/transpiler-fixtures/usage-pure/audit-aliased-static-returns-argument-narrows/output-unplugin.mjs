import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
var _ref, _ref2;
// `Object.freeze` / `Object.defineProperty` return their first argument unchanged (returnsArgument),
// so the call result keeps that argument's concrete container type. an ALIASED static call must honor
// this exactly like the direct member call - dropping to the registry's generic 'Object' would lose
// the array narrow and emit the generic instance helper instead of the array-specific one.
const freeze = _Object$freeze;
const defineProperty = _Object$defineProperty;
export const a = _includesMaybeArray(_ref = freeze([1, 2])).call(_ref, 1);
export const b = _atMaybeArray(_ref2 = defineProperty([3, 4], 'x', {})).call(_ref2, 0);
