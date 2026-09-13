import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// A call carried into a rebuilt realm-navigation guard keeps the claims inside its arguments.
// The tail uses a different method so the argument's import is independently observable.
const realm = () => _globalThis;
const values = [1, 2, 3];
export const result = null == (realm(_atMaybeArray(values).call(values, 0)), _self) ? void 0 : _includesMaybeArray(_ref = _Array$of(9)).call(_ref, 9);