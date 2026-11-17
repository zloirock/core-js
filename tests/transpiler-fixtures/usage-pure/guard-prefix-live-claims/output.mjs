import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3;
// A prefix runs once and its own polyfill claims survive the outer guard render.
export const instance = null == (null == (effect(), _globalThis.window) ? void 0 : _self) ? void 0 : _atMaybeArray(_ref = _Array$of(8)).call(_ref, 0);
export const prefix = (_atMaybeArray(_ref2 = [2]).call(_ref2, 0), null == _globalThis.window ? void 0 : _Array$of(8));
export const sealed = ((null == (effect(), _globalThis.window) ? void 0 : _self).Array, _Array$of)(8);
export const noPrefix = null == _globalThis.window ? void 0 : _atMaybeArray(_ref3 = _Array$of(8)).call(_ref3, 0);