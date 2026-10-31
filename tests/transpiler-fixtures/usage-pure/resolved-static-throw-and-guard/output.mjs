import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// A sealed or alias-held receiver throws before the static's arguments.
// A live optional keeps the claim and its arguments inside the non-null branch.
const alias = _globalThis.window;
export const held = (alias.Array.from, _Array$from)(argument());
export const live = null == _globalThis.window ? void 0 : _Array$from(argument());
export const sealed = ((null == _globalThis.window ? void 0 : _self).Array, _Array$from)(argument());
export const computed = (_ref = alias[key(), 'self'].Array, _ref === Array ? _Array$from(argument()) : _ref.from(argument()));