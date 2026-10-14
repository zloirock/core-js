import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5;
// the receiver of an instance dispatch off a proxy nav is memoized, and the memo is where the nav's
// collapse lands. a KEPT chain-assign keeps the probe read, and the plain hop above it throws
// off-window, so the guard tests the hop's value rather than sliding onto the probe; a resolving nav
// memoizes the collapsed root, and a `window` below `self` folds into it as the realm itself.
let w;
export const keptAssignPlainHop = null == (_ref = (w = _globalThis.window).Array) ? void 0 : _nameMaybeFunction(_flatMaybeArray(_ref.prototype));
export const keptAssignDelete = null == (_ref2 = (w = _globalThis.window).Array) ? true : delete _flatMapMaybeArray(_ref2.prototype).name;
export const resolvingNav = null == (_ref3 = _self.Array) ? void 0 : _nameMaybeFunction(_findLastMaybeArray(_ref3.prototype));
export const deepProbeNav = null == (_ref4 = _self.Array) ? void 0 : _findLastIndexMaybeArray(_ref4.prototype);
export const loweredScaffoldDelete = null == (_ref5 = null == _globalThis.window ? void 0 : _self.Array) ? true : delete _toSortedMaybeArray(_ref5.prototype).name;
export { w };