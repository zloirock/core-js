import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A computed iterator claim keeps its member target and does not read native Symbol.
export const box = {};
box.iterator = (_ref = _getIteratorMethod(_globalThis.Array.prototype)) === void 0 ? null : _ref;