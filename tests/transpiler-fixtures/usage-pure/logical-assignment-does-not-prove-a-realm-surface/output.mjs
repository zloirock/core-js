import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4;
// A logical write can retain a foreign object with its own self and items.
export const first = null == (_ref = (options.root ||= _globalThis).self) ? void 0 : _at(_ref2 = _ref.items).call(_ref2, 0);
export const last = null == (_ref3 = options.root ??= _globalThis) ? void 0 : _at(_ref4 = _ref3.self.items).call(_ref4, -1);