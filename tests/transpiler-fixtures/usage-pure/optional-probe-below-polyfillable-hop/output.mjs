import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// a `?.` over a hop the build serves is dead once substituted, but a probe below that hop can still
// short-circuit the whole chain, so that probe takes the guard. a kept write of `window` under a doubled
// `self` hop is one: where `window` is absent the chain answers undefined instead of reading off the
// void store
let n;
export const instanceClaim = null == (_ref = n = _globalThis.window) ? void 0 : _at(_ref2 = _ref.getBox()).call(_ref2, 0);
export const combinedClaim = null == (_ref3 = n = _globalThis.window) || null == (_ref4 = _flatMaybeArray(_ref5 = _ref3.box)) ? void 0 : _findLastMaybeArray(_ref6 = _ref4.call(_ref5)).call(_ref6, Boolean);
// NEGATIVE: a probe below that cannot short-circuit is dead with the hop above it
export const deadProbe = _nameMaybeFunction(_WeakSet);
export { n };