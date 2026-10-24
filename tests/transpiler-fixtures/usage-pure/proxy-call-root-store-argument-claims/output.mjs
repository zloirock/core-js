import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// A kept assignment of a realm-returning call carries its argument claims through guard rebuilding.
// The stored root keeps its value while the plain middle navigation lands on the backed leaf.
const realm = () => _globalThis;
const values = [1, 2, 3];
let stored;
export const result = null == (stored = realm(_atMaybeArray(values).call(values, 0)), _self) ? void 0 : _includesMaybeArray(_ref = _Array$of(9)).call(_ref, 9);
export { stored };