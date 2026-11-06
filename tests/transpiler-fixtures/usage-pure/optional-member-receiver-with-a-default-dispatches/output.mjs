import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// a defaulted instance read off an optional member dispatches as off the plain member: the `?.` read is one
// member in both dialects, and the guard keeps the default for an undefined dispatch
export const flat = (_ref = _flatMaybeArray(box?.list)) === void 0 ? null : _ref;
export const at = (_ref2 = _at(box?.['items'])) === void 0 ? null : _ref2;
let includes;
includes = (_ref3 = _includes(box?.text)) === void 0 ? null : _ref3;
export { includes };