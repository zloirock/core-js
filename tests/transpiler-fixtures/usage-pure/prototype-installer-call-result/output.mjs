import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _codePointAtMaybeString from "@core-js/pure/actual/string/instance/code-point-at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4;
// `Object.setPrototypeOf(o, P)` hands `o` back over P, so its result dispatches P's family whatever
// `o` was before the install - written in place, held or constructed. a primitive `o` comes back as
// itself, and a prototype that cannot dispatch leaves `o` its own type. distinct method per line
export const a = _atMaybeArray(_ref = Object.setPrototypeOf({
  0: 1,
  length: 1
}, Array.prototype)).call(_ref, -1);
const held = Object.setPrototypeOf({}, Array.prototype);
export const b = _findLastMaybeArray(held).call(held, f);
export const c = _flatMaybeArray(_ref2 = Object.setPrototypeOf(new Foo(), Array.prototype)).call(_ref2);
export const d = _includesMaybeString(_ref3 = Object.setPrototypeOf({}, String.prototype)).call(_ref3, 'x');
export const e = _codePointAtMaybeString(_ref4 = Object.setPrototypeOf('abc', Array.prototype)).call(_ref4, 0);
export const g = Object.setPrototypeOf({}, null).toSorted();