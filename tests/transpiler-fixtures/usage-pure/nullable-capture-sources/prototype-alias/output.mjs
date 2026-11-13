import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A constructor name behind an alias does not prove its prototype read safe.
const held = _globalThis.window?.Array;
export const includes = (_ref = held.prototype, null == _ref ? _ref[""] : (effect(), _includesMaybeArray(_ref)));